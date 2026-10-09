import { VanIcon, HouseIcon, PauseIcon, CheckIcon } from '@/components/icons'

/**
 * A car's screen, not a phone's. Landscape head unit in a dark dash, drawn
 * two ways: CarPlay (sidebar on the left: time, signal, home) and Android
 * Auto (bar along the bottom). Both show the same four things a driver may
 * press: On my way, On site, Paused, Done — and nothing that needs reading.
 */
const JOB = { who: 'Sarah Whitfield', where: 'Church Lane, Burbage', when: '09:00–11:00' }
const BUTTONS = [
  { label: 'On my way', bg: '#5856d6', Icon: VanIcon },
  { label: 'On site', bg: '#007aff', Icon: HouseIcon },
  { label: 'Paused', bg: '#ff9500', Icon: PauseIcon },
  { label: 'Done', bg: '#34c759', Icon: CheckIcon },
]

export default function CarDisplay({ variant = 'carplay', width = 560, className = '' }) {
  const h = Math.round(width * 0.52)
  const android = variant === 'android'
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height: h, fontSize: width / 560 * 16 }}>
      {/* the dash it sits in */}
      <div aria-hidden="true" className="absolute -inset-x-[6%] -bottom-[14%] -top-[8%] rounded-[16%/40%] bg-[#0d0f12]" style={{ boxShadow: '0 40px 60px -30px rgba(0,0,0,.8)' }} />
      {/* bezel */}
      <div className="absolute inset-0 rounded-[1.2em] bg-[#06070a] ring-1 ring-white/10" style={{ boxShadow: 'inset 0 0 0 0.35em #15181d' }} />
      {/* screen */}
      <div className={`absolute inset-[0.6em] overflow-hidden rounded-[0.8em] ${android ? 'bg-[#1b1e24]' : 'bg-[#0b0d12]'} text-white`}>
        <div className={`flex h-full ${android ? 'flex-col' : ''}`}>
          {!android && (
            <aside className="flex w-[14%] flex-col items-center justify-between border-r border-white/10 py-[1em] text-[0.7em]">
              <div className="text-center"><p className="font-semibold">08:42</p><p className="mt-[0.3em] text-white/50">●●●● 5G</p></div>
              <div className="grid gap-[0.9em] text-white/60"><span className="mx-auto h-[2.4em] w-[2.4em] rounded-[0.7em] bg-white/10" /><span className="mx-auto h-[2.4em] w-[2.4em] rounded-[0.7em] bg-white/10" /><span className="mx-auto h-[2.4em] w-[2.4em] rounded-[0.7em] bg-[#2e6b4b]" /></div>
              <span className="mx-auto h-[2em] w-[2em] rounded-full border border-white/40" />
            </aside>
          )}
          <main className="flex min-w-0 flex-1 flex-col px-[1.2em] py-[1em]">
            <div className="flex items-baseline justify-between">
              <p className="truncate text-[1.05em] font-semibold">{JOB.who} <span className="font-normal text-white/55">· {JOB.where}</span></p>
              <p className="shrink-0 text-[0.8em] text-white/55">Next · {JOB.when}</p>
            </div>
            <div className="mt-[0.8em] grid flex-1 grid-cols-4 gap-[0.7em]">
              {BUTTONS.map(({ label, bg, Icon }, i) => (
                <div key={label} className="flex flex-col items-center justify-center rounded-[1em] text-center"
                     style={{ background: i === 0 ? bg : `color-mix(in srgb, ${bg} 22%, #14171d)`, outline: i === 0 ? '0.18em solid rgba(255,255,255,.5)' : 'none' }}>
                  <Icon size={Math.round(width / 560 * 30)} />
                  <p className="mt-[0.5em] text-[0.9em] font-bold leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-[0.7em] text-center text-[0.72em] text-white/50">
              {android ? '“Hey Google, tell TurnUp I’m on my way.”' : '“Hey Siri, tell TurnUp I’m on my way.”'}
            </p>
          </main>
          {android && (
            <nav className="flex items-center justify-between border-t border-white/10 px-[1.2em] py-[0.5em] text-[0.7em] text-white/60">
              <span className="flex items-center gap-[0.8em]"><span className="h-[1.8em] w-[1.8em] rounded-full bg-white/15" /><span className="h-[1.8em] w-[1.8em] rounded-[0.5em] bg-white/15" /><span className="h-[1.8em] w-[1.8em] rounded-[0.5em] bg-[#2e6b4b]" /></span>
              <span>08:42 · 5G ▲▲▲</span>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
