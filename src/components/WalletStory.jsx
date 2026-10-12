'use client'
import PassCard from '@/components/PassCard'
import Device from '@/components/Device'
import Mark from '@/components/Mark'
import { TickIcon, WalletIcon, PhoneIcon, BellIcon } from '@/components/icons'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'

/**
 * The card in their wallet, explained in pictures.
 *
 * The wallet pass is the premise of the product, and the homepage used to give
 * it one picture and two sentences. A visitor who has never put a boarding
 * pass in Apple Wallet does not know what "a card in their wallet" means, and
 * one who has still cannot tell from a single mockup what is on it, how it
 * changes, or why it is better than the page. So: the card pulled apart with
 * each part named, the same card at four stages, its back, and the lock
 * screen the notification lands on. Drawn in HTML from the same PassCard the
 * real pass is built from, so nothing here is a mockup that can drift.
 *
 * Honesty, because this is the one feature that is built but not in anybody's
 * wallet yet: every frame carries the same badge the posters do. The card is
 * built; the notification on the lock screen is live today (web push); the
 * card updating itself in Wallet waits on Apple's certificate and the pass
 * web service. Nothing below says otherwise.
 */
const TRADE = 'Sam Hale Plumbing'
const DEMO = {
  stage: 'ON_MY_WAY', jobRef: '2718', customerName: 'Sarah Whitfield',
  jobAddress: 'Church Lane, Burbage SN8', arrivingAt: '2026-10-01T07:00:00.000Z',
}

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold tracking-wide"
        style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 10%, transparent)',
                 borderColor: 'color-mix(in srgb, var(--tint) 35%, transparent)' }}>
    {children}
  </span>
)

const Label = ({ n, children }) => (
  <span className="flex items-start gap-2.5">
    <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{ background: 'var(--tint)' }}>{n}</span>
    <span className="text-[15px] font-semibold leading-snug">{children}</span>
  </span>
)

/* --- 1. the card, pulled apart ------------------------------------------ */
/* Each band of the real pass, drawn on its own with a label beside it. The
   colours and field names are PassCard's, which mirror buildPassJson(). */
const NAVY = '#1f3b57', DEEP = '#16304a', LBL = '#9db6cd', AMBER = '#f0a202'
const Band = ({ children, dark, className = '' }) => (
  <div className={`rounded-[14px] px-4 py-3 text-white shadow-md ${className}`} style={{ background: dark ? DEEP : NAVY }}>{children}</div>
)
const Tiny = ({ children }) => <p className="text-[9px] tracking-widest" style={{ color: LBL }}>{children}</p>

function Anatomy() {
  const step = STAGE_ORDER.indexOf('ON_MY_WAY')
  const parts = [
    [<Band key="a"><div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: AMBER, color: NAVY }}><TickIcon size={14} /></span>
          <span className="text-[12px] font-bold uppercase tracking-wide">{TRADE}</span>
        </span>
        <span className="text-right"><Tiny>JOB</Tiny><span className="text-[13px] font-bold">#2718</span></span>
      </div></Band>, 'Who is coming. Which job.'],
    [<Band key="b" dark><Tiny>STATUS</Tiny><p className="mt-1 text-[26px] font-bold leading-none">On my way</p><p className="mt-1.5 text-[12px]" style={{ color: '#c9d9e7' }}>Set off at 08:00</p></Band>,
      'What is happening now. A record, never a promise.'],
    [<Band key="c"><div className="grid grid-cols-2 gap-3 text-[12px]">
        <span><Tiny>CUSTOMER</Tiny><span className="font-semibold">Sarah Whitfield</span></span>
        <span><Tiny>WHERE</Tiny><span>Church Lane, Burbage</span></span>
      </div></Band>, 'Whose job, and where.'],
    [<Band key="d"><div className="flex items-center">
        {STAGE_ORDER.map((s, i) => (
          <div key={s} className={`flex items-center ${i ? 'flex-1' : ''}`}>
            {i > 0 && <div className="h-[3px] flex-1" style={{ background: i <= step ? AMBER : '#33506b' }} />}
            <div className="h-[10px] w-[10px] shrink-0 rounded-full" style={{ background: i <= step ? AMBER : '#33506b' }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[9px]" style={{ color: LBL }}>
        {STAGE_ORDER.map((s, i) => <span key={s} className={i === step ? 'font-bold text-white' : ''}>{stageOf(s).label}</span>)}
      </div></Band>, 'How far along. Four dots, one lit.'],
    [<Band key="e"><div className="flex justify-center"><QR /></div></Band>, 'Scan or tap: the full page opens.'],
  ]
  return (
    <ol className="grid gap-2.5">
      {parts.map(([band, text], i) => (
        <li key={i} className="grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-4">
          {band}
          <Label n={i + 1}>{text}</Label>
        </li>
      ))}
    </ol>
  )
}

/* A QR-shaped block. The real pass carries a QR of the tracking link (see
   buildPassJson); this is the shape of one, not a working code — a working
   one would be a tracking link on a marketing page. */
function QR({ size = 64 }) {
  const cells = [
    '1111111010011111111', '1000001001010000001', '1011101100010111001', '1011101010110111001', '1011101001010111001',
    '1000001011010000001', '1111111010101111111', '0000000110100000000', '1101011011010110110', '0110100101101001011',
    '1001110010110110101', '0000000011010011010', '1111111000101101001', '1000001101011010110', '1011101010110011101',
    '1011101101010101010', '1011101001011011011', '1000001110100101100', '1111111011010110111',
  ]
  const n = cells.length, c = size / n
  return (
    <span className="inline-block rounded-md bg-white p-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {cells.flatMap((row, y) => [...row].map((v, x) => v === '1'
          ? <rect key={`${x}-${y}`} x={x * c} y={y * c} width={c + 0.2} height={c + 0.2} fill="#000" /> : null))}
      </svg>
    </span>
  )
}

