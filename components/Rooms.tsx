'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { type Filters } from '@/components/FilterMenu'
import RoomCard, { type RoomItem } from '@/components/RoomCard'
import RoomItemModal from '@/components/RoomItemModal'

type RoomsProps = {
  sidebarOpen: boolean
  filters: Filters
}

const items: RoomItem[] = [
  { id: '1', title: 'Lucky Streak', category: 'Your Room', img: 'images/coins/tails.png' },
  { id: '2', title: 'Jackpot Rush', category: 'Active', img: 'images/coins/tails.png' },
  { id: '3', title: 'Heads or Tails', category: 'Active', img: 'images/coins/tails.png' },
  { id: '4', title: 'High Roller', category: 'Your Room', img: 'images/coins/tails.png' },
  { id: '5', title: 'Daily Spin', category: 'In Progress', img: 'images/coins/tails.png' },
  { id: '6', title: 'Fortune Flip', category: 'In Progress', img: 'images/coins/tails.png' },
  { id: '7', title: 'Fortune Flip', category: 'Active', img: 'images/coins/tails.png' },
]

export default function Rooms({ sidebarOpen, filters }: RoomsProps) {
  const [selected, setSelected] = useState<RoomItem | null>(null)

  const filtered = useMemo(
    () => items.filter((i) => filters.categories[i.category as keyof typeof filters.categories]),
    [filters],
  )

  const lgCols = sidebarOpen ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="w-full">
      <div className="relative mx-auto max-w-6xl p-6">
        <motion.ul
          layout
          transition={{ type: 'spring', stiffness: 420, damping: 40, mass: 0.8 }}
          className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${lgCols}`}
        >
          {filtered.map((card) => (
            <RoomCard key={card.id} item={card} onOpen={() => setSelected(card)} />
          ))}
        </motion.ul>
        <div className="h-6" />
      </div>

      <RoomItemModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
