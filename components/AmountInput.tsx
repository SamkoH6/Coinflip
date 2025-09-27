'use client'

type Props = {
  label?: string
  value: number
  onChange: (v: number) => void
  onHalf?: () => void
  onDouble?: () => void
  badge?: string
  min?: number
  max?: number
}

export function AmountInput({
  label = 'Amount',
  value,
  onChange,
  onHalf,
  onDouble,
  min = 0,
  max = 100,
}: Props) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    const n = clamp(parseInt(rawDigits || '0', 10))
    onChange(n)
  }

  const handleBlur = () => {
    const n = clamp(value)
    onChange(n)
  }

  return (
    <div className="w-full">
      <div className="mb-1 text-sm font-medium text-white">{label}</div>

      <div className="flex items-stretch overflow-hidden rounded-lg border border-white/10 bg-background">
        <div className="flex flex-1 items-center gap-2 bg-background px-4 py-3">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={value === 0 ? '' : value.toString()}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full bg-transparent text-base text-white placeholder-white/35 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onHalf}
          className="min-w-14 select-none px-4 text-sm font-extrabold text-white/85 transition hover:bg-white/5 active:opacity-90"
        >
          ½
        </button>

        <div className="my-2 w-px bg-white/10" />

        <button
          type="button"
          onClick={onDouble}
          className="min-w-14 select-none px-4 text-sm font-semibold text-white transition hover:bg-white/5 active:opacity-90"
        >
          2×
        </button>
      </div>
    </div>
  )
}
