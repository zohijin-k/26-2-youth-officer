/** Shared year/month/day input used by identity verification and uploads. */
import type { YMD } from './ymd.ts'
import './form-sheet.css'

export function DateTriple({
  value,
  onChange,
  ariaPrefix,
  readOnly = false,
}: {
  value: YMD
  onChange: (v: YMD) => void
  ariaPrefix: string
  readOnly?: boolean
}) {
  const set = (k: keyof YMD, max: number) => (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, k === 'y' ? 4 : 2)
    if (digits && Number(digits) > max) return
    onChange({ ...value, [k]: digits })
  }
  return (
    <span className="form-date">
      <input
        className="form-date__y"
        inputMode="numeric"
        aria-label={`${ariaPrefix} 년`}
        readOnly={readOnly}
        value={value.y}
        onChange={(e) => set('y', 9999)(e.target.value)}
      />
      <span className="form-date__unit">년</span>
      <input
        className="form-date__m"
        inputMode="numeric"
        aria-label={`${ariaPrefix} 월`}
        readOnly={readOnly}
        value={value.m}
        onChange={(e) => set('m', 12)(e.target.value)}
      />
      <span className="form-date__unit">월</span>
      <input
        className="form-date__d"
        inputMode="numeric"
        aria-label={`${ariaPrefix} 일`}
        readOnly={readOnly}
        value={value.d}
        onChange={(e) => set('d', 31)(e.target.value)}
      />
      <span className="form-date__unit">일</span>
    </span>
  )
}
