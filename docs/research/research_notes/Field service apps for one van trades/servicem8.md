# ServiceM8 (servicem8.com) — competitive briefing for a one-van trade business, as of October 2026

Scope note: researched 10 Oct 2026. ServiceM8 shipped "ServiceM8 15" in September 2026 and "ServiceM8 14" in August/September 2025, so help-centre articles older than those releases may describe menus that have moved. Where an article is undated or visibly old, that is flagged. Prices are GBP from the UK pricing page unless marked AUD/USD. Reddit is blocked to the crawler used here, so "real user" evidence below is Trustpilot UK, Capterra (via search summaries; the review pages themselves returned 403), and two UK comparison blogs (both affiliate-linked, treat with care).

## Key question 1: Full feature inventory (what ServiceM8 does for a one-van business)

### Takeaway
ServiceM8 is a job-centric system: everything (quotes, bookings, check-ins, photos, forms, messages, payments, automations) hangs off a Job card with a Diary, and most capabilities beyond the core are "add-ons" switched on in Settings that are gated by plan tier rather than priced separately. The 2025–2026 releases pushed hard into AI (Office Agent, Phone Agent, Auto-Quote, MCP) and finally delivered a full-featured Android app.

### Cited Findings

**Core job lifecycle**
- Four job statuses only: Quote (Q), Work Order (W), Completed (C), Unsuccessful (U); Unsuccessful means "the quote was not accepted or the job has been cancelled" — [ServiceM8 Help: What does Job Status mean](https://support.servicem8.com/help-center/app/faq/what-does-job-status-mean)
- Dispatch Board colours: Quote orange, Work Order blue, Completed green, Unsuccessful red; Unsuccessful jobs stay on the board for 48 hours then drop out of standard lists and can be switched back later — [Dispatch Board overview](https://support.servicem8.com/hc/en-us/articles/200272704-Dispatch-Board-Overview); [How to mark a job as unsuccessful](https://support.servicem8.com/hc/en-us/articles/200029769-How-to-mark-a-job-as-unsuccessful)
- Quote acceptance portal: customer gets an email/SMS link (template must contain `{document}`), opens a branded online page, can accept, forward, save, or ask a question; acceptance can auto-move the job Quote → Work Order; questions land in the ServiceM8 Inbox and job card — [How to use a quote acceptance](https://support.servicem8.com/help-center/desktop/invoicing/how-to-use-a-quote-acceptance)
- Quote versions and multiple quote options are viewable/acceptable in the same portal — [How Quote Versions & Quote Options work](https://support.servicem8.com/help-center/desktop/invoicing/how-quote-versions-quote-options-work)
- Proposals (add-on, Growing tier and up): richer quote documents; online acceptance changes status to Work Order and writes a Diary note — [How to create and send Proposals](https://support.servicem8.com/hc/en-us/articles/8173320604815-How-to-create-and-send-Proposals); tier gating from [UK pricing](https://www.servicem8.com/uk/pricing)
- Auto-Quote and Auto-Invoice (AI drafts from job info, for review) — [How to use Auto-Quote and Auto-Invoice](https://support.servicem8.com/hc/en-us/articles/8173320606479-How-to-use-Auto-Quote-and-Auto-Invoice); listed as part of ServiceM8 15 "Approval Actions" — [September 2026 update](https://www.servicem8.com/september-2026-update)
- Online invoice: with ServiceM8 Pay on, the online invoice page carries a "Pay Now" card button; funds land next business day minus fees — [How to get started with ServiceM8 Pay](https://support.servicem8.com/hc/en-us/articles/10116128052495-How-to-get-started-with-ServiceM8-Pay)
- ServiceM8 15 added a preference to hide the card-payment option on higher-value invoices viewed online — [September 2026 update](https://www.servicem8.com/september-2026-update)

**Scheduling, dispatch, allocations**
- Job Allocations add-on: instead of a fixed time the job gets a Booking Window, Estimated Work time, Start Date and a Booking Expiry (after which it is un-allocated for reassignment, e.g. "within an hour" for urgent work). Allocate by dragging onto a staff icon on the Dispatch Board or via the app's Allocate screen — [Job Allocations overview and setup](https://support.servicem8.com/hc/en-us/articles/200272634-Job-Allocations-Overview-and-Setup); [How to allocate jobs in booking windows](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-allocate-jobs-in-booking-windows)
- Allocation Windows are user-defined under Settings > Allocation Windows (name, start, end, priority 1 = urgent/top of list … 5 = anytime/bottom) — [How to change allocation window times](https://support.servicem8.com/hc/en-us/articles/200029679-Job-Allocations-How-to-change-allocation-window-times)
- The merge field `{job.next_booking_time}` inserts the allocation window's start and end into email/SMS templates — [How to insert an Allocation Window in templates](https://support.servicem8.com/help-center/servicem8-add-ons/job-allocations/how-to-insert-an-allocation-window-in-email-sms-templates)
- ServiceM8 15 adds a default Job Allocation expiry, a redesigned Staff Schedule, a Day View, a weekly "New Booking Experience" showing gaps and travel time, and "Schedule from Job card" — [ServiceM8 15 help page](https://support.servicem8.com/help-center/tips-trick-more/more/servicem8-15); [September 2026 update](https://www.servicem8.com/september-2026-update)
- Arrival Window (account-level, Settings > Preferences > Job Settings) controls whether the customer sees an exact time or a window; if unset, enabling Services/Self-Serve Online Booking defaults it to 2 hours — [How to create Online Booking Forms & Services](https://support.servicem8.com/hc/en-us/articles/115005042263-How-to-create-Online-Booking-Forms-Services)
- Queues: jobs can be parked in named queues and moved between them (Office Agent can also move queue) — [How to manage jobs with queues](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-manage-jobs-with-queues); [Introducing Office Agent](https://support.servicem8.com/help-center/servicem8-add-ons/office-agent/introducing-office-agent)
- "Action Required" view surfaces jobs needing scheduling/follow-up — [Using Action Required](https://support.servicem8.com/hc/en-us/articles/115005723046-Using-Action-Required-to-keep-on-top-of-jobs-and-scheduling)
- Auto-Route (new job routing) shipped in ServiceM8 14 and is listed as available on all plans — [ServiceM8 14 app update](https://www.servicem8.com/updates/servicem8-14-app-update); [UK pricing](https://www.servicem8.com/uk/pricing)
- CarPlay: "directions" then "notify client and navigate" sends the On-the-Way text with ETA from the car screen; ServiceM8 14 added CarPlay job allocation — [How ServiceM8 works with CarPlay](https://support.servicem8.com/hc/en-us/articles/360004096735-How-ServiceM8-works-with-CarPlay); [ServiceM8 14 app update](https://www.servicem8.com/updates/servicem8-14-app-update)
- Recurring Jobs + Reminders add-on (all plans) — [Recurring Jobs overview](https://support.servicem8.com/hc/en-us/articles/203323340-Recurring-Jobs-Reminders-Add-on-Overview); [UK pricing](https://www.servicem8.com/uk/pricing)

**Messaging and automations**
- Two-Way SMS is a mobile web portal, not a native text thread: each outgoing SMS ends with a "Reply here" link; if the message already contains a link (invoice, Track My Arrival) the footer becomes "To reply, tap the link above". Replies (including photos) go to the job Diary and push-notify the staff member who last texted; replies on paid/completed jobs are also copied to the Inbox — [How to use Two-Way SMS](https://support.servicem8.com/hc/en-us/articles/360001171696-How-to-use-ServiceM8-s-Two-Way-SMS)
- The portal shows logo, business name, business number, a speed-dial, an unsubscribe button and a Photo button — same source.
- Australia only, from July 2026: a compliance header "From: Your Business Name (ABN)" and footer are injected on first contact / first in 30 days / promotional messages — same source.
- SMS attachments (photos/files by text) arrived with ServiceM8 14 — [ServiceM8 14 app update](https://www.servicem8.com/updates/servicem8-14-app-update)
- Automation add-on: five pre-built (Booking Confirmation, Booking Reminder, Customer Feedback, Payment Follow Up, Quote Follow Up) plus three situational (Badge Follow Up, Form Inbox Follow Up, Live Invoice Statements). Each can go SMS, email or both; scheduled messages can be stopped from Settings > Automation; the job Diary shows scheduled/processed automations with warnings (e.g. missing email) — [Automation overview](https://support.servicem8.com/hc/en-us/articles/214222743-Automation-overview)
- Booking Confirmation fires only for bookings made in the app or via the job card's New Booking window — "Dragging jobs onto the Schedule or Calendar will not send a booking confirmation"; per-booking checkbox/toggle, sent "within a few minutes" — [Booking Confirmation Automation](https://support.servicem8.com/hc/en-us/articles/360002070355-Booking-Confirmation-Automation)
- Booking Reminder only goes to jobs carrying the Booking Reminder badge; timing configurable (e.g. 8 hours before); SMS reminders are only sent 07:00–19:00, later ones are held to 07:00 next day — [How to set automatic booking reminders](https://support.servicem8.com/help-center/servicem8-add-ons/automation/how-to-set-automatic-booking-reminders)
- Payment Follow Up clock starts when status becomes Completed and is suppressed once paid; Quote Follow Up is suppressed if the client responded or status moved past Quote, and can auto-set unaccepted quotes to Unsuccessful after a chosen period — [Payment Follow Up](https://support.servicem8.com/hc/en-us/articles/212550846-Payment-Follow-Up-Automation); [Quote Follow Up](https://support.servicem8.com/hc/en-us/articles/212550866-Quote-Follow-Up-Automation)
- Customer Feedback automation sends after the invoice is paid; with the Customer Feedback add-on and a Google Reviews link set, the `{feedback}` link goes straight to Google; not sent for £0 invoices; 30-day pause for repeat clients — [Customer Feedback Automation](https://support.servicem8.com/hc/en-us/articles/360002067236-Customer-Feedback-Automation)
- Badge Follow Up: a message N months after completing a job with a given badge, optionally cancelled if the client rebooks first — [Badge Follow Up Automation](https://support.servicem8.com/hc/en-us/articles/212550886-Badge-Follow-Up-Automation)
- ServiceM8 15 added an "Automations mini tab" on the Job card, weekday-name merge fields, and sending email from your own domain — [ServiceM8 15 help page](https://support.servicem8.com/help-center/tips-trick-more/more/servicem8-15)
- Branded SMS (custom sender ID) is a Premium-and-up feature — [UK pricing](https://www.servicem8.com/uk/pricing)
- ServiceM8 Inbox (shared email inbox that converts enquiries to jobs) is Growing-and-up — [UK pricing](https://www.servicem8.com/uk/pricing)

**Online booking (Services add-on)**
- Services define pricing (fixed or variable via conditional questions), duration, capable staff, booking type (Schedule a Quote / Schedule a Service / enquiry only). Public booking page can be linked from website/socials. Bookings are diverted to an enquiry when over a "Manually approve jobs over" value, when a trigger answer is hit, or when the address is outside the Service Radius; a per-km Travel Distance Surcharge can be shown — [How to create Online Booking Forms & Services](https://support.servicem8.com/hc/en-us/articles/115005042263-How-to-create-Online-Booking-Forms-Services)
- Deposits/pre-payment during booking require visible pricing, Online Payment settings and a Stripe connection — [Self-serve scheduling & deposits with Services](https://support.servicem8.com/help-center/servicem8-add-ons/services-online-booking/self-serve-customer-scheduling-deposits-with-services)
- SMS Booking Links: single-use, expire after 14 days, one visit/one staff member; without a Service, times offered are from tomorrow for two weeks (no same-day); availability checked when opened; links do not show pricing or take payment — [How SMS Booking Links work](https://support.servicem8.com/hc/en-us/articles/360000473356-How-SMS-Booking-Links-work)

**Field capture**
- Forms & Certificates and Asset Management are Growing-and-up; Purchased Forms available on Free — [UK pricing](https://www.servicem8.com/uk/pricing)
- ServiceM8 15: Full Form Mode, Duplicate Form, photo markup online, barcode lookup via Job camera, "Imagine" AI images from job photos, Room Scan wall colours, Apple Watch app (Clock On, Check Out, job details, voice notes) — [ServiceM8 15 help page](https://support.servicem8.com/help-center/tips-trick-more/more/servicem8-15); [September 2026 update](https://www.servicem8.com/september-2026-update)
- Staff Chat (team DMs/channels), note threads with @mentions and emoji reactions — [September 2026 update](https://www.servicem8.com/september-2026-update)

**Staff tracking and timesheets**
- Dispatch Map shows only staff who are Clocked On with GPS allowed; checked-in shows a timer, navigating shows ETA and a green line to the job; staff are hidden while Clocked Off or On Break — [How to View Staff Status](https://support.servicem8.com/hc/en-us/articles/360001167495-How-to-View-Staff-Status)
- Job Time entries can be converted to invoice labour lines with a labour rate, rounding interval and optional travel time (60-minute rounding turns 1h10 into 2h) — [How to edit Check In data](https://support.servicem8.com/hc/en-us/articles/208183176-How-to-edit-Check-In-data)

**Payments and accounting**
- ServiceM8 Pay (Stripe-powered) UK: standard domestic 1.65% + 20p, premium domestic 2.10% + 20p, EU 2.70% + 20p, international/Amex 3.45% + 20p, dispute fee £15, next-business-day payout; "current as of September 2024" — [ServiceM8 Pay card processing fees](https://support.servicem8.com/hc/en-us/articles/10116208886927-ServiceM8-Pay-card-processing-fees-payout-speed). The UK marketing page says "from 1.7% + 20p" — [ServiceM8 Pay UK](https://www.servicem8.com/uk/servicem8-pay)
- PayByBank (UK open banking) 0.75% + 20p, no surcharging — [PayByBank with ServiceM8 Pay (UK)](http://support.servicem8.com/help-center/servicem8-add-ons/servicem8-pay/how-to-use-paybybank-with-servicem8-pay-uk)
- Tap to Pay on iPhone and (activation permitting) Android — [About the ServiceM8 Android app](https://support.servicem8.com/hc/en-us/articles/10781739471247-About-the-ServiceM8-Android-app-ServiceM8-Lite)
- Xero: invoices one-way (on Approve), payments two-way (Xero payments reach ServiceM8 within ~30 min), contacts and items two-way after first sync; article is several years old — [How the sync with Xero works](https://support.servicem8.com/hc/en-us/articles/204753684-How-the-sync-with-Xero-works)
- QuickBooks Online integration exists — [QuickBooks Online Job Management (UK)](https://www.servicem8.com/uk/quickbooks-online-integration); a UK blog notes no native Sage integration — [DashLink Media](https://dashlink.media/best-job-management-apps-for-uk-tradespeople/)

**Phone, AI and agents**
- ServiceM8 Phone: VoIP, from £15/mo, no per-user fee, 1-month free trial with a subscription — [UK pricing](https://www.servicem8.com/uk/pricing); an older UK phone page lists Connect £15/mo (500 min), Connect Plus £25/mo and Unlimited £119/mo with AI Phone Agent — [ServiceM8 Phone UK](https://www.servicem8.com/uk/phone) (page flagged by search as ~6 years old in parts; treat tier prices as unverified)
- Phone needs internet (VoIP) with a cellular fallback mode; the Chrome extension needs the computer awake and logged in — [ServiceM8 Phone FAQs](https://support.servicem8.com/hc/en-us/articles/360002070275-ServiceM8-Phone-FAQs)
- Phone Agent (AI receptionist): Business Hours / After Hours / Voicemail modes; answers FAQs, takes messages to Inbox, texts a booking link, submits bookings, transfers urgent calls, filters spam, logs summary + transcript + recording; on Connect Plus and Unlimited plans; pre-19 Sep 2025 Phone customers get After Hours mode free — [Introducing the ServiceM8 Phone Agent](https://support.servicem8.com/hc/en-us/articles/13816741328271-Introducing-the-ServiceM8-Phone-Agent)
- Office Agent (AI office assistant): finds/summarises jobs, drafts SMS/email/quotes/invoices, prepares bookings and allocations, all behind an approve step ("Approving carries out the action"); base chat included on paid plans, scheduled tasks need Office Agent Pro (separately charged) and Business Owner role — [Introducing Office Agent](https://support.servicem8.com/help-center/servicem8-add-ons/office-agent/introducing-office-agent); [What does ServiceM8 cost](https://support.servicem8.com/hc/en-us/articles/115005699046-What-does-ServiceM8-Cost)
- MCP connections to ChatGPT and Claude (find jobs, check availability, send messages) and an Addon Kit CLI for building private add-ons with AI coding tools — [September 2026 update](https://www.servicem8.com/september-2026-update)

**Network (subcontracting)**
- ServiceM8 Network sends a Network Request (quote or do the work) from a job card to another business; non-ServiceM8 recipients get a browser link; no scheduled bookings on Network Requests; the subcontractor's client record is your business, so they invoice you — [Introduction to ServiceM8 Network](https://support.servicem8.com/help-center/servicem8-add-ons/servicem8-network/introduction-to-servicem8-network); [Contractors as staff vs Network](https://support.servicem8.com/hc/en-us/articles/205468703-I-have-contractors-set-up-as-staff-should-they-use-ServiceM8-Network-instead-); 2016 launch material says sending is free and accepting costs 1 job credit (possibly outdated) — [Quick-start guide to ServiceM8 Network (2016)](https://blog.servicem8.com/2016/01/quick-start-guide-to-servicem8-network/)

**Platform policy (Apple vs Android)**
- Historical FAQ: ServiceM8 built around Apple; "ServiceM8 Lite" for Android launched 2024 aimed at technicians/subcontractors, omitting management and billing tools — [Does ServiceM8 support Android (FAQ)](https://support.servicem8.com/hc/en-us/articles/200273344-Does-ServiceM8-support-Android-based-devices-Yes); [ServiceM8 13 / Lite announcement](https://www.servicem8.com/updates/servicem8-13-now-available)
- Current article: Android app has "almost all the same functionality as the iOS app"; missing Room Scan/AR, diagram drawing, PDF fill from previews, automatic camera tagging; Tap to Pay activation must be done on iOS first — [About the ServiceM8 Android app](https://support.servicem8.com/hc/en-us/articles/10781739471247-About-the-ServiceM8-Android-app-ServiceM8-Lite); [Not all my staff have Apple devices](https://support.servicem8.com/hc/en-us/articles/200273494-Not-all-my-staff-have-iDevices-how-can-I-use-ServiceM8-)
- September 2026: "all-new, full-featured" Android app including Office Agent — [September 2026 update](https://www.servicem8.com/september-2026-update)
- Trustpilot, Mar 2026 (GB): "The android app has barely any functions that the apple one does to the point where its pretty pointless"; Aug 2026 (AU): "the android version needs a little bit of love" — quoted in [SoftwareSorted](https://softwaresorted.co.uk/electricians/tradify-vs-servicem8/) and [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)

### Inferences
- The Android story changed three times in two years (Lite 2024 → "almost all" 2025 → "full-featured" Sept 2026). Any UK comparison written before autumn 2026 that says "iOS only" or "Lite only" is now stale, but the user-review evidence from early/mid 2026 still shows Android lagging in practice. A competitor should assume Android parity is coming but not yet proven by users.
- Because almost everything is a plan-gated add-on rather than a paid extra, the effective price of a feature for a one-van business is the jump between tiers (e.g. Forms and Inbox mean £25 → £59; Branded SMS means £119).
- The official ServiceM8 MCP server exposed in this research session (tools such as `create_job_allocation`, `list_allocation_windows`, `get_availability`, `compose_sms_message`, `change_job_status`, `send_job_to_queue`) confirms that allocation windows, availability and SMS composition are now reachable by AI agents, consistent with the Sept 2026 MCP announcement.

### Gaps
- No official list of SMS/email merge fields beyond the ones quoted; the full merge-field reference was not located.
- Office Agent Pro price and daily usage limits: the "plans, pricing and usage" article was referenced but not retrievable.
- Timesheet export mechanics and Knowledge add-on details were not pulled in depth.

## Key question 2: Arrival detection and time capture (check-in / check-out mechanics)

### Takeaway
Automated Time Tracking checks you in when you reach the address of a job allocated/scheduled to you today (or one you navigated to), checks you out when you leave, and back-dates both to the detected arrival/departure; if it lacked confidence, tapping Start Job offers to "wind back" the check-in to the detected arrival. No geofence radius or dwell time is published anywhere.

### Cited Findings
- Automatic Check In triggers: arriving at the location of a job allocated to you, scheduled to you for the current day, or reached via the Navigate function. Decisions use "your GPS location, the time of day, and the jobs that have been assigned/scheduled to you", it "can take time for ServiceM8 to gain confidence" and the recorded time is rolled back to the actual arrival — [How to use Automated Time Tracking](https://support.servicem8.com/hc/en-us/articles/360001167415-How-to-use-Automated-Time-Tracking)
- Automatic Check Out: "ServiceM8 will automatically Check Out of a job when you leave its location", even after a manual check-in, with the same delay and roll-back — same source.
- Automatic Clock On/Off: clock on at the office or a scheduled job (or on any manual check-in); clock off after leaving the office or after the last job; if it lacked confidence it suggests roll-back times based on movements when you clock off manually — same source.
- Wind-back prompt: if it could not auto check-in (wrong address, job not scheduled to you), then "when you open the job card and tap 'Start job', ServiceM8 will offer to wind back the check in time to the time it detected your arrival on site" — same source; also [How to start & navigate to a job](https://support.servicem8.com/hc/en-us/articles/203251020-How-to-start-navigate-to-a-job-on-the-app)
- Off-site trips (materials run): leaving the job address checks you out but travel and time at each stop are tracked; at check-out you can add Trip time (travel there, time there, travel back) and choose which stops to include; if stops are skipped, travel back is measured from the last stop — [How to use Automated Time Tracking](https://support.servicem8.com/hc/en-us/articles/360001167415-How-to-use-Automated-Time-Tracking)
- Undo: tap the push notification for the automatic check-in/out and choose Undo — same source.
- Travel time: the app "backdates your arrival and departure times, along with the travel time from your location before you reached the job" — [How can I disable automatic Check In & Check Out](https://support.servicem8.com/help-center/app/faq/how-can-i-disable-automatic-check-in-check-out)
- Requirements: Location Access "Always Allow" with Precise Location; location not shared while On Break or Clocked Off; Dispatch Board highlights staff with insufficient location permission; accuracy depends on addresses picked from the search dropdown and the office address in Preferences — [How to use Automated Time Tracking](https://support.servicem8.com/hc/en-us/articles/360001167415-How-to-use-Automated-Time-Tracking)
- Disable per device: iPhone Settings > ServiceM8 > Time Tracking > Automatic off (older wording: Automated Time Tracking); then check in/out manually — [How can I disable automatic Check In & Check Out](https://support.servicem8.com/help-center/app/faq/how-can-i-disable-automatic-check-in-check-out)
- Editing after the fact: at check-out via Job Time (tap the time to change it, GPS timestamps shown as reference); later via the Diary entry's Checkout Report > Edit; on the dashboard via Billing > Job Time > Add Time/edit, where a Report icon shows GPS arrival and departure timestamps. By default only Business Owner can edit; a custom Security Role can enable "Allow Check-in data to be edited" — [How to edit Check In data](https://support.servicem8.com/hc/en-us/articles/208183176-How-to-edit-Check-In-data)
- ServiceM8 14 (Aug 2025) added "Job Time Editing — edit a job's check-in time" in the app — [ServiceM8 14 app update](https://www.servicem8.com/updates/servicem8-14-app-update)
- Apple Watch (Sept 2026) can Clock On and Check Out — [September 2026 update](https://www.servicem8.com/september-2026-update)
- API: `staff_locations` scope gives "real-time GPS data for staff"; `staff_activity` gives clock-on/break/clock-off; `read_schedule` covers JobActivity and JobAllocation — [Authentication (developer)](https://developer.servicem8.com/docs/authentication)
- Webhooks fire on Job Activity (the check-in record object) — [Webhooks overview](https://developer.servicem8.com/docs/webhooks-overview)

### Inferences
- "Gain confidence" plus roll-back implies a dwell/confirmation window of some minutes before the check-in is committed, with the committed timestamp set to first entry into the site. The exact radius and window are not documented; a competitor should not quote figures for ServiceM8.
- Because detection depends on the job being allocated/scheduled to the user *today* or on explicit Navigate, an unscheduled job (parked in a queue, or booked for another day) will not auto check-in; the fallback is the Start Job wind-back prompt. This is the gap "looks like you arrived at 09:04" fills, and ServiceM8 already has it, but only on tap, not proactively.
- Leaving for materials ends the check-in rather than pausing it; the second arrival starts a new check-in and the gap becomes an optional "Trip" billed or not. A clearer single-visit timeline ("on site 09:04–10:12, away 10:12–10:41, back 10:41–12:30") is a presentation opportunity.
- App-closed behaviour is undocumented; the "Always Allow" requirement indicates it relies on iOS background significant-location/visit monitoring, which continues with the app closed but is coarse. Treat as inference.

### Gaps
- No published geofence radius, dwell time or polling interval.
- No documentation of behaviour when the app is force-quit or location permission is "While Using".
- No documentation of GPS accuracy thresholds or how a wrong auto check-in on a neighbouring job is prevented.

## Key question 3: Offline behaviour

### Takeaway
The app works offline for anything already synced (view/update jobs, notes, photos) and queues changes until coverage returns; PDFs (quotes, invoices, forms) and SMS/email sending require a live connection. Conflict handling is undocumented.

### Cited Findings
- "Yes, ServiceM8 works offline in the mobile app, as long as job and client details have already synced to the device. You can view those details, update jobs, and save job notes and photos. Your changes sync across your account once you're back in range." Final PDF quotes/invoices/Forms and email/SMS sending do not work offline — [Does ServiceM8 work offline? (Help FAQ)](https://support.servicem8.com/questions/mobile/does-servicem8-work-offline-without-mobile-coverage-or-internet)
- The FAQ index also lists "Can I create an asset while offline?" as a separate question (answer not retrieved) — [Mobile app FAQ index](https://support.servicem8.com/questions/mobile)
- ServiceM8 Phone is VoIP and needs internet; a Cellular Network Fallback call mode exists for weak coverage and must be switched back manually — [ServiceM8 Phone FAQs](https://support.servicem8.com/hc/en-us/articles/360002070275-ServiceM8-Phone-FAQs); [Cellular Network Fallback](https://support.servicem8.com/hc/en-us/articles/8173337202191-How-to-activate-Cellular-Network-Fallback-on-ServiceM8-Phone)
- Location is not shared while On Break or Clocked Off, and Always Allow + Precise Location is required for automated time tracking — [How to use Automated Time Tracking](https://support.servicem8.com/hc/en-us/articles/360001167415-How-to-use-Automated-Time-Tracking)

### Inferences
- An offline check-in or On-the-Way action cannot notify the customer until the phone reconnects; Track My Arrival depends on the server having a GPS fix at send time, so a rural dead zone (common in the Marlborough/Pewsey area) means no live link. A competitor whose customer page is server-side and tolerant of gaps can advertise this.
- "Changes sync once back in range" with no conflict documentation implies last-write-wins at field level; unverified.

### Gaps
- No documentation of conflict resolution between office edits and queued field edits.
- No documentation of iOS background upload limits for photos or of how long queued SMS/emails wait.

## Key question 4: Customer-facing surfaces (what the customer actually receives)

### Takeaway
The customer gets: a booking confirmation (SMS/email), a badge-gated reminder, an On-the-Way SMS with ETA and optionally a Track My Arrival live-map link (only while the tech is actively navigating), a quote/proposal acceptance page, an online invoice with Pay Now, a two-way-SMS web portal for replies, and a post-payment review request. There is no persistent "my job" page showing status after arrival.

### Cited Findings
- On-the-Way text: tap Start Job, enable "Notify Client" (needs a mobile number), tap Navigate; the text includes an auto-calculated ETA and works without the Track My Arrival add-on — [What is Track My Arrival?](https://support.servicem8.com/help-center/servicem8-add-ons/servicem8-add-ons/what-is-track-my-arrival)
- Default "Navigate To Job" template: greets `{job.contact_first}`, says `{staff.first}` from the company is on the way `{and_will_be_arriving_in_approximately_x_minutes}`, and asks them to call `{staff.mobile}` if they cannot be there; the ETA field is blank when no ETA is available; the template must be named exactly "Navigate To Job" — [Can I adjust the SMS template sent when navigating](https://support.servicem8.com/hc/en-us/articles/200029719-Can-I-adjust-the-SMS-template-sent-to-clients-when-navigating-to-the-job)
- Track My Arrival: free add-on toggled in Settings; "if ServiceM8 has the GPS location of your mobile device when the On-the-Way text is sent, the tracking link is added to the end of the SMS"; the link opens a live map portal of the tech's progress; "only available to customers while you are 'Navigating' to their job, and it switches off shortly after" — [What is Track My Arrival?](https://support.servicem8.com/help-center/servicem8-add-ons/servicem8-add-ons/what-is-track-my-arrival)
- When the SMS already contains a link such as Track My Arrival, the two-way reply link is replaced with "To reply, tap the link above", so the customer replies through the tracking portal — [How to use Two-Way SMS](https://support.servicem8.com/hc/en-us/articles/360001171696-How-to-use-ServiceM8-s-Two-Way-SMS)
- Booking confirmation: SMS/email/both, sent within minutes, only for app/New Booking window bookings, not for drag-and-drop on the Schedule — [Booking Confirmation Automation](https://support.servicem8.com/hc/en-us/articles/360002070355-Booking-Confirmation-Automation)
- Booking reminder: badge-gated, configurable lead time, SMS only between 07:00 and 19:00 — [How to set automatic booking reminders](https://support.servicem8.com/help-center/servicem8-add-ons/automation/how-to-set-automatic-booking-reminders)
- The allocation window can be shown to the client via `{job.next_booking_time}` — [How to insert an Allocation Window in templates](https://support.servicem8.com/help-center/servicem8-add-ons/job-allocations/how-to-insert-an-allocation-window-in-email-sms-templates)
- Self-booking: customer picks from Suggested Times / All Available Times, reviews details, taps Book Service; the booking is scheduled to the staff member; times shown as exact or as windows per the Arrival Window setting (default 2 hours) — [How SMS Booking Links work](https://support.servicem8.com/hc/en-us/articles/360000473356-How-SMS-Booking-Links-work); [How to create Online Booking Forms & Services](https://support.servicem8.com/hc/en-us/articles/115005042263-How-to-create-Online-Booking-Forms-Services)
- Quote portal: view, accept, forward, save, ask a question; proposals similar — [How to use a quote acceptance](https://support.servicem8.com/help-center/desktop/invoicing/how-to-use-a-quote-acceptance); [Proposals](https://support.servicem8.com/hc/en-us/articles/8173320604815-How-to-create-and-send-Proposals)
- Invoice: online page with Pay Now when ServiceM8 Pay is on — [How to get started with ServiceM8 Pay](https://support.servicem8.com/hc/en-us/articles/10116128052495-How-to-get-started-with-ServiceM8-Pay)
- Review request after payment, direct to Google with the add-on — [Customer Feedback Automation](https://support.servicem8.com/hc/en-us/articles/360002067236-Customer-Feedback-Automation)
- Two-way portal shows logo, business name, business number, speed-dial, unsubscribe and Photo upload, with each job's conversation kept separate — [How to use Two-Way SMS](https://support.servicem8.com/hc/en-us/articles/360001171696-How-to-use-ServiceM8-s-Two-Way-SMS)
- Customer-side complaint (Trustpilot, 7 Oct 2026, 1★): customers cannot text photos (MMS) to the business number and there is no alert for incoming SMS — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)
- Customer-side complaint (Trustpilot, 11 Sep 2026, 1★): a job was repeatedly delayed/reassigned and the delay notice arrived "the Saturday prior" — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)

### Inferences
- What the customer cannot see: whether the tech has actually arrived/checked in, whether the job is running late before the On-the-Way text, the tech's photo or vehicle, an ETA once navigation stops, or a reschedule/cancel control. The live map exists only between "Navigate" and arrival; from arrival to invoice the customer has no live surface.
- The On-the-Way text is manual (requires tapping Notify Client and Navigate). Nothing is sent automatically when the tech leaves the previous job, so a forgetful tech sends nothing.
- ETA is Apple/Google-maps derived at send time and not refreshed in the text; only the map link updates.

### Gaps
- Not documented: whether the Track My Arrival page shows the staff name, photo or a numeric ETA; how long "shortly after" is; whether the link survives a materials detour.
- Not documented: whether a reschedule triggers a fresh confirmation.
- Not documented: whether customers can cancel or reschedule from any portal.

## Key question 5: No-shows and exceptions (late tech, customer not home, overrun, late cancellation, reschedule)

### Takeaway
ServiceM8 has no customer-not-home status, no no-show fee workflow and no late-cancellation rule; the only tools are the Unsuccessful status (quote lost or job cancelled), allocation expiry for reassignment, Services deposits for pre-payment, and manual rebooking. Lateness is handled solely by the manual On-the-Way text.

### Cited Findings
- Unsuccessful is the only cancellation state ("the quote was not accepted or the job has been cancelled"); jobs are kept, not deleted, and can revert to Quote/Work Order — [What does Job Status mean](https://support.servicem8.com/help-center/app/faq/what-does-job-status-mean); [How to mark a job as unsuccessful](https://support.servicem8.com/hc/en-us/articles/200029769-How-to-mark-a-job-as-unsuccessful)
- Booking Expiry on an allocation un-allocates the job if not reached in time so it can be reassigned — [How to allocate jobs in booking windows](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-allocate-jobs-in-booking-windows); default expiry setting added in ServiceM8 15 — [ServiceM8 15 help page](https://support.servicem8.com/help-center/tips-trick-more/more/servicem8-15)
- Deposits or full pre-payment can be taken at Services booking/quote acceptance (Stripe required) — [Self-serve scheduling & deposits with Services](https://support.servicem8.com/help-center/servicem8-add-ons/services-online-booking/self-serve-customer-scheduling-deposits-with-services)
- SMS booking links do not collect payment even when a Service has deposit settings — [How SMS Booking Links work](https://support.servicem8.com/hc/en-us/articles/360000473356-How-SMS-Booking-Links-work)
- Searches of support.servicem8.com for "customer not home", "no show", "late cancellation fee" returned nothing describing such a feature — [search attempt summarised against Help Center index](https://support.servicem8.com/questions)
- Overrun: the Dispatch Map shows a check-in timer per staff member, and navigating shows ETA; no automatic customer notification of delay is documented — [How to View Staff Status](https://support.servicem8.com/hc/en-us/articles/360001167495-How-to-View-Staff-Status)
- Office Agent can prepare status changes, queue moves and draft client SMS for approval, which is the closest thing to an exception workflow — [Introducing Office Agent](https://support.servicem8.com/help-center/servicem8-add-ons/office-agent/introducing-office-agent)
- Via API, `manage_jobs` and `manage_schedule` allow status/booking changes, and `manage_badges` allows creating custom badges — [Authentication (developer)](https://developer.servicem8.com/docs/authentication)

### Inferences
- A one-van business would have to improvise a no-show process: a custom Badge ("Customer not home"), a Diary note with a photo of the closed door, a £150-minimum call-out invoice created manually, and a new booking. None of that is automated or customer-visible.
- Because confirmations are not re-sent on drag-and-drop rescheduling, a rescheduled customer may never be told unless the user re-books via the New Booking window or texts manually.

### Gaps
- No official statement on whether a reschedule re-triggers Booking Confirmation.
- No evidence of any "running late" one-tap message distinct from On-the-Way.

## Key question 6: Pricing tiers (UK, GBP), SMS and add-on costs

### Takeaway
UK pricing is per job volume, not per user: Free £0 (1 user, 30 jobs), Starter £25, Growing £59, Premium £119, Premium Plus £269 per month ex VAT, each with an SMS allowance and 5p per extra SMS; most add-ons are tier-gated rather than priced, with Phone (from £15/mo) and Office Agent Pro the main paid extras.

### Cited Findings
- Tiers (GBP/month, ex VAT): Free £0 — 1 user, 30 jobs, 0 SMS; Starter £25 — unlimited users, 50 jobs, 100+ SMS; Growing £59 — 150 jobs, 300+ SMS; Premium £119 — 500 jobs, 1000+ SMS; Premium Plus £269 — 1500+ jobs, 3000+ SMS; extra SMS 5p each; extra jobs 15p each shown on Premium Plus; 14-day trial, no card; jobs can continue 7 days past the cap before upgrade or reset — [ServiceM8 UK pricing](https://www.servicem8.com/uk/pricing)
- Feature gating: Free includes AI Smart Helpers, Recurring Jobs, Deposits, Purchased Forms; Starter adds Partial/Progress Invoices and Supplier Invoice Importing; Growing adds Asset Management, Forms & Certificates, Proposals, Bundles, Inbox; Premium adds Job Costing, Markup Billing, Knowledge, Branded SMS; Premium Plus same features as Premium — [ServiceM8 UK pricing](https://www.servicem8.com/uk/pricing)
- "All Essential Features" on every tier: job cards, scheduling, quoting and invoicing, client history, online bookings, card payments, CRM automation, accounting integrations, reporting, AI writing helper, AI quote/invoice, AI smart assistant — same source.
- ServiceM8 Phone from £15/mo on all plans, no per-user fee, 1 month free with a subscription (the same page elsewhere says "From $19/mo" and "3 months", an inconsistency) — same source.
- Free plan can earn "unlimited bonus jobs by accepting card payments" — same source.
- No contracts, setup fees or per-user fees; upgrade/downgrade/cancel any time; Office Agent Pro charged separately; paid plans include basic Office Agent — [What does ServiceM8 Cost?](https://support.servicem8.com/hc/en-us/articles/115005699046-What-does-ServiceM8-Cost)
- US comparison (USD): Starter $29, Growing $79, Premium $149, Premium Plus $349, overage 10c/SMS — [ServiceM8 US pricing](https://www.servicem8.com/us/pricing); AU overage 10c/SMS (AUD) — [AU pricing comparison](https://www.servicem8.com/au/pricing-comparison)
- Card fees UK (ServiceM8 Pay): 1.65% + 20p standard domestic; 2.10% + 20p premium; 2.70% + 20p EU; 3.45% + 20p international/Amex; £15 dispute fee; fees "current as of September 2024" — [ServiceM8 Pay card processing fees](https://support.servicem8.com/hc/en-us/articles/10116208886927-ServiceM8-Pay-card-processing-fees-payout-speed); marketing page says from 1.70% + 20p — [ServiceM8 Pay UK](https://www.servicem8.com/uk/servicem8-pay); PayByBank 0.75% + 20p — [PayByBank (UK)](http://support.servicem8.com/help-center/servicem8-add-ons/servicem8-pay/how-to-use-paybybank-with-servicem8-pay-uk); legacy Stripe plans 1.70% + 20p with 3-business-day payout — [Stripe transaction fees](https://support.servicem8.com/hc/en-us/articles/203229660-Stripe-transaction-fees-payout-speeds)
- Surcharging: ServiceM8 lets you pass fees on but says UK rules restrict it and compliance is your responsibility — [How to pass on card payment processing fees](https://support.servicem8.com/hc/en-us/articles/8173348982543-How-to-pass-on-card-payment-processing-fees)
- Discounts: New Business Offer (businesses under 2 years old) and a Setup & Training Rebate when hiring a Partner; Learning Roadmap progress can unlock higher job/SMS limits — [ServiceM8 UK pricing](https://www.servicem8.com/uk/pricing)
- Payment by card or Apple In-App Purchase — [Managing your plan through Apple subscriptions](https://support.servicem8.com/hc/en-us/articles/360003640656-Managing-your-ServiceM8-plan-through-Apple-subscriptions)
- A UK blog (May/July 2026) quotes Starter at £29, which conflicts with the official £25 — [DashLink Media](https://dashlink.media/best-job-management-apps-for-uk-tradespeople/) vs [ServiceM8 UK pricing](https://www.servicem8.com/uk/pricing)
- Trustpilot complaints about billing: back-charged for an unused service (Apr 2026); "price of the unlimited phone plan doubled" after paying a partner for migration (Capterra, via search summary) — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com); [Capterra](https://www.capterra.com/p/110711/ServiceM8/)

### Inferences
- A one-van plumber at 40–60 jobs/month sits at the Starter/Growing boundary; Forms, Assets, Proposals and Inbox all require Growing (£59), so the realistic UK price is £59 + Phone £15 + card fees.
- SMS is cheap (5p) and generous (100+ on Starter), so a competitor cannot compete on SMS cost; it must compete on what the message contains.

### Gaps
- Office Agent Pro, Phone tier (Connect Plus / Unlimited) current UK prices and Phone Agent price not found on current pages.
- Whether the 15p extra-job charge applies below Premium Plus is unclear on the page.

## Key question 7: API and integration limits (REST, webhooks, OAuth vs API key, add-on framework)

### Takeaway
REST is throttled at 180 requests/minute and 20,000/day per app per account; webhooks cover nine objects, send only the UUID and changed field names (you must GET the record), retry for 72 hours and throttle for 15 minutes on a 429; a public OAuth app can send SMS/email (`publish_sms`, `publish_email`), write Diary items, push staff notifications and add buttons to the Job card on web and app; it cannot trigger ServiceM8's own Automations or read Track My Arrival pages.

### Cited Findings
- Rate limits: 180 requests per minute and 20,000 per day, "applied on a per-application and per-account basis"; 429 body "Number of allowed API requests per minute exceeded"; other codes: 402 account not in good standing, 403 invalid scope or invalid impersonation UUID, 426 HTTPS required for public apps — [HTTP Response Codes](https://developer.servicem8.com/docs/http-response-codes)
- Requesting fewer scopes "can unlock a higher rate limit" — [Authentication](https://developer.servicem8.com/docs/authentication)
- Auth: private apps use `X-API-Key` (own account only, not listable in the Add-on Store); public apps use OAuth 2.0 (authorize `https://go.servicem8.com/oauth/authorize`, token `https://go.servicem8.com/oauth/access_token`, grants `authorization_code` and `refresh_token`); access tokens live 3600 s; each refresh issues a new refresh token; `x-impersonate-uuid` works with OAuth only — [Authentication](https://developer.servicem8.com/docs/authentication)
- Scopes relevant to a tracking product: `staff_locations` (real-time GPS), `staff_activity`, `read_schedule`/`manage_schedule` (JobActivity + JobAllocation), `read_jobs`/`manage_jobs`, `create_jobs` ("may incur account charges"), `publish_sms` ("incurs account charges"), `read_sms`, `publish_email`, `publish_job_notes`, `publish_diary_items` (immutable, add-on-attributed, no read/update/delete), `publish_job_photos`, `read_job_attachments`, `create_notifications`, `manage_templates`, `manage_badges`, `read_addon_storage`/`manage_addon_storage`, `manage_addons` — [Authentication](https://developer.servicem8.com/docs/authentication)
- Webhooks: objects are Job Activity, Job, Job Payment, Note, Task, Material, Company, Attachment, Form Response; no named event types, a notification fires when a subscribed field changes; payload = object type, `entry[0].uuid`, `changed_fields`, `time` (UTC), `resource_url`; "does not contain the record itself or the new field values"; manage at `https://api.servicem8.com/webhook_subscriptions` (add/modify, list with `status=active|inactive|all`, delete); subscription challenge POST with `mode=subscribe` and `challenge` (API-key apps exempt); callback must accept form-encoded POST and return 200; 410 unsubscribes; 4xx/5xx retried up to 72 hours then cancelled; 429 throttles the account's webhook volume for 15 minutes; reactivation clears stored failure info; no payload signing described — [Webhooks overview](https://developer.servicem8.com/docs/webhooks-overview)
- Callback must return 2xx within 10 seconds; repeated failures or timeouts can deactivate the subscription — [Create or Update an Event Webhook Subscription](https://developer.servicem8.com/reference/post_event_webhook_subscription)
- Add-on UI extension points: Job Actions (buttons in the Job card, web and/or app), Client Actions (client card, web and/or app), Add-on Menu Items (web Add-ons menu / app More menu) rendering a full custom canvas — [Add-on Capabilities](https://developer.servicem8.com/docs/add-on-capabilities)
- Add-on platform capabilities: REST via OAuth, sending email and SMS on the account's behalf, immutable attributed Diary items, in-app and push notifications to active staff, Activity Feed posts (text/image/video with a tappable action), PDF generation from templates, custom fields on accounts — same source.
- Hosting: Simple Function add-ons are ServiceM8-hosted Node.js (15 s max execution, 128 MB, temporary OAuth token per invocation); Web Service Hosted add-ons receive events as a JWT signed with the App Secret — [Add-on Types](https://developer.servicem8.com/docs/add-on-types); [Developer FAQ](https://developer.servicem8.com/docs/frequently-asked-questions)
- Job Action mechanics: manifest action `type` "online" or "app", `entity` "job"; the function gets `eventArgs.jobUUID` and must return a complete HTML document rendered in an iframe popup; client SDK can resize/close the popup and `invoke` server functions — [Your First Add-on](https://developer.servicem8.com/docs/your-first-add-on); [Client JS SDK](https://developer.servicem8.com/docs/client-api)
- Event data: action events carry `eventArgs.jobUUID` / `companyUUID` and `auth.staffUUID`; webhook events arrive as `eventName: "webhook_subscription"` with the same entry structure as REST webhooks — [Event Data](https://developer.servicem8.com/docs/sample-event-data)
- Addon Kit CLI deploys and activates an add-on on the account; requires `manage_addons` — [Addon Kit](https://developer.servicem8.com/docs/addon-kit)
- Deep links: `https://go.servicem8.com/openjob/{uuid}` opens a job in the browser; `https://go.servicem8.com/app/launch` returns to the iOS app — [Developer FAQ](https://developer.servicem8.com/docs/frequently-asked-questions)
- Style guidance: action buttons are limited space, "use no more actions than necessary" — [Add-on Style & Guidelines](https://developer.servicem8.com/docs/add-on-style)
- Developer forum threads exist on hitting the rate limit on large GETs and on raising a messaging API daily limit (the latter page returned 404 when fetched) — [Hitting Rate Limit thread](https://developer.servicem8.com/discuss/66f9a59fcc2015001f6820d3)
- n8n, Zapier and Workato connectors expose triggers (job status changed, form response submitted, invoice sent) and actions (add note, create job, update job, send text) — [How to connect ServiceM8 to n8n](https://support.servicem8.com/help-center/servicem8-add-ons/n8n/how-to-connect-servicem8-to-n8n); [Zapier intro](https://support.servicem8.com/hc/en-us/articles/211972143-A-brief-introduction-to-Zapier-integration)
- Official MCP server for ChatGPT/Claude announced Sept 2026 — [September 2026 update](https://www.servicem8.com/september-2026-update)

### Inferences
- A third party can embed a button in the Job card on both web and the mobile app via a Job Action, but it opens an iframe popup rather than a persistent panel; there is no documented hook into the check-in button, the Navigate flow or the On-the-Way SMS composer. A competitor's "send live link" must therefore be a separate tap or be driven server-side from a JobActivity webhook.
- Since webhook payloads omit values, a check-in webhook costs one REST GET per event; at 180/min that is irrelevant for one van, but the 10-second callback deadline means ack-then-process.
- SMS can be sent via API only through a public OAuth app with `publish_sms`, and it bills the customer's SMS allowance at their plan rate; sending through an API key is not documented and should be assumed unsupported.
- Nothing in the docs lets an integration enqueue or fire a ServiceM8 Automation, edit the Track My Arrival page, or receive staff GPS as a push stream (only polling via `staff_locations`).
- Private add-ons (own account, API key or Addon Kit) avoid Store review entirely, which is the fast path for a single-business pilot.

### Gaps
- Add-on Store listing/review process and ServiceM8-managed billing terms were not located on the fetched pages.
- Rate-limit response headers (e.g. remaining quota) are not documented.
- No documentation of the `staff_locations` polling frequency or data freshness.

## Key question 8: Known weaknesses from real user reviews

### Takeaway
Across Trustpilot (4.1/5, 117 reviews, 20% one-star) and Capterra (≈4.5/5, ≈311 reviews), the consistent complaints are chat-only support that is slow on hard problems, billing surprises, Android being second-class until very recently, inbound SMS/MMS limitations, feature requests being rejected, and card fees. Praise centres on ease of setup, automations and the AI writing helpers.

### Cited Findings
- Trustpilot UK: TrustScore 4.1 ("Great"), 117 reviews (55 in last 12 months); 74% 5★, 3% 4★, <1% 3★, 2% 2★, 20% 1★ — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)
- Trustpilot 1–2★ themes (2026): no MMS photo receipt to the business number and no incoming-SMS alert (7 Oct 2026); customer's job repeatedly delayed with late notice (11 Sep 2026); "essentially everything I have ever suggested or requested has been rejected" (19 Jun 2026); back-charged for an unused service, support called "terrible" (22 Apr 2026); account suspended for alleged spamming with over four days waiting for support (12 Apr 2026) — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)
- Trustpilot 5★ themes (2026): fast support fixes (23 Sep, 12 Aug), "Populate it once and start using it forever" citing automatic reminders/quotes/confirmations (10 Jul), "The AI writer for emails and Invoices etc is a game changer" (26 Jun), affordable packages (1 Jul); Android "needs a little bit of love" (2 Aug); a 4★ (22 Feb 2026) says the Android app does not work for a reactive refrigeration business — [Trustpilot UK](https://uk.trustpilot.com/review/servicem8.com)
- Trustpilot GB reviewer, Mar 2026: "The android app has barely any functions that the apple one does to the point where its pretty pointless" — quoted by [SoftwareSorted](https://softwaresorted.co.uk/electricians/tradify-vs-servicem8/)
- Capterra: 4.5/5 from 311 reviews, customer-service sub-score 4.5, 90% likelihood to recommend; complaints: "absolutely zero phone support", chat support unable to fix issues in real time, a feature still broken after six months (2025 review), unlimited phone plan price doubled after paying a partner for migration, billed after cancelling, large payment fees from ServiceM8/Stripe (UK and AU reviewers), no ad conversion tracking, no Android capability on the full app, no on-demand job pickup for staff; praise for ease of use, convenience-charge on invoice, customer portal and custom forms — [Capterra (US)](https://www.capterra.com/p/110711/ServiceM8/); [Capterra UK](https://www.capterra.co.uk/software/110711/servicem8) (summaries via search; review pages returned 403 to direct fetch)
- UK comparison (DashLink, May–Jul 2026, affiliate): support is chat-only with no phone support; no native Sage integration; steeper learning curve than Tradify; unsourced claim that features are removed/changed without notice — [DashLink Media](https://dashlink.media/best-job-management-apps-for-uk-tradespeople/)
- UK comparison (SoftwareSorted, 2026, affiliate): no built-in electrical certificates (paid third-party forms); CIS not documented; offline partial — [SoftwareSorted](https://softwaresorted.co.uk/electricians/tradify-vs-servicem8/)
- Third-party reviewer: Android app a trimmed-down version with time tracking only on iOS (likely pre-Sept-2026) — [Connecteam review of ServiceM8](https://connecteam.com/reviews/servicem8)
- Vendor comparison pages (biased): Jobber positions itself on full native iOS and Android apps — [Jobber vs ServiceM8](https://www.getjobber.com/comparison/jobber-vs-servicem8/); ServiceM8 publishes its own vs-Tradify page — [ServiceM8 vs Tradify](https://www.servicem8.com/us/servicem8-vs-tradify-alternative)
- Reddit could not be crawled (blocked to this agent), so no r/Plumbing or r/electricians threads are cited — [Anthropic crawler note](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

### Inferences
- The two complaints most relevant to a customer-tracking competitor are: (a) customers cannot easily send photos or get a reply acknowledged by text, because two-way SMS is a web portal; and (b) delay communication is manual and often late. Both are customer-experience gaps ServiceM8's own users are reporting in 2026.
- Support quality is bimodal in the reviews: fast for simple questions, poor for bugs and billing; a competitor should expect prospects to ask about human support.

### Gaps
- G2 and GetApp pages could not be fetched (403), and Capterra individual reviews were only available through search summaries, so exact Capterra review dates/countries are not reproduced here.
- No UK Facebook-group quotes were found in any crawlable article.
