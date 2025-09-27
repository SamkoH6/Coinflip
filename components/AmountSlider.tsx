'use client'

import * as Slider from '@radix-ui/react-slider'
import { useEffect, useState, useCallback } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

type Props = {
  min?: number
  max?: number
  value: number // external value (from input, etc.)
  onChange: (v: number) => void
}

export default function AmountSlider({ min = 0, max = 100, value, onChange }: Props) {
  // Track whether user is dragging (so we don't animate those updates)
  const [isDragging, setDragging] = useState(false)

  // During drag we render from this local value (instant)
  const [live, setLive] = useState(value)

  // Spring to smooth only external changes
  const motionVal = useMotionValue(value)
  const springVal = useSpring(motionVal, { stiffness: 200, damping: 25 })

  // Subscribe spring -> animated number for Slider when NOT dragging
  const [animated, setAnimated] = useState(value)
  useEffect(() => springVal.on('change', (v) => setAnimated(v)), [springVal])

  // When external value changes, animate to it (only if not dragging)
  useEffect(() => {
    if (!isDragging) {
      motionVal.set(value) // triggers spring animation → animated
      setLive(value) // keep local in sync for next drag start
    }
  }, [value, isDragging, motionVal])

  // Handlers
  const handleStart = useCallback(() => setDragging(true), [])
  const handleEnd = useCallback(() => {
    setDragging(false)
    // ensure spring starts from the drag's final value
    motionVal.set(live)
  }, [live, motionVal])

  const handleChange = useCallback(
    (vals: number[]) => {
      const v = vals[0] ?? min
      setLive(v) // instant local update while dragging
      onChange(v) // lift to parent (keeps state single source of truth)
    },
    [min, onChange],
  )

  // While dragging -> show `live` (instant). Otherwise -> show `animated` (smoothed).
  const sliderValue = isDragging ? live : animated

  return (
    <div className="relative flex h-5 w-full select-none items-center">
      <Slider.Root
        className="relative flex h-full w-full items-center touch-none"
        value={[sliderValue]}
        min={min}
        max={max}
        step={1}
        onValueChange={handleChange}
        // Radix doesn't expose onDragStart/End, so use pointer events
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerCancel={handleEnd}
        onBlur={handleEnd} // keyboard/end-of-interaction safety
      >
        <Slider.Track className="relative z-0 h-[3px] flex-grow rounded-full bg-background">
          <Slider.Range className="absolute z-0 h-full rounded-full bg-white" />
        </Slider.Track>

        <Slider.Thumb
          aria-label="Amount"
          className="relative z-10 block h-5 w-5 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Slider.Root>
    </div>
  )
}
