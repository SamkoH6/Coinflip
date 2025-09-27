'use client'

import { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react'
import { Tabs } from '@/components/Tabs'
import { AmountInput } from '@/components/AmountInput'
import AmountSlider from '@/components/AmountSlider'
import { Button } from '@/components/Button'
import { motion, type Transition } from 'motion/react'

const spring: Transition = { type: 'spring', stiffness: 300, damping: 30 }

/** AutoCollapse: animates height both open and close (no 'auto' on exit). */
function AutoCollapse({
  open,
  children,
  className,
  mt = 20, // marginTop when open
}: {
  open: boolean
  children: React.ReactNode
  className?: string
  mt?: number
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState(0)

  // Measure content height
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    setMeasured(el.scrollHeight)
  }, [open])

  // Track changes within content (e.g., input text changing height)
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setMeasured(el.scrollHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        height: open ? measured : 0,
        opacity: open ? 1 : 0,
        marginTop: open ? mt : 0,
      }}
      transition={spring}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}

export function Sidebar() {
  const options = useMemo(
    () => [
      { value: 'classic', label: 'Classic' },
      { value: 'dynamic', label: 'Dynamic' },
    ],
    [],
  )

  const [mode, setMode] = useState<string | number>(options[0].value)

  // Main amount
  const max = 100
  const [amount, setAmount] = useState(0)
  const handleHalf = () => setAmount(Math.floor(amount / 2))
  const handleDouble = () => setAmount(Math.min(amount * 2, max))

  // Dynamic-only: Win %
  const [winPct, setWinPct] = useState(50)
  const pctMin = 1
  const pctMax = 99

  const [side, setSide] = useState<'heads' | 'tails' | 'random' | null>(null)
  const isDynamic = mode === 'dynamic'

  return (
    <motion.div
      className="flex h-full w-full flex-col p-4 justify-center sm:justify-start"
      layout
      transition={spring}
    >
      {/* Top section */}
      <motion.div className="flex sm:flex-1 flex-col" layout transition={spring}>
        <div className="flex justify-center">
          <Tabs options={options} value={mode} onChange={setMode} />
        </div>

        <motion.div layout transition={spring} className="mt-5">
          <AmountInput
            value={amount}
            onChange={setAmount}
            onHalf={handleHalf}
            onDouble={handleDouble}
            badge="G"
            min={1}
            max={max}
          />
        </motion.div>

        <motion.div layout transition={spring} className="mt-5">
          <AmountSlider min={1} max={max} value={amount} onChange={setAmount} />
        </motion.div>

        {/* Dynamic-only block directly under the main slider (smooth open & close) */}
        <AutoCollapse open={isDynamic} mt={20} className="overflow-hidden">
          <div className="mb-3 text-sm text-white/80">Win percentage</div>

          <div className="space-y-3 pb-1">
            <AmountInput
              value={winPct}
              onChange={(v) => setWinPct(Math.min(Math.max(v, pctMin), pctMax))}
              onHalf={() => setWinPct(Math.max(Math.floor(winPct / 2), pctMin))}
              onDouble={() => setWinPct(Math.min(winPct * 2, pctMax))}
              badge="%"
              min={pctMin}
              max={pctMax}
            />
            <AmountSlider
              min={pctMin}
              max={pctMax}
              value={winPct}
              onChange={(v) => setWinPct(Math.min(Math.max(v, pctMin), pctMax))}
            />
          </div>
        </AutoCollapse>

        {/* Buttons (layout anim keeps them gliding up/down smoothly) */}
        <div className="mt-5">
          <motion.div layout transition={spring} className="space-y-2">
            <Button
              onClick={() => setSide('random')}
              className={`w-full px-4 py-3 ${
                side === 'random'
                  ? 'bg-primary text-black'
                  : 'bg-light-gray text-white hover:bg-white/15'
              }`}
            >
              Random
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSide('heads')}
                className={`
    px-4 py-3
    ${side === 'heads' ? 'bg-primary text-black' : 'bg-light-gray text-white hover:bg-white/15'}
  `}
              >
                Heads
              </Button>
              <Button
                onClick={() => setSide('tails')}
                className={`
    px-4 py-3
    ${side === 'tails' ? 'bg-primary text-black' : 'bg-light-gray text-white hover:bg-white/15'}
  `}
              >
                Tails
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom button */}
      <motion.div className="mt-4" layout transition={spring}>
        <Button className="w-full bg-primary font-bold text-xl text-black px-4 py-3">Play</Button>
      </motion.div>
    </motion.div>
  )
}
