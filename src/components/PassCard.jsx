'use client'
import { TickIcon } from '@/components/icons'
import { timeOnly } from '@/lib/when'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME } from '@/lib/trade'

/**
 * The wallet pass, drawn in HTML.
 *
 * Shared by the dashboard showcase and the homepage, so the card a visitor sees
 * on the front page is the same card the trade sees in their dashboard and the
 * same field layout buildPassJson() signs in src/lib/passkit.js. One drawing,
 * three places; a mockup that drifts from the real pass is worse than none.
 *
 * The cards around it are deliberately generic — a coffee card, a gym pass —
 * rather than real brands. The point is to show where the card sits in a
 * wallet, and putting somebody else's logo in a product mockup is a trademark
 * problem, not a design shortcut.
 */
export const NEIGHBOURS = [
  { name: 'Coffee',        sub: '12 stamps',  bg: '#1d1d1f', fg: '#ffffff' },
  { name: 'Rail',          sub: 'Season',     bg: '#0b3d63', fg: '#dce9f5' },
  { name: 'Gym',           sub: 'Member',     bg: '#f2f2f4', fg: '#1d1d1f' },
  { name: 'Library',       sub: 'Card',       bg: '#2f5d3a', fg: '#e7f2ea' },
]

/* Cards tucked behind one another, the way a phone wallet stacks them.
   Flow layout with negative margins rather than absolute offsets: the pass
   sets its own height, so nothing can slice through it when its content
   changes length. */
export function StackView({ tracker, logo, tradeName }) {
  return (
    <div className="mx-auto max-w-[300px]">
      <div>
        {NEIGHBOURS.slice(0, 2).map((n, i) => (
          <Sliver key={n.name} card={n} className={i ? '-mt-[22px]' : ''} />
        ))}
        <div className="relative z-10 -mt-[22px] drop-shadow-[0_-4px_14px_rgba(0,0,0,.5)]">
          <PassCard tracker={tracker} logo={logo} tradeName={tradeName} />
        </div>
        {NEIGHBOURS.slice(2).map((n, i) => (
          <Sliver key={n.name} card={n} className={`relative -mt-[18px] ${i ? '-mt-[22px]' : ''}`} />
        ))}
      </div>
      <p className="mt-5 text-center text-[13px] text-white/45">
        Sitting with their other cards, where they already look
      </p>
    </div>
  )
}

/* Lifted out, the rest dimmed behind it. */
export function PoppedView({ tracker, logo }) {
  return (
    <div className="mx-auto max-w-[300px]">
      <div className="scale-[.94] opacity-35 blur-[2px]">
        <Sliver card={NEIGHBOURS[0]} />
        <Sliver card={NEIGHBOURS[1]} className="-mt-[22px]" />
      </div>
      <div className="relative z-10 -mt-[26px] drop-shadow-[0_26px_50px_rgba(0,0,0,.7)]">
        <PassCard tracker={tracker} logo={logo} big />
      </div>
      <p className="mt-5 text-center text-[13px] text-white/45">
        Tapped open — the view they get straight off the lock screen
      </p>
    </div>
  )
}

export function Sliver({ card, className = '' }) {
  return (
    <div className={`flex h-[62px] items-start justify-between rounded-[20px] px-5 pt-4 ${className}`}
         style={{ background: card.bg, color: card.fg }}>
      <span className="text-[14px] font-semibold">{card.name}</span>
      <span className="text-[12px] opacity-60">{card.sub}</span>
    </div>
  )
}

/* The card itself. Field layout mirrors buildPassJson in src/lib/passkit.js. */
export default function PassCard({ tracker, logo, big, tradeName = TRADE_NAME }) {
  const stage = stageOf(tracker?.stage || 'ON_MY_WAY')
  const step = STAGE_ORDER.indexOf(stage.key)

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#1f3b57] text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-start gap-2">
{logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo} alt="" className="h-6 w-auto max-w-[110px] shrink-0 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : (
                    <span className="mt-[1px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0a202] text-[#1f3b57]">
            <TickIcon size={14} />
          </span>
          )}
          <span className="text-[12px] font-bold uppercase leading-[1.25] tracking-wide">{tradeName}</span>
        </div>
        {tracker?.jobRef && (
          <div className="shrink-0 text-right">
            <p className="text-[9px] tracking-widest text-[#9db6cd]">JOB</p>
            <p className="text-[13px] font-bold">#{tracker.jobRef}</p>
          </div>
        )}
      </div>

      <div className={`mt-4 bg-[#16304a] px-5 ${big ? 'py-7' : 'py-5'}`}>
        <p className="text-[9px] tracking-widest text-[#9db6cd]">STATUS</p>
        <p className={`mt-1 font-bold leading-none ${big ? 'text-[38px]' : 'text-[30px]'}`}>{stage.label}</p>
        <p className="mt-2 text-[13px] text-[#c9d9e7]">
          {tracker?.arrivingAt && stage.key !== 'BOOKED'
            ? `Set off at ${timeOnly(tracker.arrivingAt)}`
            : stage.customerLine}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-[13px]">
        {tracker?.customerName && (
          <div>
            <p className="text-[9px] tracking-widest text-[#9db6cd]">CUSTOMER</p>
            <p className="font-semibold">{tracker.customerName}</p>
          </div>
        )}
        {tracker?.jobAddress && (
          <div>
            <p className="text-[9px] tracking-widest text-[#9db6cd]">WHERE</p>
            <p className="break-words">{tracker.jobAddress}</p>
          </div>
        )}
      </div>

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

      <div className="flex justify-center pb-5">
        <div className="flex h-[52px] w-[150px] items-end justify-center gap-[2px] rounded-md bg-white px-3 py-2">
          {[3, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2].map((w, i) => (
            <span key={i} className="h-full bg-black" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  )
}
