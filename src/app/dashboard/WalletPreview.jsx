'use client'

import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME } from '@/lib/trade'

/**
 * What the Apple Wallet pass will look like, drawn in the dashboard.
 *
 * The point is to be able to judge the card before paying Apple £79 for the
 * certificate that makes a real one possible. The field layout mirrors
 * buildPassJson() in src/lib/passkit.js — header, primary, secondary,
 * auxiliary — so what is judged here is what would be signed.
 */
export default function WalletPreview({ tracker }) {
  const stage = stageOf(tracker.stage)
  const step = STAGE_ORDER.indexOf(stage.key)

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[22px] bg-[#1f3b57] text-white shadow-xl">
      {/* header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-[1px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0a202] text-[12px] font-bold text-[#1f3b57]">
            ✓
          </span>
          <span className="text-[12px] font-bold uppercase leading-[1.25] tracking-wide">
            {TRADE_NAME}
          </span>
        </div>
        {tracker.jobRef && (
          <div className="shrink-0 text-right">
            <p className="text-[9px] tracking-widest text-[#9db6cd]">JOB</p>
            <p className="text-[13px] font-bold">#{tracker.jobRef}</p>
          </div>
        )}
      </div>

      {/* the glance: what a customer sees without opening anything */}
      <div className="mt-4 bg-[#16304a] px-5 py-5">
        <p className="text-[9px] tracking-widest text-[#9db6cd]">STATUS</p>
        <p className="mt-1 text-[30px] font-bold leading-none">{stage.label}</p>
        <p className="mt-2 text-[13px] text-[#c9d9e7]">
          {tracker.arrivingAt && stage.key !== 'BOOKED'
            ? `Set off at ${new Date(tracker.arrivingAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
            : stage.customerLine}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-[13px]">
        {tracker.customerName && (
          <div>
            <p className="text-[9px] tracking-widest text-[#9db6cd]">CUSTOMER</p>
            <p className="font-semibold">{tracker.customerName}</p>
          </div>
        )}
        {tracker.jobAddress && (
          <div>
            <p className="text-[9px] tracking-widest text-[#9db6cd]">WHERE</p>
            <p className="break-words">{tracker.jobAddress}</p>
          </div>
        )}
      </div>

      {/* progress */}
      <div className="px-5 pb-4">
        <div className="flex items-center">
          {STAGE_ORDER.map((s, i) => (
            <div key={s} className={`flex items-center ${i ? 'flex-1' : ''}`}>
              {i > 0 && <div className={`h-[3px] flex-1 ${i <= step ? 'bg-[#f0a202]' : 'bg-[#33506b]'}`} />}
              <div className={`h-[10px] w-[10px] shrink-0 rounded-full ${i <= step ? 'bg-[#f0a202]' : 'bg-[#33506b]'}`} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-[#9db6cd]">
          {STAGE_ORDER.map((s, i) => (
            <span key={s} className={i === step ? 'font-bold text-white' : ''}>{stageOf(s).label}</span>
          ))}
        </div>
      </div>

      {/* barcode — opens the full page */}
      <div className="flex justify-center pb-5">
        <div className="flex h-[52px] w-[150px] items-end justify-center gap-[2px] rounded-md bg-white px-3 pb-2 pt-2">
          {[3, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2].map((w, i) => (
            <span key={i} className="h-full bg-black" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  )
}
