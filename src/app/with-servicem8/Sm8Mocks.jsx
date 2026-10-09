/**
 * ServiceM8's screens, drawn.
 *
 * These are not screenshots: nobody's ServiceM8 account belongs on a public
 * page, and ServiceM8's own help images belong to ServiceM8. So each one is
 * drawn from the layout of the real screen — the settings list on the left,
 * the form on the right, the one control that matters picked out — in the
 * same flat language as the rest of the site. The caption says so.
 */
const BLUE = '#2a6fdb'

export const SM8_LINE = (host) =>
  `Hi {job.contact_first}, your booking with {vendor.name} is confirmed for {job.next_booking_date}, arriving {job.next_booking_time}. Follow the job here — it moves as the day does: https://${host}/j/{job.generated_job_id}  — {calculation.current_user_first}`

function Window({ title, nav, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white text-[12px] text-[#1d2430] shadow-[0_18px_40px_rgba(0,0,0,.18)]">
      <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#f3f4f6] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-[#6b7280]">go.servicem8.com · {title}</span>
      </div>
      <div className="flex min-h-[230px]">
        <aside className="w-[27%] shrink-0 border-r border-black/10 bg-[#f8f9fb] p-2 text-[10.5px]">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a93a3]">Settings</p>
          {nav.map(([label, on]) => (
            <p key={label} className={`truncate rounded-md px-1.5 py-1 ${on ? 'bg-white font-semibold shadow-sm' : 'text-[#5b6472]'}`} style={on ? { color: BLUE } : undefined}>{label}</p>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3.5">{children}</div>
      </div>
    </div>
  )
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a93a3]">{label}</span>
    <div className="mt-0.5 rounded-lg border border-black/15 px-2.5 py-1.5">{children}</div>
  </label>
)
const Button = ({ children, ghost }) => (
  <span className={`inline-block rounded-lg px-3 py-1.5 text-[12px] font-semibold ${ghost ? 'border border-black/15 text-[#5b6472]' : 'text-white'}`} style={ghost ? undefined : { background: BLUE }}>{children}</span>
)
const Toggle = ({ on }) => (
  <span className={`relative inline-block h-5 w-9 rounded-full ${on ? '' : 'bg-[#cfd4dc]'}`} style={on ? { background: '#34c759' } : undefined}>
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${on ? 'left-[18px]' : 'left-0.5'}`} />
  </span>
)
const Tick = ({ on }) => (
  <span className="grid h-4 w-4 place-items-center rounded-[4px] border text-[10px] font-bold text-white" style={on ? { background: BLUE, borderColor: BLUE } : { borderColor: '#aab1bd' }}>{on ? '✓' : ''}</span>
)

export function Sm8Window({ kind, host = 'www.getturnup.com' }) {
  if (kind === 'template') {
    const line = SM8_LINE(host)
    const i = line.indexOf('https://')
    return (
      <Window title="SMS Templates" nav={[['Account', false], ['Staff', false], ['Email', false], ['SMS', true], ['Automations', false], ['Add-ons', false]]}>
        <p className="text-[13px] font-semibold">Edit SMS Template</p>
        <div className="mt-2 grid gap-2">
          <Field label="Template name">Booking Confirmation</Field>
          <Field label="Message">
            <p className="leading-snug">
              {line.slice(0, i)}<mark className="break-all rounded px-0.5" style={{ background: '#fff2a8' }}>{line.slice(i, line.indexOf('  —'))}</mark>{line.slice(line.indexOf('  —'))}
            </p>
          </Field>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-[#8a93a3]">SMS Template Fields ▾</span>
          <Button>Save Changes</Button>
        </div>
      </Window>
    )
  }
  if (kind === 'automation') {
    return (
      <Window title="Automations" nav={[['Account', false], ['Email', false], ['SMS', false], ['Automations', true], ['Add-ons', false]]}>
        <p className="text-[13px] font-semibold">Automations</p>
        {[['Booking Confirmation', true], ['Booking Reminder', false], ['Quote Follow Up', false], ['Payment Follow Up', false]].map(([n, on]) => (
          <div key={n} className={`mt-2 flex items-center justify-between rounded-lg border px-2.5 py-2 ${on ? 'border-[#2a6fdb]/40 bg-[#eef4ff]' : 'border-black/10'}`}>
            <span className={on ? 'font-semibold' : 'text-[#5b6472]'}>{n}</span>
            <span className="flex items-center gap-2">{on && <span className="text-[10px] font-semibold" style={{ color: BLUE }}>Edit</span>}<Toggle on={on} /></span>
          </div>
        ))}
        <p className="mt-2.5 text-[11px] text-[#5b6472]">Send by: <b>SMS</b> · Template: <b>Booking Confirmation</b></p>
      </Window>
    )
  }
  // booking dialog from the job card
  return (
    <Window title="Job 2718 · Schedule" nav={[['Dispatch', true], ['Schedule', false], ['Clients', false], ['Settings', false]]}>
      <p className="text-[13px] font-semibold">Add Booking</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Field label="Date">Thu 16 Oct</Field>
        <Field label="Time">09:00 – 11:00</Field>
      </div>
      <Field label="Staff"><span className="mt-0 block">Will</span></Field>
      <div className="mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: '#fff2a8' }}>
        <Tick on /> <span className="font-semibold">Send Booking Confirmation</span>
      </div>
      <div className="mt-3 flex justify-end gap-2"><Button ghost>Cancel</Button><Button>Save Booking</Button></div>
    </Window>
  )
}

/* The ServiceM8 app on a phone: a job card with the one button that matters. */
export function Sm8Phone({ kind }) {
  const checkin = kind === 'checkin', navigate = kind === 'navigate', complete = kind === 'complete', checkout = kind === 'checkout'
  return (
    <div className="min-h-full bg-[#f2f3f5] pt-[56px] text-[14px] text-[#1d2430]">
      <div className="flex items-center justify-between px-4 pb-2 text-[13px]" style={{ color: BLUE }}><span>‹ Jobs</span><span>•••</span></div>
      <div className="mx-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a93a3]">Job 2718 · Work Order</p>
        <p className="mt-1 text-[18px] font-bold">Sarah Whitfield</p>
        <p className="text-[13px] text-[#5b6472]">14 Church Lane, Burbage SN8 3AQ</p>
        <p className="mt-2 text-[13px]">Unvented cylinder swap</p>
        <div className="mt-3 flex gap-2 text-[11px] text-[#5b6472]"><span className="rounded-md bg-[#eef0f3] px-2 py-1">Thu 09:00–11:00</span><span className="rounded-md bg-[#eef0f3] px-2 py-1">Will</span></div>
      </div>
      <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
        {[['Navigate', navigate], ['Check In', checkin], ['Check Out', checkout], ['Complete Job', complete]].map(([l, on]) => (
          <span key={l} className={`rounded-xl px-3 py-3 text-center text-[14px] font-semibold ${on ? 'text-white shadow-md' : 'bg-white text-[#5b6472]'}`} style={on ? { background: complete && on ? '#34c759' : BLUE } : undefined}>{l}</span>
        ))}
      </div>
      <div className="mx-3 mt-3 rounded-2xl bg-white p-3 text-[12px] text-[#5b6472] shadow-sm">
        <p className="font-semibold text-[#1d2430]">Diary</p>
        <p className="mt-1">07:48 · Booking confirmation sent by SMS</p>
        {(checkin || checkout || complete) && <p>09:04 · Checked in · Will</p>}
        {(checkout || complete) && <p>10:40 · Checked out · Will</p>}
        {complete && <p>12:15 · Job completed</p>}
      </div>
    </div>
  )
}

/* The text as it lands, with the link in it. */
export function SmsMock({ host = 'www.getturnup.com', from = 'Sam Hale Plumbing' }) {
  return (
    <div className="min-h-full bg-white pt-[52px] text-[#15161a]">
      <div className="border-b border-black/10 pb-3 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#8e8e93] text-[16px] font-semibold text-white">{from.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
        <p className="mt-1 text-[12px]">{from} ›</p>
      </div>
      <div className="px-4 pt-6">
        <p className="mb-2 text-center text-[11px] text-[#8e8e93]">Text Message · Today 07:48</p>
        <div className="mr-auto max-w-[86%] rounded-[20px] rounded-bl-[6px] bg-[#e9e9eb] px-4 py-2.5 text-[15px] leading-snug">
          Hi Sarah, your booking with {from} is confirmed for Thursday 16 October, arriving 09:00–11:00. Follow the job here — it moves as the day does: <span className="underline" style={{ color: '#0a84ff' }}>{host}/j/2718</span> — Sam
        </div>
        <p className="ml-2 mt-1 text-[11px] text-[#8e8e93]">Sent by ServiceM8 · Booking Confirmation</p>
      </div>
    </div>
  )
}
