import Image from 'next/image'

/**
 * A screenshot in a phone-shaped frame.
 *
 * The homepage spent its first week describing the product in words and never
 * once showing it. These are real captures of the real screens (public/home/,
 * taken against `next start` from the same fixture the diary uses), not
 * drawings of what it might look like — if the app changes, recapture; do not
 * retouch.
 *
 * Every shot is 780×1560 at 2×, the top of a 390-wide phone, so the frames all
 * sit at the same height in a row.
 *
 * Eager, not lazy: seven pictures at ~50 KB each is less than one hero photo,
 * and a frame that is still black when the reader scrolls to it reads as broken.
 */
export default function Phone({ src, alt, caption, width = 780, height = 1560, className = '', priority = false }) {
  return (
    <figure className={`shrink-0 ${className}`}>
      <div className="overflow-hidden rounded-[30px] border-[5px] border-[#111] bg-[#111] shadow-[0_18px_40px_-18px_rgba(0,0,0,.45)]">
        <Image src={src} alt={alt} width={width} height={height} priority={priority} loading={priority ? undefined : 'eager'}
               sizes="(min-width: 640px) 220px, 60vw" className="block h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-2.5 text-center text-[14px] leading-snug muted">{caption}</figcaption>}
    </figure>
  )
}
