'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useRef, useState } from 'react'
import type { RoomItem } from './RoomCard'
import CoinFlip3D, { CoinFlip3DHandle } from '@/components/CoinFlip3D'
import LoadingCircleSpinner from '@/components/LoadingCircleSpinner'

export default function RoomItemModal({
  item,
  onClose,
}: {
  item: RoomItem | null
  onClose: VoidFunction
}) {
  const coinRef = useRef<CoinFlip3DHandle>(null)
  const [mount3D, setMount3D] = useState(false)

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          {/* backdrop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/70"
            onClick={() => {
              setMount3D(false) // cleanup before close
              onClose()
            }}
          />

          {/* card */}
          <motion.div
            layoutId={`card-${item.id}`}
            className="relative pointer-events-auto w-[92vw] max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-dark-gray shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media area – shared layout with placeholder → CoinFlip3D */}
            <motion.div
              layoutId={`image-${item.id}`}
              className="relative h-64 bg-background sm:h-80"
              onLayoutAnimationComplete={() => {
                // delay mounting so the modal open animation is smooth
                setTimeout(() => setMount3D(true), 150)
              }}
            >
              {/* Placeholder (static image) */}
              {!mount3D && <LoadingCircleSpinner className="absolute inset-0" />}

              {/* 3D Coin with fade-in */}
              {mount3D && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <CoinFlip3D
                    ref={coinRef}
                    showButton={false}
                    className="h-full"
                    onResult={(r) => console.log('Result', r)}
                  />
                </motion.div>
              )}
            </motion.div>

            <div className="p-5">
              <motion.div layoutId={`title-${item.id}`} layout="position">
                <div className="text-xs uppercase tracking-wide text-white/70">{item.category}</div>
                <h2 className="mt-1 text-2xl font-bold text-white">{item.title}</h2>
              </motion.div>

              <motion.p
                className="mt-3 text-white/80"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                This is a detail view. Put description, controls, or actions here.
              </motion.p>

              <motion.div className="mt-4 flex items-center gap-2" layout="position">
                <motion.button
                  layoutId={`button-${item.id}`}
                  onClick={() => {
                    setMount3D(false) // unmount WebGL before closing
                    onClose()
                  }}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black cursor-pointer"
                >
                  Close
                </motion.button>

                {/* External trigger */}
                <button
                  onClick={() => coinRef.current?.spin()}
                  className="rounded bg-primary px-4 py-2 text-sm font-semibold text-black"
                  disabled={!mount3D}
                >
                  Spin Outside
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
