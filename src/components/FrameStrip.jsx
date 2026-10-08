import Image from 'next/image'
import { frameSrc } from '@/lib/posters'

/**
 * A row of frames you swipe through on a phone and see three-across on a
 * desktop. Each is a 1242×2688 capture from /preview/posters, so the same
 * files serve the website and any store listing later.
 */
export default function FrameStrip({ frames, eager = 3 }) {
  return (
    <ul className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {frames.map((f, i) => (
        <li key={f.key} className="w-[256px] shrink-0 snap-center sm:w-[232px]">
          <Image src={frameSrc(f)} alt={`${f.head.replace(/\n/g, ' ')} ${f.sub}`}
                 width={1242} height={2688} loading={i < eager ? 'eager' : 'lazy'} sizes="256px"
                 className="block h-auto w-full rounded-[22px] shadow-[0_18px_40px_-18px_rgba(0,0,0,.5)]" />
        </li>
      ))}
    </ul>
  )
}
