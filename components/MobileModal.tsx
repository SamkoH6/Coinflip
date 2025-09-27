'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react'

export default function MobileModal({
  open,
  onClose,
  children,
  className = '',
  overlayClassName = '',
}: {
  open: boolean
  onClose: VoidFunction
  children: React.ReactNode
  className?: string
  overlayClassName?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
  }, [open])

  // click outside
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const clickOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      if (clickOutside) onClose()
    }
    if (open) document.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
  }, [open, onClose])

  const dialogInitial: TargetAndTransition = {
    opacity: 0,
    filter: 'blur(10px)',
    z: -100,
    rotateY: 15,
    rotateX: 4,
    transition: { duration: 0.28, ease: [0.67, 0.17, 0.62, 0.64] },
  }
  const dialogOpen: TargetAndTransition = {
    opacity: 1,
    filter: 'blur(0px)',
    rotateX: 0,
    rotateY: 0,
    z: 0,
    transition: {
      delay: 0.1,
      duration: 0.45,
      ease: [0.17, 0.67, 0.51, 1],
      opacity: { delay: 0.1, duration: 0.45, ease: 'easeOut' },
    },
  }

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* overlay */}
          <motion.div
            className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm ${overlayClassName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* dialog, centered */}
          <motion.dialog
            ref={ref}
            open={false}
            className={`fixed inset-0 z-50 m-auto w-[92vw] max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white shadow-2xl ${className}`}
            initial={dialogInitial}
            animate={dialogOpen}
            exit={dialogInitial}
            onCancel={(e) => {
              e.preventDefault()
              onClose()
            }}
            onClose={onClose}
            style={{ transformPerspective: 600 }}
          >
            {children}
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  )
}
