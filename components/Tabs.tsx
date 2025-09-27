'use client'

import { motion } from 'motion/react'
import { useId } from 'react'

type Option = { value: string | number; label: string }

export function Tabs({
  options,
  value,
  onChange,
  className = '',
}: {
  options: Option[]
  value: Option['value']
  onChange: (val: Option['value']) => void
  className?: string
}) {
  const scope = useId() // unique per mounted Tabs

  return (
    <div role="tablist" className={`inline-flex gap-2 rounded-full bg-background p-1 ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value
        return (
          <button
            key={String(opt.value)}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className="relative cursor-pointer rounded-full px-6 py-4 text-lg font-semibold outline-none"
          >
            <motion.span
              initial={false}
              animate={{ opacity: isSelected ? 1 : 0.6, color: isSelected ? '#000' : '#fff' }}
              className="relative z-10"
            >
              {opt.label}
            </motion.span>

            {isSelected && (
              <motion.div
                layoutId={`tab-indicator-${scope}`} // ← unique
                className="absolute inset-0 m-1 rounded-full bg-white"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
