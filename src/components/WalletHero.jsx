'use client'
import PassCard, { Sliver } from '@/components/PassCard'

// Brighter neighbours than the dashboard's: on a dark hero a near-black coffee
// card is an invisible card. Still generic, still nobody's brand.
const HERO_CARDS = [
  { name: 'Coffee',  sub: '12 stamps', bg: '#f3e4cf', fg: '#3b2a16' },
  { name: 'Rail',    sub: 'Season',    bg: '#1e5c8f', fg: '#e3eef8' },
  { name: 'Gym',     sub: 'Member',    bg: '#f2f2f4', fg: '#1d1d1f' },
  { name: 'Library', sub: 'Card',      bg: '#2f7a46', fg: '#e7f2ea' },
]

/**
 * The card in a wallet, with depth.
 *
 * StackView (PassCard.jsx) is the flat, honest version and the dashboard keeps
 * it: it is the one you measure against. This is the one for the front page.
 * Same card, same neighbours, but laid in real 3D — the stack recedes, the pass
 * is lifted towards the reader and tilted the way a card is when you pull it
 * out of a wallet, and the light catches it. CSS only, so it costs nothing and
 * reads the live stage like everything else.
 *
 * Reduced motion is respected by not having any: nothing here animates.
 */
export default function WalletHero({ tracker, tradeName, logo = null, className = '' }) {
  const behind = HERO_CARDS.slice(0, 2)
  const front = HERO_CARDS.slice(2)
  return (
    <div className={`relative overflow-hidden rounded-[30px] bg-[#0b0c10] ${className}`}>
      {/* a soft pool of the stage colour behind the card, so the black is not flat */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
           style={{ background: 'radial-gradient(60% 45% at 55% 42%, color-mix(in srgb, var(--tint, #5856d6) 38%, transparent), transparent 70%)' }} />
      <div className="relative mx-auto w-[300px] translate-x-4 scale-[.92] px-2 pb-10 pt-24" style={{ perspective: '1000px' }}>
        <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(28deg) rotateY(-16deg) rotateZ(6deg)' }}>
          {/* the stack recedes: each card a step further back and a step higher,
              the way a wallet fans. They stay bright — a dimmed card on a black
              page is an invisible card, which is how the first attempt lost them. */}
          {behind.map((n, i) => (
            <div key={n.name} className={i ? '-mt-[30px]' : ''}
                 style={{ transform: `translateZ(${-34 + i * 14}px) translateY(${-118 + i * 36}px) translateX(${-6 + i * 4}px)`,
                          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))' }}>
              <Sliver card={n} />
            </div>
          ))}
          {/* the pass, pulled out towards you and turned a little in the hand */}
          <div className="relative -mt-[26px]"
               style={{ transform: 'translateZ(96px) translateY(-10px) translateX(8px) rotateX(-9deg) rotateY(7deg) rotateZ(-2deg)',
                        filter: 'drop-shadow(0 48px 48px rgba(0,0,0,.75)) drop-shadow(0 12px 16px rgba(0,0,0,.5))' }}>
            <div className="relative overflow-hidden rounded-[22px]">
              <PassCard tracker={tracker} logo={logo} tradeName={tradeName} />
              {/* a sheet of light across the face — the thing that makes a flat rectangle read as a card */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px]"
                   style={{ background: 'linear-gradient(118deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.08) 26%, rgba(255,255,255,0) 44%, rgba(0,0,0,.14) 100%)' }} />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/20" />
            </div>
          </div>
          {front.map((n, i) => (
            <div key={n.name} className="relative -mt-[22px]"
                 style={{ transform: `translateZ(${-10 - i * 30}px) translateY(${8 + i * 6}px)`,
                          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))' }}>
              <Sliver card={n} />
            </div>
          ))}
        </div>
        {/* the floor, under the stack rather than under the page */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-1/2 h-8 w-[240px] -translate-x-1/2 rounded-full bg-black/85 blur-xl" />
      </div>
    </div>
  )
}
