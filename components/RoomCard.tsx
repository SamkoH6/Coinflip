'use client'

import { motion } from 'motion/react'

export type RoomItem = {
  id: string
  title: string
  category: 'Your Room' | 'Active' | 'In Progress' | string
  img: string
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Your Room':
      return 'text-primary'
    case 'Active':
      return 'text-green-400'
    case 'In Progress':
      return 'text-orange-400'
    default:
      return 'text-white/70'
  }
}

export default function RoomCard({ item, onOpen }: { item: RoomItem; onOpen: () => void }) {
  const { id, title, category, img } = item

  return (
    <li onClick={onOpen} className="cursor-pointer select-none">
      <motion.div
        layoutId={`card-${id}`}
        className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
      >
        <motion.div layoutId={`image-${id}`} className="relative aspect-[2/1] bg-zinc-800">
          <img
            src={img}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
        <div className="p-4">
          <motion.div layoutId={`title-${id}`} layout="position">
            <div className={`text-xs uppercase tracking-wide ${getCategoryColor(category)}`}>
              {category}
            </div>
            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          </motion.div>

          <motion.button
            layoutId={`button-${id}`}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black cursor-pointer"
          >
            Open
          </motion.button>
        </div>
      </motion.div>
    </li>
  )
}
