import { VanIcon, HouseIcon, PauseIcon, CheckIcon, PhoneIcon, CompassIcon } from '@/components/icons'

/**
 * A head unit in a dash, seen from the driver's seat (right-hand drive).
 *
 * `vehicle` draws the cab: a van sits upright with a flat screen and a tall
 * dash; a car slopes, with the screen lower and wider. `ui` draws what is on
 * the screen: CarPlay (black, the status column on the left, list rows) or
 * Android Auto (Coolwalk: the map underneath, cards floating on it, the bar
 * along the bottom). Both carry the two things a driver needs: navigate to
 * the address, and the stage buttons. Nothing to read.
 */
const JOB = { who: 'Sarah Whitfield', where: 'Church Lane, Burbage', mins: 14 }
const STAGES = [
  { label: 'On my way', bg: '#5856d6', Icon: VanIcon, on: true },
  { label: 'On site', bg: '#007aff', Icon: HouseIcon },
  { label: 'Paused', bg: '#ff9500', Icon: PauseIcon },
  { label: 'Done', bg: '#34c759', Icon: CheckIcon },
]

/* A small map: roads on a pale ground, a blue route, a pin. */
function MapArt({ dark = false, className = '' }) {
  const ground = dark ? '#1f2a2a' : '#e9ecef', road = dark ? '#3a4a4a' : '#ffffff', green = dark ? '#243a2e' : '#d7ead9'
  return (
    <svg viewBox="0 0 320 200" className={`block h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" fill={ground} />
      <rect x="0" y="120" width="130" height="80" fill={green} />
      <rect x="200" y="0" width="120" height="70" fill={green} />
      <path d="M0 150 L320 90" stroke={road} strokeWidth="14" />
      <path d="M90 0 L140 200" stroke={road} strokeWidth="10" />
      <path d="M0 60 L320 40" stroke={road} strokeWidth="8" />
      <path d="M20 190 C 80 160, 120 150, 160 120 S 230 70, 262 56" fill="none" stroke="#1a73e8" strokeWidth="7" strokeLinecap="round" />
      <circle cx="20" cy="190" r="7" fill="#1a73e8" stroke="#fff" strokeWidth="3" />
      <g transform="translate(262 40)"><path d="M0 16 C -8 6, -8 -6, 0 -10 C 8 -6, 8 6, 0 16 Z" fill="#ea4335" /><circle r="3.5" cy="-1" fill="#fff" /></g>
    </svg>
  )
}

function CarPlayUI({ w }) {
  const fs = w / 560 * 16
  return (
    <div className="flex h-full bg-black text-white" style={{ fontSize: fs }}>
      <aside className="flex w-[13%] flex-col items-center justify-between py-[0.9em] text-[0.68em]">
        <div className="text-center leading-tight"><p className="font-semibold text-[1.15em]">08:42</p><p className="mt-[0.2em] text-white/60">▂▄▆█ 5G</p></div>
        <div className="grid gap-[0.7em]">
          <span className="grid h-[2.6em] w-[2.6em] place-items-center rounded-[0.75em] bg-[#34c759]"><CompassIcon size={fs * 1.2} /></span>
          <span className="grid h-[2.6em] w-[2.6em] place-items-center rounded-[0.75em] bg-[#34c759]/30"><PhoneIcon size={fs * 1.1} /></span>
          <span className="grid h-[2.6em] w-[2.6em] place-items-center rounded-[0.75em] bg-[#2e6b4b]"><span className="h-[1.1em] w-[1.1em] rounded-full border-[0.15em] border-white" /></span>
        </div>
        <span className="h-[1.6em] w-[1.6em] rounded-full border-[0.14em] border-white/70" />
      </aside>
      <main className="flex min-w-0 flex-1 gap-[0.6em] p-[0.6em] pl-0">
        {/* navigation card */}
        <section className="relative w-[49%] overflow-hidden rounded-[0.9em]">
          <MapArt />
          <div className="absolute inset-x-[0.6em] top-[0.6em] rounded-[0.6em] bg-black/75 px-[0.8em] py-[0.6em] backdrop-blur">
            <p className="text-[0.62em] uppercase tracking-wide text-white/60">Next job</p>
            <p className="truncate text-[0.9em] font-semibold">{JOB.where}</p>
            <p className="text-[0.75em] text-white/70">{JOB.mins} min · 6.2 mi</p>
          </div>
          <div className="absolute inset-x-[0.6em] bottom-[0.6em] flex items-center justify-center gap-[0.5em] rounded-[0.6em] bg-[#007aff] py-[0.6em] text-[0.9em] font-bold">
            <CompassIcon size={fs * 1.1} /> Navigate
          </div>
        </section>
        {/* stage list */}
        <section className="flex min-w-0 flex-1 flex-col rounded-[0.9em] bg-[#1c1c1e]">
          <header className="flex items-center justify-between px-[0.9em] py-[0.55em] text-[0.72em] text-white/60"><span>TurnUp</span><span className="truncate pl-[0.5em]">{JOB.who}</span></header>
          <ul className="flex flex-1 flex-col divide-y divide-white/10 border-t border-white/10">
            {STAGES.map(({ label, bg, Icon, on }) => (
              <li key={label} className={`flex flex-1 items-center gap-[0.8em] px-[0.9em] ${on ? 'bg-white/[.08]' : ''}`}>
                <span className="grid h-[2.1em] w-[2.1em] shrink-0 place-items-center rounded-[0.55em]" style={{ background: bg }}><Icon size={fs * 1.1} /></span>
                <span className={`flex-1 text-[1em] ${on ? 'font-bold' : 'font-medium text-white/85'}`}>{label}</span>
                {on ? <CheckIcon size={fs * 1.05} className="text-[#34c759]" /> : <span className="text-white/35">›</span>}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

function AndroidAutoUI({ w }) {
  const fs = w / 560 * 16
  return (
    <div className="relative h-full overflow-hidden bg-[#1b1f1f] text-white" style={{ fontSize: fs }}>
      <MapArt dark className="absolute inset-0" />
      {/* navigation card, top left */}
      <div className="absolute left-[0.7em] top-[0.7em] w-[42%] rounded-[1em] bg-[#202124]/95 p-[0.8em] shadow-xl">
        <p className="text-[0.62em] uppercase tracking-wide text-white/55">Next job · {JOB.who}</p>
        <p className="mt-[0.15em] truncate text-[0.95em] font-semibold">{JOB.where}</p>
        <p className="text-[0.75em] text-[#8ab4f8]">{JOB.mins} min · 6.2 mi · A338</p>
        <div className="mt-[0.6em] flex items-center justify-center gap-[0.5em] rounded-full bg-[#8ab4f8] py-[0.5em] text-[0.85em] font-bold text-[#0b1f3a]"><CompassIcon size={fs} /> Navigate</div>
      </div>
      {/* TurnUp card, right */}
      <div className="absolute bottom-[3.1em] right-[0.7em] top-[0.7em] w-[40%] rounded-[1em] bg-[#202124]/95 p-[0.7em] shadow-xl">
        <p className="text-[0.7em] text-white/60">TurnUp</p>
        <div className="mt-[0.5em] grid grid-cols-2 gap-[0.5em]">
          {STAGES.map(({ label, bg, Icon, on }) => (
            <div key={label} className="flex flex-col items-center justify-center rounded-[0.8em] py-[0.7em] text-center" style={{ background: on ? bg : '#2b2f33', outline: on ? '0.15em solid rgba(255,255,255,.5)' : 'none' }}>
              <Icon size={fs * 1.3} /><p className="mt-[0.3em] text-[0.78em] font-semibold leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
      {/* bottom bar */}
      <nav className="absolute inset-x-0 bottom-0 flex h-[2.6em] items-center justify-between bg-[#202124] px-[0.9em] text-[0.7em] text-white/70">
        <span className="flex items-center gap-[0.9em]"><span className="grid h-[1.7em] w-[1.7em] grid-cols-2 gap-[0.15em]"><i className="rounded-sm bg-white/70" /><i className="rounded-sm bg-white/70" /><i className="rounded-sm bg-white/70" /><i className="rounded-sm bg-white/70" /></span><span className="h-[1.7em] w-[1.7em] rounded-full bg-[#8ab4f8]" /></span>
        <span>08:42 · ▂▄▆ · 5G · 86%</span>
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* The photographed cab.                                                     */

/**
 * Solve the projective transform that takes the rectangle (0,0)–(w,h) onto
 * the quadrilateral [tl, tr, br, bl] and return it as a CSS matrix3d().
 * Eight unknowns, eight equations, Gaussian elimination. The element it is
 * applied to needs `transform-origin: 0 0`.
 */
export function homography(w, h, [tl, tr, br, bl]) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]], dst = [tl, tr, br, bl]
  const A = [], B = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]); B.push(u)
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]); B.push(v)
  }
  for (let c = 0; c < 8; c++) {
    let p = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]]
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]
      B[r] -= f * B[c]
    }
  }
  const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i])
  // column-major: x' = ax + by + c, y' = dx + ey + f, w' = gx + hh·y + 1
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}

/**
 * Two photographs from the driver's seat, right-hand drive, the head unit
 * switched off. The four corners of the glass, measured by eye against a
 * grid and checked with a coloured quad, as fractions of the photo so any
 * render width works: top-left, top-right, bottom-right, bottom-left.
 * `aspect` is the screen's own width:height, which the UI is laid out at
 * before it is pressed onto the glass.
 */
export const CABS = {
  van: { src: '/home/cab-van.jpg', w: 1600, h: 1195, aspect: 1.436,
         quad: [[0.1445, 0.4705], [0.4945, 0.4315], [0.4935, 0.7275], [0.1465, 0.8225]] },
  car: { src: '/home/cab-car.jpg', w: 1600, h: 1195, aspect: 1.867,
         quad: [[0.1775, 0.5030], [0.4928, 0.4685], [0.4935, 0.6695], [0.1830, 0.7535]] },
}

/**
 * The cab as a photograph, with the app on the real screen. The UI is laid
 * out flat at a natural size and then mapped onto the photographed glass by
 * the homography above, so it takes the screen's perspective while staying
 * HTML: crisp text, not a picture of text. A faint reflection and an inner
 * shadow make it a lit panel behind glass rather than a sticker on top.
 * `fadeTop` masks the top of the photograph to transparent over that
 * fraction of its height, so it rises out of whatever sits behind it.
 */
export function CabPhoto({ vehicle = 'van', ui = 'carplay', width = 620, fadeTop = 0, className = '' }) {
  const cab = CABS[vehicle] || CABS.van
  const H = width * cab.h / cab.w
  const quad = cab.quad.map(([x, y]) => [x * width, y * H])
  const W = 560, UH = W / cab.aspect
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height: H }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- capture page; the photo is the frame */}
      <img src={cab.src} alt="" width={cab.w} height={cab.h} draggable={false} className="absolute inset-0 h-full w-full select-none"
           style={fadeTop ? { WebkitMaskImage: `linear-gradient(to bottom, transparent, #000 ${fadeTop * 100}%)`, maskImage: `linear-gradient(to bottom, transparent, #000 ${fadeTop * 100}%)` } : undefined} />
      <div className="absolute left-0 top-0 overflow-hidden rounded-[3px] bg-black"
           style={{ width: W, height: UH, transformOrigin: '0 0', transform: homography(W, UH, quad), backfaceVisibility: 'hidden' }}>
        {ui === 'android' ? <AndroidAutoUI w={W} /> : <CarPlayUI w={W} />}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[3px]"
             style={{ background: 'linear-gradient(155deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.025) 32%, rgba(255,255,255,0) 52%)',
                      boxShadow: 'inset 0 0 16px rgba(0,0,0,.55), inset 0 0 2px rgba(0,0,0,.9)' }} />
      </div>
    </div>
  )
}

/**
 * The drawn cab (kept; the posters now use CabPhoto above). Right-hand drive:
 * wheel on the right, head unit centre-left of the driver, the road ahead
 * through the glass. The screen is an HTML box positioned over the SVG so
 * the UI stays crisp text, not a picture of text.
 */
export default function CarDisplay({ vehicle = 'van', ui = 'carplay', width = 560, className = '' }) {
  const van = vehicle === 'van'
  const H = Math.round(width * 0.78)
  // screen box, as fractions of the scene
  const scr = van ? { l: 0.10, t: 0.37, w: 0.52, h: 0.30 } : { l: 0.08, t: 0.44, w: 0.56, h: 0.27 }
  const sw = width * scr.w
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height: H }}>
      <svg viewBox="0 0 560 437" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fc3e6" /><stop offset="1" stopColor="#e9f0f5" /></linearGradient>
          <linearGradient id="dash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2d31" /><stop offset="1" stopColor="#141618" /></linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b7078" /><stop offset="1" stopColor="#3f434a" /></linearGradient>
        </defs>
        {/* windscreen: sky, hedges, road */}
        <rect width="560" height="437" fill="url(#sky)" />
        <path d={van ? 'M0 150 Q 140 120 280 135 T 560 140 V 200 H 0 Z' : 'M0 170 Q 140 140 280 155 T 560 160 V 220 H 0 Z'} fill="#5f8a55" />
        <path d="M250 200 L310 200 L560 437 L0 437 Z" fill="url(#road)" />
        <path d="M280 200 L280 437" stroke="#e8e2c8" strokeWidth="4" strokeDasharray="14 22" />
        {/* A-pillars and glass edge */}
        <path d="M0 0 L70 0 L22 437 L0 437 Z" fill="#111317" />
        <path d="M560 0 L490 0 L538 437 L560 437 Z" fill="#111317" />
        {/* dash */}
        <path d={van
          ? 'M0 437 V 250 Q 90 225 200 232 Q 330 225 560 262 V 437 Z'
          : 'M0 437 V 300 Q 120 262 280 268 Q 440 262 560 300 V 437 Z'} fill="url(#dash)" />
        {van && <rect x="0" y="250" width="560" height="6" fill="#0d0f11" opacity=".6" />}
        {/* vents */}
        {[0.03, 0.70].map((x, i) => (
          <g key={i} transform={`translate(${x * 560} ${van ? 268 : 306})`}><rect width="34" height="12" rx="3" fill="#0b0c0e" /><rect x="4" y="3" width="26" height="2" fill="#3a3f45" /><rect x="4" y="7" width="26" height="2" fill="#3a3f45" /></g>
        ))}
        {/* instrument binnacle, right */}
        <path d={van ? 'M392 258 Q 468 236 544 262 L 536 300 Q 468 282 400 300 Z' : 'M392 292 Q 468 272 544 298 L 536 330 Q 468 312 400 330 Z'} fill="#0b0c0e" />
        <circle cx="440" cy={van ? 280 : 312} r="9" fill="none" stroke="#5ec6ff" strokeWidth="2" /><circle cx="496" cy={van ? 280 : 312} r="9" fill="none" stroke="#5ec6ff" strokeWidth="2" />
        {/* steering wheel, right-hand drive */}
        <g transform={van ? 'translate(468 392)' : 'translate(468 410)'}>
          <ellipse rx="118" ry={van ? 86 : 70} fill="none" stroke="#1a1c1f" strokeWidth="22" />
          <ellipse rx="118" ry={van ? 86 : 70} fill="none" stroke="#2c3034" strokeWidth="14" />
          <path d={van ? 'M-104 20 L-28 8 M104 20 L28 8 M0 84 L0 16' : 'M-104 16 L-28 6 M104 16 L28 6 M0 68 L0 14'} stroke="#2c3034" strokeWidth="18" strokeLinecap="round" />
          <circle r="26" fill="#202327" /><circle r="7" fill="#2e6b4b" />
        </g>
        {/* head unit bezel */}
        <rect x={scr.l * 560 - 8} y={scr.t * 437 - 8} width={scr.w * 560 + 16} height={scr.h * 437 + 16} rx="12" fill="#07080a" stroke="#2b2f34" strokeWidth="2" />
      </svg>
      <div className="absolute overflow-hidden rounded-[6px] bg-black" style={{ left: scr.l * width, top: scr.t * H, width: sw, height: scr.h * H }}>
        {ui === 'android' ? <AndroidAutoUI w={sw} /> : <CarPlayUI w={sw} />}
      </div>
    </div>
  )
}
