'use client'

import { useCallback, useEffect, useState } from 'react'
import { STAGES, STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'

const timeOnly = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const dayAndTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })

const dayOnly = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export default function StatusTracker({ initialStatus }) {
  const [status, setStatus] = useState(initialStatus)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/status/${initialStatus.code}`, { cache: 'no-store' })
      if (!r.ok) return
      const data = await r.json()
      if (data?.status) setStatus(data.status)
    } catch {
      // A failed poll leaves the customer with the status they already have,
      // which is the right answer on a phone with two bars of signal.
    }
  }, [initialStatus.code])

  useEffect(() => {
    const timer = setInterval(refresh, 30000)
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const current = stageOf(status.stage)
  const isPaused = status.stage === 'PAUSED'
  const isDone = status.stage === 'DONE'

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          My Trade Status
        </p>
        <p className="text-sm text-slate-500">{TRADE_NAME}</p>
      </div>

      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
        {status.customerName ? `Hello ${status.customerName}` : 'Your job'}
      </h1>
      {status.jobSummary && <p className="mt-1 text-lg text-slate-600">{status.jobSummary}</p>}

      {/* The one thing they opened this for */}
      <section
        className={`mt-7 rounded-2xl border p-6 ${
          isPaused ? 'border-amber-300 bg-amber-50'
          : isDone ? 'border-green-300 bg-green-50'
          : 'border-brand-200 bg-white'
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl" aria-hidden="true">{current.icon}</span>
          <div>
            <p className="text-2xl font-bold">{current.label}</p>
            <p className="mt-1 text-slate-700">{current.customerLine}</p>
            {status.stageNote && (
              <p className="mt-3 rounded-lg bg-white/80 p-3 text-slate-800">{status.stageNote}</p>
            )}
            {status.stage === 'ON_MY_WAY' && status.arrivingAt && (
              <p className="mt-3 text-sm text-slate-500">Set off at {timeOnly(status.arrivingAt)}.</p>
            )}
          </div>
        </div>
      </section>

      <ol className="mt-7 grid grid-cols-4 gap-2" aria-label="Job progress">
        {STAGE_ORDER.map((key) => {
          const step = STAGES[key]
          const reached = current.step >= step.step && !(isPaused && step.key === 'ON_SITE')
          return (
            <li key={key} className="text-center">
              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  reached ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {step.step}
              </div>
              <p className={`mt-2 text-xs sm:text-sm ${
                status.stage === key ? 'font-bold text-slate-900' : 'text-slate-500'
              }`}>
                {step.label}
              </p>
            </li>
          )
        })}
      </ol>

      <dl className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        {status.scheduledFor && (
          <div>
            <dt className="text-sm text-slate-500">Booked for</dt>
            <dd className="font-semibold">{dayOnly(status.scheduledFor)}</dd>
          </div>
        )}
        {status.jobAddress && (
          <div>
            <dt className="text-sm text-slate-500">Address</dt>
            <dd className="font-semibold">{status.jobAddress}</dd>
          </div>
        )}
        {status.jobRef && (
          <div>
            <dt className="text-sm text-slate-500">Job reference</dt>
            <dd className="font-semibold">{status.jobRef}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-slate-500">Last updated</dt>
          <dd className="font-semibold">{status.updatedAt ? dayAndTime(status.updatedAt) : '—'}</dd>
        </div>
      </dl>

      {status.events?.length > 1 && (
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">What has happened so far</h2>
          <ul className="mt-4 space-y-3">
            {[...status.events].reverse().map((e) => (
              <li key={`${e.stage}-${e.at}`} className="flex gap-3">
                <span aria-hidden="true">{stageOf(e.stage).icon}</span>
                <div>
                  <p className="font-semibold">{stageOf(e.stage).label}</p>
                  <p className="text-sm text-slate-500">{dayAndTime(e.at)}</p>
                  {e.note && <p className="mt-1 text-slate-700">{e.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {TRADE_PHONE && (
        <section className="mt-7 rounded-2xl bg-brand-700 p-6 text-white">
          <h2 className="text-lg font-bold">Need to change something?</h2>
          <p className="mt-1 text-white/90">
            Call or message {TRADE_NAME} directly — it is the same person doing the work.
          </p>
          <a
            href={`tel:${TRADE_PHONE_TEL}`}
            className="mt-4 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-brand-700"
          >
            Call {TRADE_PHONE}
          </a>
        </section>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">This page updates itself.</p>
    </main>
  )
}