/* --- 2. the back ------------------------------------------------------------ */
/* backFields in buildPassJson, in the same order. */
function PassBack() {
  const rows = [
    ['Job', 'Unvented cylinder swap'],
    ['Latest', 'Cylinder is on the van — picked it up from the merchant first thing.'],
    ['Set off', '08:00'],
    ['Call', '07700 900123'],
    ['Full status', 'getturnup.com/t/K7M4PQRT'],
    ['About', `${TRADE} updates this card as the job moves. It shows what has happened, not what time anyone will arrive.`],
  ]
  return (
    <div className="overflow-hidden rounded-[22px] text-white shadow-2xl" style={{ background: NAVY }}>
      <div className="flex items-center justify-between px-5 pt-4 text-[12px]" style={{ color: LBL }}>
        <span className="font-semibold uppercase tracking-wide">Back of the card</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">Done</span>
      </div>
      <dl className="mt-2 divide-y divide-white/10 px-5 pb-4">
        {rows.map(([k, v]) => (
          <div key={k} className="py-2.5">
            <dt className="text-[9px] tracking-widest" style={{ color: LBL }}>{k.toUpperCase()}</dt>
            <dd className="mt-0.5 text-[13px] leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* --- 3. the lock screen ----------------------------------------------------- */
/* The push notification as it lands. The words are LINES in src/lib/push.js:
   the trade's name and the stage, and nothing else, by design. */
function LockScreen() {
  return (
    <div className="flex min-h-full flex-col px-4 pt-[52px] text-white"
         style={{ background: 'linear-gradient(180deg, #2b2a7a 0%, #5856d6 55%, #8e8cf0 100%)' }}>
      <p className="mt-6 text-center text-[17px] font-medium opacity-90">Thursday 1 October</p>
      <p className="-mt-1 text-center text-[82px] font-semibold leading-none tracking-[-0.03em]">09:41</p>
      <div className="mt-8 rounded-[22px] bg-white/85 px-3.5 py-3 text-[#15161a] shadow-lg backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white shadow-sm"><Mark className="h-5 w-auto" id="lock" /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between"><span className="text-[15px] font-semibold">On the way</span><span className="text-[12px] text-[#5f6672]">now</span></span>
            <span className="block text-[14px] leading-snug">{TRADE} has set off and is heading to you.</span>
          </span>
        </div>
      </div>
      <div className="mt-auto flex justify-between px-4 pb-6">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black/25"><PhoneIcon size={20} /></span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black/25"><WalletIcon size={20} /></span>
      </div>
    </div>
  )
}

/* --- 4. four stages, one card ------------------------------------------- */
function Stages() {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STAGE_ORDER.map((s) => (
        <figure key={s} className="w-[190px] shrink-0 snap-center">
          {/* the real card at its real width, scaled to the column; the box
              below it is sized to the scaled height so the caption sits under
              the card and not under the empty space the transform leaves */}
          <div style={{ height: 304 }}>
            <div className="origin-top-left" style={{ width: 300, transform: 'scale(.6333)' }}>
              <PassCard tracker={{ ...DEMO, stage: s }} tradeName={TRADE} />
            </div>
          </div>
          <figcaption className="mt-2 text-center text-[14px] font-semibold">{stageOf(s).label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

/* --- 5. like the cards they already have ---------------------------------- */
const LIKE = [
  ['One per job', 'like a ticket', <TickIcon key="t" size={20} />],
  ['Beside their bank card', 'where they already look', <WalletIcon key="w" size={20} />],
  ['Changes as the job moves', 'gate changes, card changes', <BellIcon key="b" size={20} />],
  ['Scan it', 'the page opens', <PhoneIcon key="p" size={20} />],
]

export default function WalletStory() {
  return (
    <div className="grid gap-9" style={{ '--tint': '#5856d6' }}>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[20px] font-bold tracking-[-0.02em]">What is on it</h3>
          <Badge>Built · awaiting Apple</Badge>
        </div>
        <div className="glass r-outer mt-4 p-4 sm:p-5"><Anatomy /></div>
      </div>

      <div>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]">It moves with the job</h3>
        <p className="mt-1 text-[15px] muted">Same card. The dot moves.</p>
        <div className="mt-4"><Stages /></div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
        <figure>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[20px] font-bold tracking-[-0.02em]">On the lock screen</h3>
            <Badge>Buzz: live today</Badge>
          </div>
          <div className="mt-4 flex justify-center"><Device width={230} alt="A lock screen with a TurnUp notification: On the way, Sam Hale Plumbing has set off and is heading to you"><LockScreen /></Device></div>
          <figcaption className="mt-3 text-center text-[14px] muted">Name and stage. Nothing else.</figcaption>
        </figure>
        <figure>
          <h3 className="text-[20px] font-bold tracking-[-0.02em]">Flip it</h3>
          <div className="mx-auto mt-4 max-w-[300px]"><PassBack /></div>
          <figcaption className="mt-3 text-center text-[14px] muted">The detail, on the back. Like a ticket.</figcaption>
        </figure>
      </div>

      <div>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]">Why a card</h3>
        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {LIKE.map(([head, sub, icon]) => (
            <li key={head} className="glass r-outer flex items-start gap-3 p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                    style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>{icon}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-tight">{head}</span>
                <span className="block text-[13px] leading-snug muted">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] leading-snug muted">
          The card is built. It goes in wallets when Apple signs it. Android next.
        </p>
      </div>
    </div>
  )
}
