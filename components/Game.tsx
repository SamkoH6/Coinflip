'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sidebar } from '@/components/Sidebar'
import Rooms from '@/components/Rooms'
import FilterMenu, { type Filters } from '@/components/FilterMenu'
import { Button } from '@/components/Button'
import MobileModal from '@/components/MobileModal'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useBelowMd() {
  const [below, setBelow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setBelow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return below
}

export default function Game() {
  const isMobile = useBelowMd()

  // Start open (good SSR for desktop), then close pre-paint on mobile
  const [isVisible, setIsVisible] = useState(true)
  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setIsVisible(false) // close on phones before first paint → no flash
    }
  }, [])

  const [filters, setFilters] = useState<Filters>({
    categories: { 'Your Room': true, Active: true, 'In Progress': true },
  })

  return (
    <div className="flex h-[700px] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-4 px-8 pb-2">
        <Button
          onClick={() => setIsVisible((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium"
        >
          {isVisible ? 'Hide sidebar' : 'Show sidebar'}
        </Button>
        <FilterMenu onChange={setFilters} initial={filters} />
      </div>

      {/* Main row */}
      <div className="relative flex min-h-0 flex-1 gap-0 px-8">
        {/* --- MOBILE: sidebar inside modal (mount only on mobile) --- */}
        {isMobile && (
          <MobileModal
            open={isVisible}
            onClose={() => setIsVisible(false)}
            className="w-[94vw] max-w-lg p-0 overflow-hidden"
          >
            <div className="max-h-[80vh] overflow-y-auto rounded-2xl bg-gray">
              <Sidebar />
            </div>
          </MobileModal>
        )}

        {/* --- DESKTOP: inline sidebar (only when visible) --- */}
        <AnimatePresence initial={false} mode="popLayout">
          {!isMobile && isVisible && (
            <motion.aside
              key="sidebar-desktop"
              className="hidden h-full w-[300px] shrink-0 overflow-hidden rounded-l-lg bg-gray md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sidebar />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <motion.div
          layout
          className={`relative min-w-0 flex-1 rounded-lg bg-dark-gray ${
            isVisible && !isMobile ? 'md:rounded-r-lg' : ''
          }`}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-full overflow-y-auto">
            <Rooms sidebarOpen={isVisible} filters={filters} />
            <div className="h-6" />
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 rounded-b-lg bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  )
}
