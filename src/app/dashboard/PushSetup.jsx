'use client'

import { useState } from 'react'
import { PUSH_CONFIGURED } from '../t/Notify'
import { BellIcon, CopyIcon, TickIcon } from '@/components/icons'
import Shot from '@/components/Shot'

/**
 * Turning push notifications on, without a terminal.
 *
 * There was a script for this, and the script was the wrong answer. It wanted
 * a cloned repo, Node, and a Vercel CLI login on a laptop, for somebody who
 * works off a phone between jobs. Told "run bash scripts/enable-push.sh" four
 * times, the honest reading is not that the instruction was unclear.
 *
 * WHY THE KEY IS MADE HERE AND NOT BY ME. A VAPID private key is a credential.
 * Generated in a Claude session it lands in a transcript; generated on a
 * random key-generator website it lands on somebody else's server. Generated
 * by this page it is made by the Web Crypto API on the phone in his hand, is
 * never sent anywhere, and vanishes when the page closes. That is the only
 * version of this that is both easy and correct.
 *
 * It then has to be carried to Vercel by hand, because a Claude session cannot
 * write a Vercel environment variable — the connector answers 403 to that, and
 * has every time it has been tried. Three copy buttons and a link is the
 * shortest honest path.
 *
 * The section disappears the moment push is configured. It is scaffolding.
 */

// TurnUp's own Vercel project, not a trade's. Overridable so a second
// deployment is a setting rather than an edit.
const VERCEL_PROJECT =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PATH || 'willgazes-projects/turnup'
const ENV_URL = `https://vercel.com/${VERCEL_PROJECT}/settings/environment-variables`
const DEPLOY_URL = `https://vercel.com/${VERCEL_PROJECT}/deployments`

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/**
 * A VAPID pair is just a P-256 keypair said a particular way: the public half
 * is the uncompressed point (65 bytes, 0x04 ‖ X ‖ Y) and the private half is
 * the 32-byte scalar, both base64url with no padding. The JWK export hands the
 * scalar over already encoded that way, so there is nothing to convert.
 */
async function makeVapidPair() {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'],
  )
  const raw = await crypto.subtle.exportKey('raw', pair.publicKey)
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  return { publicKey: b64url(raw), privateKey: jwk.d }
}

function Row({ name, value, hint }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { window.prompt(`Copy this ${name} value:`, value) }
  }
  return (
    <div className="r-inner mt-2.5 p-3.5" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
      <p className="font-mono text-[13px] font-bold">{name}</p>
      {hint && <p className="mt-0.5 text-[13px] muted">{hint}</p>}
      <p className="mt-2 select-all break-all font-mono text-[12px] leading-snug">{value}</p>
      <button type="button" onClick={copy} className="btn btn-grey mt-2.5 !min-h-[44px] !px-4 !text-[14px]">
        {copied ? <><TickIcon size={16} /> Copied</> : <><CopyIcon size={16} /> Copy the value</>}
      </button>
    </div>
  )
}

export default function PushSetup() {
  const [pair, setPair] = useState(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState(null)

  // Once the keys are in Vercel and the site has rebuilt, this is clutter.
  if (PUSH_CONFIGURED) return null

  const generate = async () => {
    setBusy(true); setProblem(null)
    try {
      setPair(await makeVapidPair())
    } catch {
      setProblem('This browser would not make the keys. Try Safari or Chrome rather than an in-app browser.')
    } finally { setBusy(false) }
  }

  return (
    <section className="glass r-outer mt-8 p-6">
      <span className="grid h-11 w-11 place-items-center rounded-2xl"
            style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
        <BellIcon size={21} />
      </span>
      <h2 className="mt-3 text-[19px] font-semibold">Turn on notifications</h2>
      <p className="mt-1.5 text-[16px] leading-snug muted">
        Their phone buzzes when you set off, arrive and finish. Three values into Vercel, one redeploy. Five minutes, on this phone.
      </p>
      {/* The row this switches on, on the CUSTOMER's page. Off until the keys are in. */}
      <Shot name="row-notify" label="The row it switches on, on their page" fade className="mt-4 max-w-[360px]" />

      {!pair ? (
        <>
          <button type="button" onClick={generate} disabled={busy} className="btn btn-filled mt-5 w-full">
            {busy ? 'Making them…' : 'Step 1 — Make my keys'}
          </button>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--label-3)' }}>
            Made on this phone and sent nowhere. Not even to this page&rsquo;s server.
          </p>
        </>
      ) : (
        <>
          <div className="r-inner mt-5 p-4"
               style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
            <p className="text-[15px] font-bold">Keep this page open until you have pasted all three.</p>
            <p className="mt-1 text-[14px] leading-snug">
              Close it and the keys are gone — not a disaster, you would just tap the button again and
              start over with new ones.
            </p>
          </div>

          <h3 className="mt-5 text-[17px] font-semibold">Step 2 — Open Vercel</h3>
          <a href={ENV_URL} target="_blank" rel="noreferrer" className="btn btn-tinted mt-2.5 w-full">
            Environment Variables ›
          </a>
          <p className="mt-2 text-[14px] leading-snug muted">
            For each of the three: <strong>Add New</strong>, name in <strong>Key</strong>, paste into <strong>Value</strong>, all three environments ticked, <strong>Save</strong>.
          </p>

          <h3 className="mt-5 text-[17px] font-semibold">Step 3 — The three values</h3>
          <Row name="NEXT_PUBLIC_VAPID_PUBLIC_KEY" value={pair.publicKey}
               hint="Goes to your customers' phones. Not a secret." />
          <Row name="VAPID_PRIVATE_KEY" value={pair.privateKey}
               hint="The secret half. Only Vercel should ever see this — do not paste it into a chat or an email." />
          <Row name="VAPID_SUBJECT" value="mailto:hello@getturnup.com"
               hint="A contact address, so Apple and Google can reach you if sending goes wrong." />

          <h3 className="mt-5 text-[17px] font-semibold">Step 4 — Redeploy</h3>
          <p className="mt-1.5 text-[14px] leading-snug muted">
            Nothing changes until the site rebuilds. Deployments, <strong>…</strong> on the top one, <strong>Redeploy</strong>. About two minutes.
          </p>
          <a href={DEPLOY_URL} target="_blank" rel="noreferrer" className="btn btn-tinted mt-2.5 w-full">
            Deployments ›
          </a>

          <h3 className="mt-5 text-[17px] font-semibold">Step 5 — Check it worked</h3>
          <p className="mt-1.5 text-[14px] leading-snug muted">
            Come back here and pull down to refresh. <strong>If this whole box has gone, it worked</strong> —
            it only shows while the keys are missing.
          </p>
          <div className="r-inner mt-3 p-4" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
            <p className="text-[15px] font-semibold">Then test it on your own phone</p>
            <ol className="mt-2 grid gap-1.5 text-[14px] leading-snug muted">
              <li>1. Open one of your tracking links in <strong>Safari</strong></li>
              <li>2. Share → <strong>Add to Home Screen</strong></li>
              <li>3. Open it again from the <strong>home screen icon</strong>, not the tab</li>
              <li>4. Tap <strong>Tell me when they set off</strong>, then Allow</li>
              <li>5. Move that job on from this dashboard — the notification should land</li>
            </ol>
            <p className="mt-2.5 text-[13px]" style={{ color: 'var(--label-3)' }}>
              On an iPhone, 2 and 3 are not optional: no notifications from a Safari tab, only from the home screen.
            </p>
          </div>
        </>
      )}

      {problem && (
        <p className="r-inner mt-3 p-3 text-[14px]"
           style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          {problem}
        </p>
      )}
    </section>
  )
}
