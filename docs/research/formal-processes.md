# Formal staged processes My Trade Status could attach to

*Research note, 2 October 2026. Asked by Will: "RIBA has a set process you go
through when designing a building. What other formal processes are out there
that we could attach ourselves to, so people can update their job automatically
using our software and the card?"*

## The idea in one paragraph

Every regulated or professionalised industry has already agreed what its stages
are called. My Trade Status today ships one vocabulary (Booked in → On my way →
On site → Job done). The opportunity is to ship **the industry's own vocabulary
as a template**, so an architect's client sees "Stage 3 · Spatial Coordination",
a house buyer sees "Stage D · Exchange of contracts", and a retrofit customer
sees "Assessment done · Design in progress". The card and the link stay exactly
the same; only the stage list and its plain-English line change. Where the
industry also has a **system of record with webhooks**, the card updates itself
and nobody has to tap a button.

Two separate things, then:

1. **Templates** — a formal stage list we map onto the card. Cheap. Content, not code.
2. **Connectors** — a feed from the system that already knows the stage. One per platform.

## The processes, graded for fit

Fit means: is there a canonical public stage list, is there a reference number a
customer already holds, is there a feed we could listen to, and does the end
customer actually suffer from not knowing where things are.

| Process | Owner | Stages | Customer anxiety | Feed we could listen to | Fit |
|---|---|---|---|---|---|
| **RIBA Plan of Work 2020** | RIBA | 0 Strategic Definition · 1 Preparation & Briefing · 2 Concept Design · 3 Spatial Coordination · 4 Technical Design · 5 Manufacturing & Construction · 6 Handover · 7 Use | High on domestic jobs: clients pay stage fees and rarely know which stage they are in | None. Architects' PM tools vary. Manual tap by the practice | **Template now** |
| **Building control inspections** (LABC / approved inspector) | Local authority or AI | Commencement · Foundations · DPC/oversite · Drainage · Structural · Pre-plaster · Completion certificate | Very high: "did the inspector pass the drains?" is the question every extension client asks their builder | No public API. Builder taps; some LABC portals email. | **Template now** |
| **Building Safety Act gateways** | Building Safety Regulator | Gateway 1 planning · Gateway 2 before construction · Gateway 3 before occupation | Developer-level, not householder | BSR portal, no API | Later, commercial tier |
| **PAS 2035 retrofit** | BSI / TrustMark | Advice · Assessment · Coordination & risk path · Design · Install (PAS 2030) · Evaluation. Five named roles | High: grant-funded retrofit has a customer waiting months with no idea who is coming next | TrustMark Data Warehouse lodgement (installer-side), no customer feed | **Template now**; connector later |
| **Competent Person Scheme notification** (Gas Safe, APHC, NICEIC, OFTEC) | Scheme operators | Work done → notified to scheme → compliance certificate issued to householder → logged with LABC | Medium: customers do not know a certificate is coming, then cannot find it when selling | Scheme portals; no API for small installers | A single extra stage, "Certificate issued", on the trade template. Will's own G3 cylinder work is the first use |
| **BSRIA Soft Landings (2018)** | BSRIA | Inception & briefing · Design · Construction · Pre-handover · Initial aftercare · Extended aftercare / POE | Low for householders | None | Reference only |
| **Law Society Conveyancing Protocol 2019** | Law Society | A Instructions · B Pre-exchange · C Prior to exchange · D Exchange · E Completion · F Post-completion | **Extreme.** Moving house is the single most-complained-about wait in the UK. Buyers phone their solicitor for exactly this | Case-management systems (Proclaim, LEAP, Osprey) have APIs; some firms use "case trackers" already | **Template now**, biggest market, hardest sell (solicitors are slow to adopt) |
| **NHS Referral to Treatment (RTT)** | NHS England | Referral → first outpatient → diagnostics → decision to treat → treatment, with a clock that starts, pauses and stops | High, but the NHS App already shows some of it | None we could legitimately use | No. Regulated data, and the NHS App owns this |
| **Insurance claim** | Each insurer; ABI guidance | FNOL · Triage · Assessment · Decision · Settlement · Recovery | High: a burst-pipe claim with a plumber, a loss adjuster and a drying company and nobody telling the householder anything | Insurer platforms; claims-management APIs exist for contractor networks (e.g. the networks a plumber gets sent work by) | **Strong**, because the plumber is already on site. Will could be the one holding the card in a multi-party claim |
| **UPU postal tracking (EMSEVT v3)** | Universal Postal Union | EMA posting · EMB/EMC departure · EMD arrival inward · EDB/EDC customs · EME/EMF handover · EMH failed delivery · EMI delivered | Solved by carriers already | Carrier APIs, all different | No. We do not compete with Royal Mail's tracker. Our niche is the last hundred metres: "I'm at the gate, which door?" |
| **GS1 EPCIS 2.0** | GS1 | Business steps (shipping, receiving, transporting…) + dispositions (in_transit…) | B2B supply chain | EPCIS repositories | Only as a vocabulary if a logistics customer asks. Good model for how to *name* an event, though |
| **ServiceM8 job lifecycle** | ServiceM8 | Quote · Work Order · Completed · Unsuccessful, plus check-in/check-out and queue events | n/a (it is the trade's tool) | **Yes: webhooks `job.status_changed`, `job.checked_in`, `job.checked_out`, `job.completed`, `job.queued`** | **Connector first.** Will already uses it. Check-in = On site, check-out = Job done, "on the way" from the staff status |

## What I would actually do

**1. Connector: ServiceM8 → the card, automatically.** This is the one that
makes "update their job automatically" true for the first customer, Will. A
webhook subscription on `job.checked_in` and `job.checked_out` moves the card to
On site and Job done without anyone touching the dashboard. The `externalId`
column on `TradeStatus` already exists for exactly this. Two days of work and it
is the demo for every other trade on ServiceM8 (tens of thousands in the UK and
Australia).

**2. Templates: ship three, properly.** A `template` field on the job, a
per-template stage list in `src/lib/trade-status.js`, and the card shows the
formal stage name with a one-line plain-English gloss underneath. Start with:

- *Trade job* (today's four, plus an optional "Certificate issued" for notifiable work)
- *Building control* (the inspection sequence — any builder doing an extension)
- *RIBA Plan of Work* (stages 0–7)

Conveyancing is the biggest prize but needs a solicitor to pilot it. Park it
until one asks.

**3. Be careful with the names.** "RIBA Plan of Work" is RIBA's copyrighted
framework and its branding is theirs. We can say *"mapped to RIBA Plan of Work
Stage 3"* and use the stage names, which are published for exactly this
purpose; we should not put the RIBA logo on a card or imply endorsement. Same
for PAS 2035 (a BSI standard, licensed) and the Law Society Protocol. The honest
line is "follows", never "approved by".

**4. Multi-party cards are the real product.** Insurance claims and PAS 2035
both have four or five different companies touching one job, and the
householder gets a phone number for each. A single card where *whoever is next*
updates it is something none of them has, and it is the natural extension of
the "anyone can be either end" roadmap phase.

## Sources

- RIBA Plan of Work 2020 overview — https://www.riba.org/media/syneeeto/2020ribaplanofworkoverviewpdf.pdf
- LABC Front Door, inspections for an extension — https://labcfrontdoor.co.uk/projects/extensions/what-building-control-site-inspections-should-i-expect-for-my-new-extension
- Building Safety Act gateways, gov.uk factsheet — https://gov.uk/government/publications/building-safety-bill-factsheets/building-control-regime-for-higher-risk-buildings-gateways-2-and-3-factsheet
- PAS 2035 guide, Retrofit Academy — https://retrofitacademy.org/pas-2035-guide/
- TrustMark Retrofit Coordinator scheme requirements — https://cms.trustmark.org.uk/media/1rumfuor/retrofit-coordinator-scheme-requirements-v12-final.pdf
- APHC Competent Person Scheme — https://aphc.co.uk/certification-schemes/competent-person-scheme/
- BSRIA Soft Landings Framework 2018 — https://www.bsria.com/uk/product/QnPd6n/soft_landings_framework_2018_bg_542018_a15d25e1/
- Law Society Conveyancing Protocol 2019 — https://www.lawgazette.co.uk/practice/society-updates-best-practice-guide-for-conveyancers/5071049.article
- NHS England RTT recording and reporting guidance — https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2021/05/Recording-and-Reporting-guidance-April_2021.pdf
- UPU EMSEVT v3 — https://www.ems.post/sites/default/files/content-block-files/EMSEVT%20V3%20part%202.pdf
- GS1 Core Business Vocabulary — https://www.gs1.org/sites/default/files/docs/epc/CBV-Standard-1-2-r-2016-09-29.pdf
- ServiceM8 event webhook subscriptions — https://developer.servicem8.com/reference/post_event_webhook_subscription
- ServiceM8 sample event data — https://developer.servicem8.com/docs/sample-event-data
- Insurance claim lifecycle — https://vcasoftware.com/life-cycle-of-an-insurance-claim/
