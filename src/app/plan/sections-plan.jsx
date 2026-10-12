'use client'
import { ChevronIcon, TickIcon } from '@/components/icons'

import { useState } from 'react'
import { DECISIONS, FACTS_TABLE, GTM_PHASES, MILESTONES, PLAN_META, REVIEWER, RISKS, TEAM, THE_ASK } from '@/lib/plan'
import { Check, Chips, Eyebrow, Light, Section, Sub, Table, Tag } from './ui'

/* The road ahead, the road so far, what could stop it, who is on it, what is
   being asked, what is decided, and where every number came from. */

export function GoToMarket() {
  return (
    <Section kicker="Go to market" title="Six moves, each with a gate">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GTM_PHASES.map((p) => (
          <div key={p.phase} className="glass r-inner p-5">
            <div className="flex items-center justify-between"><Eyebrow>Move {p.phase}</Eyebrow><Light state={p.state} /></div>
            <div className="text-[18px] font-bold leading-tight">{p.label}</div>
            <div className="text-[13px] muted">{p.when}</div>
            <div className="mt-3 rounded-full px-3 py-2 text-[12px] font-semibold text-white accent-fill">Gate: {p.gate}</div>
            <ul className="mt-3 grid gap-1 text-[14px]">
              {p.moves.map((m) => <li key={m} className="flex gap-2"><ChevronIcon size={14} style={{ color: 'var(--label-3)', marginTop: 4 }} />{m}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const day = (iso) => { const [y, m, d] = iso.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}` }

/** Every minor release, from the changelog. Nothing here is typed by hand. */
export function Timeline() {
  return (
    <Section kicker="So far" title={`${MILESTONES.length} releases, from the changelog`}>
      <ol className="relative grid gap-3 border-l-2 pl-6 hairline">
        {MILESTONES.map((m, i) => (
          <li key={m.version} className="relative">
            <span className={`absolute -left-[31px] top-4 h-4 w-4 rounded-full border-4 ${i === MILESTONES.length - 1 ? 'bg-stage-done' : 'bg-stage-booked/40'}`} style={{ borderColor: 'var(--theme-bg, #fff)' }} />
            <div className="glass r-inner px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[16px] font-bold">v{m.version}</span>
                <span className="text-[13px] tabular-nums muted">{day(m.date)}</span>
              </div>
              <div className="mt-1 text-[14px]">{m.note}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="fact" /> Read from src/lib/version.js at build time. <a href={PLAN_META.diaryUrl} target="_blank" rel="noreferrer" className="underline">The diary has the screenshots</a></div>
    </Section>
  )
}

export function Risks({ answers, set, readOnly }) {
  const tone = (l) => (l === 'high' ? 'red' : l === 'medium' ? 'amber' : 'green')
  return (
    <Section kicker="Risks" title="What could stop it">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RISKS.map((r) => (
          <div key={r.label} className="glass r-inner p-5">
            <div className="flex items-center justify-between"><Eyebrow>{r.likelihood}</Eyebrow><Light state={tone(r.likelihood)} /></div>
            <div className="mt-2 text-[17px] font-bold">{r.label}</div>
            <div className="text-[14px] muted">{r.answer}</div>
            {!readOnly && <div className="mt-3"><Check id={`risk:${r.label}`} answers={answers} set={set} /></div>}
          </div>
        ))}
      </div>
    </Section>
  )
}

export function Team({ answers, set, readOnly, shareUrl }) {
  return (
    <Section kicker="Who, and what is being asked" title="The ask">
      <div className="grid gap-3 sm:grid-cols-3">
        {TEAM.map((t) => (
          <div key={t.role} className="glass r-inner p-4">
            <Eyebrow>{t.role}</Eyebrow>
            <div className="mt-1 text-[14px]">{t.what}</div>
          </div>
        ))}
      </div>
      <div className="glass r-outer mt-4 p-5 tone-onsite">
        <div className="text-[15px] font-semibold">{THE_ASK.lead}</div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {THE_ASK.items.map((a) => (
            <li key={a.n} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: 'var(--tint)' }}>{a.n}</span>
              <span className="min-w-0"><span className="block text-[16px] font-bold">{a.label}</span><span className="block text-[13px] muted">{a.note}</span></span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {THE_ASK.notAsking.map((n) => (
            <span key={n} className="inline-flex items-center gap-1.5 rounded-full bg-black/[.06] px-3 py-1.5 text-[13px] font-semibold dark:bg-white/[.08]"><TickIcon size={14} />{n}</span>
          ))}
        </div>
      </div>
      {!readOnly && <Reviewer answers={answers} set={set} shareUrl={shareUrl} />}
    </Section>
  )
}

/** Owner-only: who is reading, what to ask, and the ducks in a row before sending. Never on the guest page. */
function Reviewer({ answers, set, shareUrl }) {
  const [copied, setCopied] = useState(false)
  const ready = REVIEWER.sendWhen.filter((g) => answers[`check:${g.id}`] === 'right').length
  const message = REVIEWER.message.replace('SHARE_LINK', shareUrl || '(the share link)')
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked */ }
  }
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Sub>Before it goes to {REVIEWER.name}</Sub>
        <span className="text-[13px] font-semibold tabular-nums muted">{ready} of {REVIEWER.sendWhen.length} ducks in a row</span>
      </div>
      <p className="mt-1 text-[13px] muted">Owner only. The guest page never shows this section.</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="glass r-inner p-4">
          <Eyebrow>Who he is, publicly</Eyebrow>
          <div className="mt-1 text-[14px]">{REVIEWER.relationship}</div>
          <div className="mt-2 rounded-xl px-3 py-2 text-[13px]" style={{ background: 'color-mix(in srgb, var(--stage-done) 14%, transparent)' }}>{REVIEWER.unconfirmed}</div>
          <div className="mt-3">
            <Table head={['', 'What', 'Source']}
                   rows={REVIEWER.facts.map((f) => [
                     <b key="f" className="whitespace-nowrap">{f.figure}</b>,
                     <span key="w">{f.what}</span>,
                     <a key="s" href={f.href} target="_blank" rel="noreferrer" className="underline muted">{f.source}</a>,
                   ])} />
          </div>
        </div>
        <div className="grid gap-3">
          <div className="glass r-inner p-4">
            <Eyebrow>Why him</Eyebrow>
            <ul className="mt-1 grid gap-1 text-[14px]">{REVIEWER.why.map((w) => <li key={w} className="flex gap-2"><ChevronIcon size={14} style={{ color: 'var(--label-3)', marginTop: 4 }} />{w}</li>)}</ul>
          </div>
          <div className="glass r-inner p-4 tone-paused">
            <Eyebrow tint>Watch out</Eyebrow>
            <ul className="mt-1 grid gap-1 text-[14px]">{REVIEWER.watchOut.map((w) => <li key={w} className="flex gap-2"><ChevronIcon size={14} style={{ color: 'var(--label-3)', marginTop: 4 }} />{w}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="glass r-inner mt-3 p-4">
        <Eyebrow>Six questions only he can answer</Eyebrow>
        <ol className="mt-2 grid gap-2 text-[14px]">
          {REVIEWER.ask.map((q, i) => (
            <li key={q} className="flex gap-3"><span className="w-5 shrink-0 text-right font-bold tabular-nums" style={{ color: 'var(--tint)' }}>{i + 1}</span><span>{q}</span></li>
          ))}
        </ol>
      </div>

      <div className="glass r-inner mt-3 p-4">
        <Eyebrow>Send when every one of these is true</Eyebrow>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {REVIEWER.sendWhen.map((g) => (
            <div key={g.id} className="flex items-start justify-between gap-3 rounded-xl px-3 py-2" style={{ background: 'rgb(var(--glass-line) / 0.08)' }}>
              <span className="text-[14px]">{g.label}</span>
              <Check id={g.id} answers={answers} set={set} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[13px] muted">{REVIEWER.notGatedOn}</p>
      </div>

      <div className="glass r-inner mt-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>The message, in your words</Eyebrow>
          <button type="button" onClick={copy} className="btn btn-grey text-[13px]">{copied ? 'Copied' : 'Copy the message'}</button>
        </div>
        <pre className="mt-2 whitespace-pre-wrap font-sans text-[14px] leading-relaxed">{message}</pre>
      </div>
    </div>
  )
}

export function Decide({ answers, set, readOnly }) {
  return (
    <Section kicker="Decide" title={readOnly ? 'What the owner has decided' : 'Only the owner can answer these'}>
      <div className="grid gap-3 sm:grid-cols-2">
        {DECISIONS.map((d) => {
          const value = answers[d.key] || d.decided
          return (
            <div key={d.key} className="glass r-inner p-5">
              <Tag kind="decision" />
              <div className="mt-2 text-[17px] font-bold">{d.question}</div>
              {d.decided && <div className="mt-1 text-[13px] muted">Decided {d.decidedAt}.{!readOnly && ' Tap another to change it on this device.'}</div>}
              <div className="mt-3"><Chips options={d.options} value={value} onPick={(o) => set(d.key, o)} readOnly={readOnly} /></div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

export function Facts() {
  return (
    <Section kicker="Facts" title="Every number, and where it came from">
      <Table head={['Figure', 'What', 'Source', 'Kind']}
             rows={FACTS_TABLE.map((f) => [
               <b key="f" className="whitespace-nowrap tabular-nums">{f.figure}</b>,
               <span key="w">{f.what}</span>,
               <a key="s" href={f.href} target="_blank" rel="noreferrer" className="underline muted">{f.source}</a>,
               <Tag key="k" kind={f.kind} />,
             ])} />
    </Section>
  )
}
