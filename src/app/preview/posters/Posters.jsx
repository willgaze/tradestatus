'use client'
import Device from '@/components/Device'
import WalletHero from '@/components/WalletHero'
import { POSTERS } from '@/lib/posters'

/**
 * App Store-style artwork, drawn from the real screens.
 *
 * Each poster is a 621×1344 CSS canvas captured at 2× for 1242×2688, which is
 * the 6.5" App Store size. Big line, quiet line, then the device running off
 * the bottom edge — the grammar every store listing uses, because it is read
 * at thumbnail size on a phone in a queue.
 *
 * The screens are the captures in public/home/. Recapture; never retouch.
 */

const DEMO = {
  stage: 'ON_MY_WAY', jobRef: '2718', customerName: 'Sarah Whitfield',
  jobAddress: 'Church Lane, Burbage SN8', arrivingAt: '2026-10-01T07:00:00.000Z',
}

export function Poster({ p, scale = 1 }) {
  return (
    <div className="relative overflow-hidden text-white"
         style={{ width: 621 * scale, height: 1344 * scale, fontSize: 16 * scale, '--tint': p.tint,
                  background: `radial-gradient(90% 60% at 50% 100%, ${p.deep} 0%, transparent 70%), linear-gradient(170deg, ${p.tint} 0%, ${p.deep} 100%)` }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-25"
           style={{ background: 'radial-gradient(45% 30% at 85% 10%, #fff, transparent 70%)' }} />
      <div className="relative px-[3em] pt-[4.2em]">
        <p className="whitespace-pre-line text-[3.1em] font-bold leading-[1.02] tracking-[-0.035em]">{p.head}</p>
        <p className="mt-[1.1em] max-w-[16em] text-[1.25em] leading-snug text-white/80">{p.sub}</p>
      </div>
      <div className={`absolute inset-x-0 flex justify-center ${p.wallet ? 'inset-y-0 items-start pt-[17em]' : 'bottom-0'}`}>
        {p.wallet ? (
          <div className="w-[36em] scale-[1.18]"><WalletHero tracker={DEMO} tradeName="Sam Hale Plumbing" className="!rounded-[2.4em] !bg-transparent" /></div>
        ) : (
          <div className="translate-y-[6%]">
            <Device screen={p.screen} alt={p.alt} width={430 * scale} tilt priority />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Posters({ n }) {
  const list = n ? POSTERS.filter((p) => String(p.n) === String(n)) : POSTERS
  return (
    <div className="flex flex-wrap gap-6 bg-black p-0">
      {list.map((p) => <Poster key={p.n} p={p} />)}
    </div>
  )
}
