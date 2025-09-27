'use client'

import { Button } from '@/components/Button' // adjust import path

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between bg-background px-8 pt-6">
      <div className="text-4xl font-semibold text-white">Coinflip</div>
      <Button className="rounded-md border border-primary text-primary px-4 py-2 font-semibold">
        Connect wallet
      </Button>
    </header>
  )
}
