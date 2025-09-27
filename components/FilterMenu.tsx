'use client'

import { useEffect, useRef, useState } from 'react'
import * as motion from 'motion/react-client'
import { stagger, type Variants } from 'motion'
import { Button } from '@/components/Button'

export type Category = 'Your Room' | 'Active' | 'In Progress'
export type Filters = { categories: Record<Category, boolean> }

const sidebarVariants: Variants = {
  open: (height: number = 260) => ({
    clipPath: `circle(${height * 2 + 120}px at 100% 0)`,
    transition: { type: 'spring' as const, stiffness: 260, damping: 30 },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0)',
    transition: { type: 'spring' as const, stiffness: 320, damping: 32 },
  },
}

const navVariants: Variants = {
  open: { transition: { delayChildren: stagger(0.05, { startDelay: 0.1 }) } },
  closed: { transition: { delayChildren: stagger(0.04, { from: 'last' }) } },
}

const itemVariants: Variants = {
  open: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 900, damping: 40 } },
  closed: { opacity: 0, y: 12, transition: { duration: 0.12 } },
}

export default function FilterMenu({
  onChange,
  initial = { categories: { 'Your Room': true, Active: true, 'In Progress': true } },
}: {
  onChange?: (f: Filters) => void
  initial?: Filters
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(initial)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Close on click outside + Esc
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(e.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  function toggleCategory(key: Category) {
    const next: Filters = {
      categories: { ...filters.categories, [key]: !filters.categories[key] },
    }
    setFilters(next)
    onChange?.(next)
  }

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        aria-label="Toggle filters"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="cursor-pointer rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
      >
        <FunnelIcon className="h-5 w-5" />
      </motion.button>

      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        custom={rootRef.current?.offsetHeight ?? 240}
        className="absolute right-0 top-10 z-20"
        // prevent clicks inside panel from bubbling to document (optional safety)
        onPointerDown={(e) => e.stopPropagation()}
      >
        <motion.div
          variants={sidebarVariants}
          className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 p-3 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <motion.ul variants={navVariants} className="w-56 space-y-2">
            <motion.li variants={itemVariants}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Categories
              </div>
            </motion.li>

            {(['Your Room', 'Active', 'In Progress'] as const).map((c) => (
              <motion.li key={c} variants={itemVariants}>
                <label className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5">
                  <span className="text-sm text-white">{c}</span>
                  <input
                    type="checkbox"
                    checked={!!filters.categories[c]}
                    onChange={() => toggleCategory(c)}
                    className="h-4 w-4 accent-[#ffd703]"
                  />
                </label>
              </motion.li>
            ))}

            <motion.li variants={itemVariants} className="pt-1.5">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    const all = { 'Your Room': true, Active: true, 'In Progress': true }
                    setFilters({ categories: all })
                    onChange?.({ categories: all })
                  }}
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Select all
                </Button>
                <Button
                  onClick={() => {
                    const none = { 'Your Room': false, Active: false, 'In Progress': false }
                    setFilters({ categories: none })
                    onChange?.({ categories: none })
                  }}
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Clear
                </Button>
              </div>
            </motion.li>
          </motion.ul>
        </motion.div>
      </motion.div>
    </div>
  )
}

function FunnelIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h18l-7 8v5l-4 2v-7L3 5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
