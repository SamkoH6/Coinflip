'use client'

import { Ticker } from 'motion-plus/react'
import { useMemo } from 'react'

function pad4(n: number) {
  return String(n).padStart(4, '0')
}
function formatUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// deterministic PRNG (same output SSR/CSR)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min
}

function makeItem(i: number, rng: () => number) {
  const id = pad4(randInt(rng, 1111, 9999))
  const amt = formatUsd(randInt(rng, 50, 5000))
  return (
    <span key={i} className="whitespace-nowrap font-medium tabular-nums tracking-tight">
      <span className="text-white/70">{id}</span>
      <span className="mx-2 text-white/40">won</span>
      <span className="text-primary">{amt}</span>
    </span>
  )
}

export default function WinnersTicker() {
  const items = useMemo(() => {
    const rng = mulberry32(0xc0ffee) // any constant seed
    return Array.from({ length: 10 }, (_, i) => makeItem(i, rng))
  }, [])

  return (
    <div className="relative w-full mt-2 mb-6">
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div className="bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-y border-white/5">
          <div className="mx-auto max-w-6xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/60 to-transparent" />
              <div className="pl-20 pr-4 py-2">
                <Ticker items={items} velocity={-90} hoverFactor={0.2} gap={28} overflow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
