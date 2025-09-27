'use client'

import * as motion from 'motion/react-client'
import { stagger, type Variants } from 'motion'
import { useMemo } from 'react'

type Entry = { address: string; won: number }

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function usd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// Dummy data (replace with real API later)
const DUMMY: Entry[] = [
  { address: '0x8eD7b8F3aC4B92C1B74dA3c4B1e0A7F9eBCa12aa', won: 42150 },
  { address: '0x13F9eD2b7c0D4Aa2Ff9C5E7e12a34Bf1C9aA77c1', won: 39880 },
  { address: '0x7A11cD3E55b8F2C3d9Af0E1bC2D3e4A5b6C7d8e9', won: 35200 },
  { address: '0x9C0aB1cD2e3F4a5B6c7D8E9f0a1B2c3D4e5F6a7b', won: 28950 },
  { address: '0x5b4A3c2D1e0F9a8B7c6D5E4f3A2B1c0D9e8F7a6b', won: 27110 },
  { address: '0xAA22b3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0', won: 23990 },
  { address: '0x21c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1', won: 22100 },
  { address: '0xF1e2D3c4B5a6C7d8E9f00112233445566778899A', won: 19870 },
  { address: '0x0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B', won: 17540 },
  { address: '0xBEEfCafeC0ffeeBabeFace1234567890ABCDEF00', won: 16220 },
]

const listVariants: Variants = {
  open: {
    transition: {
      // ✅ Use delayChildren with stagger()
      delayChildren: stagger(0.05),
    },
  },
  closed: {},
}

const rowVariants: Variants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 6 },
}

export default function Leaderboard({
  data,
  title = 'Top Winners',
}: {
  data?: Entry[]
  title?: string
}) {
  const top10 = useMemo(
    () =>
      [...(data ?? DUMMY)]
        .sort((a, b) => b.won - a.won)
        .slice(0, 10)
        .map((e, i) => ({ ...e, rank: i + 1 })),
    [data],
  )

  return (
    <div className="w-full mt-10 px-6">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-dark-gray backdrop-blur">
        <div className="grid grid-cols-12 border-b border-white/10 px-4 py-2 text-xs uppercase tracking-wide text-white/60">
          <div className="col-span-2">Rank</div>
          <div className="col-span-7">Wallet</div>
          <div className="col-span-3 text-right">Won</div>
        </div>

        <motion.ul
          initial="closed"
          animate="open"
          variants={listVariants}
          className="divide-y divide-white/5"
        >
          {top10.map(({ rank, address, won }) => (
            <motion.li
              key={address}
              variants={rowVariants}
              className="grid grid-cols-12 items-center px-4 py-3 text-sm text-white [font-variant-numeric:tabular-nums]"
            >
              <div className="col-span-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-semibold">
                  {rank}
                </span>
                {rank <= 3 && (
                  <span aria-hidden className="text-yellow-300/90">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                  </span>
                )}
              </div>

              <div className="col-span-7">
                <span title={address} className="font-medium">
                  {shortAddr(address)}
                </span>
              </div>

              <div className="col-span-3 text-right font-semibold text-emerald-400">{usd(won)}</div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
