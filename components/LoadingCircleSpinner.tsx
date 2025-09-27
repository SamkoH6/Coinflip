'use client'

import { motion } from 'motion/react'

export default function LoadingCircleSpinner({
  size = 48,
  className = '',
}: {
  size?: number
  className?: string
}) {
  // inline size to avoid extra Tailwind utilities for arbitrary sizes
  const style = { width: size, height: size }

  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      <motion.div
        style={style}
        className="rounded-full border-4 border-white/20 border-t-primary will-change-transform"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
