# InPost sends a window; TurnUp sends a stage

*Researched 14 October 2026 from InPost's own texts and pages, vendor documentation and press. Figures are theirs unless marked. Read beside `shop-competitive-landscape.md` (9 Oct), which covers the parcel aggregators; this one is about the day of delivery, and the firms that track a person arriving.*

---

## The verdict in four lines

| | |
|---|---|
| **What InPost does** | A two-hour window by text on the morning of delivery, a tracking number plus postcode as the key, and a "manage" page. Nothing after the window. |
| **Where it is weak** | The text promises choices the page then says are *not available*. The sender is a bare number. There is no stage, no "set off", no who. |
| **Where we are different, not better** | We never give a window the product worked out. We give a stage, the trade's hours only once agreed, and the name of the firm on every message. |
| **Where we must not compete** | Parcels. InPost's scale, lockers and three redelivery attempts are not ours to match. The household card should *read* InPost, never replace it. |

---

## What the four InPost texts actually say

Four texts to one phone between August and October 2026, read as a customer would:

| Text | Sent | Window | Sender named? | What the link did |
|---|---|---|---|---|
| 1 | morning | 14:57–16:57 | no | postcode check, then options |
| 2 | Sat 08:48 | 10:25–12:25 | no | same |
| 3 | Fri 08:18 | 13:58–15:58 | no | same |
| 4 | 10:34 | 17:00–19:00 | **"Tails parcel"** | postcode check, then **five options, all "Not available for this delivery"** |

Six observations, each of which is a rule for us:

1. **The window is the product's guess, and it is the only thing said.** Odd minutes ("14:57") say a routing engine wrote it. InPost's own help page says the window appears on the day *after the driver has started their route*, which can be around 11am. A customer who needs to plan the morning cannot.
2. **"Not going to be in? Tap to update" led to a page where nothing could be updated.** That is a promise with no feature behind it, the exact mistake CLAUDE.md records under the push row that opened onto an empty drawer. **A row renders only if it works** is our rule and it is the sharpest single difference on the day.
3. **The sender is a phone number.** iOS adds "If you did not expect this message from an unknown sender, it may be spam" under it. Only one of four texts names the shop. Our texts carry `TRADE_NAME` every time, and the card says who is coming once they have set off.
4. **The credential is tracking number plus postcode.** That is the same pattern as our `/j/<job number>` plus last four digits of the mobile. Nothing to copy; it confirms the pattern is one the public already understands.
5. **The link lives for one delivery and says one thing.** No "we've got it", no "with the driver", no "delivered, here is the photo" on the same page. The photo on delivery is in the app only.
6. **It comes by SMS, not email.** The household card fills itself from forwarded email. A carrier that texts its window never reaches the card unless the shop's own dispatch email does. This is a real gap and it is written down under *Overlap* below.

---

## The field, in one table

Who tracks a person or a parcel arriving at a UK home, and what the customer gets.

| | Booked | Day before | On my way | On site | Paused, why | Done | After | Two-way | Needs app | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| **TurnUp** | yes | asks "will someone be in?" | fact, no ETA | yes | **yes** | yes | review, note | **both ends propose hours** | no | free to the trade |
| InPost (home delivery) | tracking no. | no | 2-hour window by text | no | no | app photo | no | redirect, when allowed | for photo | n/a |
| DPD Follow My Parcel | yes | no | 1-hour window, live map, 15-min alert, driver name, queue position | no | no | yes | no | redirect to 15 min before | no | n/a |
| Amazon map | yes | no | map at ~10 stops away | no | no | photo | no | no | yes | n/a |
| ServiceM8 Track My Arrival | no | no | text with ETA, live map **while navigating only** | no | no | no | no | no | no | add-on, free |
| Commusoft (UK) | no | no | live map from **van hardware** | no | no | no | no | no | no | add-on, unpublished |
| Glympse PRO (US) | yes | no | live ETA, map | arrived | "Delayed", "No show" | complete | no | no | no | ~$15 per user per month |
| On My Way (tryonmyway) | yes | yes | live map, dynamic ETA, engineer card | yes | no | yes | 0–10 rating, Trustpilot | rebook, cancel, photos in | no | enterprise, 4–6 week install |
| Descartes Localz | yes | yes | live map, ETA | yes | no | yes | no | no | no | enterprise |
| Arrivy | yes | yes | live map, on-the-way SMS | yes | no | yes | no | no | no | quote only |
| Fortem On My Way (housing) | day-before text | yes | live ETA on the day | no | no | no | no | no | no | landlord-procured |
| Jobber, Housecall Pro | reminders | yes | **US only**, Force Fleet hardware | no | no | no | no | no | no | add-on |
| Tradify, Fergus, Powered Now | reminders | yes | **no live link found** | no | no | no | no | no | no | subscription |
| Checkatrade, MyBuilder | no | no | no | no | no | no | reviews | no | no | lead fees |

Reading it: **everyone who tracks a person tracks a dot during the drive, and almost nobody says why the job has stopped.** Glympse is the one product with a status vocabulary beyond the drive (Scheduled, ETA, Live, Arrived, Complete, plus Delayed and No Show). It is US, per-seat, and driven by live location. Nothing found carries a *reason* for a pause, or lets the customer counter the hours.

The earlier landscape doc said nothing has stages. **That was slightly too strong.** Glympse has five, so the honest claim is narrower: nobody found has *Paused with a reason*, and nobody found lets both ends propose a time.

---

## Where we are better, and the proof we have for it

| Claim | Proof we hold | Proof we do not |
|---|---|---|
| A stage is more honest than a window | InPost's "14:57–16:57" against our "Set off at 08:00". The DPD and InPost windows are routing-engine output a van cannot keep in a village. | No measurement yet that customers prefer it. The pilot's four numbers are the test. |
| A feature that cannot work is not shown | Push row, what3words, forwarding address, assistant box: all gated on configuration. InPost's manage page shows five dead options. | — |
| The sender is named, always | `TRADE_NAME` on every text and push; the engineer's name, van, plate and face from On my way. | — |
| The customer can answer back | Will someone be in (four taps), counter the hours, "need to move it", "are you still coming?", running late themselves. | Take-up numbers: none yet. |
| The link outlives the drive | Booked, the terms, the hours, the record, the review, all on one code. ServiceM8's map deactivates "shortly after" navigation ends. | — |
| Privacy by construction | `publicShape()` proven by script never to carry what the customer told the trade. | — |

**Where they are better, and we should say so:** InPost's photo on delivery and three attempts; DPD's one-hour window with a 15-minute alert, which customers plainly like; Amazon's map. Those exist because a depot runs 120 drops on a planned route. A sole trader runs four jobs with a cylinder swap in the middle. The window is the wrong tool for that day, and that is the whole argument.

---

## Overlap: where InPost and TurnUp touch

| Touchpoint | What is true today | What to do |
|---|---|---|
| **The household card reading InPost** | `arrival-email.js` matched Yodel on `yodel.co.uk`. Yodel merged into InPost on 17 July 2026 and its tracking links now redirect to `inpost.co.uk/tracking/result?parcel_code=JJD…` (checked 14 Oct). InPost's own domain was not in the carrier list. | **Done in this change**: `inpost.co.uk` added as a carrier with the JJD reference and the redirect's tracking URL; Yodel's link points at the same place. |
| **SMS windows never reach the card** | InPost tells the customer by text. The card fills from email. The shop's dispatch email (if forwarded) gives the card "dispatched", never the window. | Write it down, do not build around it. Reading SMS means an app with SMS permission, which is the thing we promised never to need. The card says "InPost said today" from the dispatch email and that is honest. |
| **Number plus postcode** | InPost's manage page gates on postcode. Our `/j/` page gates on the last four digits of the mobile. | Nothing. Same pattern, same reason. Keep ours at four digits: a postcode is on the parcel label, a mobile's last four is not. |
| **"Not going to be in?"** | InPost asks it and cannot act on it. We ask it the afternoon before and the answer goes to the trade's phone. | Keep it the day before, keep it four taps, and never show a redirect option the trade has not offered. |
| **Proof of delivery** | InPost: a photo in the app. Us: the attendance record, tap times, and No one home with the agreed fee or "Nothing is charged". | Not a photo. A photo of a front door on a forwardable link is the burglary-kit mistake. The record is the proof. |

---

## Competitive moves, in priority order

**1. The pilot numbers before anything else.** Every "we are better" above is an argument until thirty days of *links opened, asked-and-answered, wasted trips, where-are-you calls* are in. InPost cannot show those for a plumber; we can.

**2. Be the card ServiceM8's text opens.** ServiceM8's Track My Arrival is first-party, free and inside the tool customer zero already uses. It ends when navigation ends. Our connector already follows every booking; the move is an add-on listing so a ServiceM8 firm gets the whole job, not the drive.

**3. Say "no window the product invented" as the positioning line.** It is the one thing in the table above only we do on purpose. InPost's four texts are the slide.

**Do not** chase lockers, redelivery, a live map, or SMS reading. Each is either a depot feature or a privacy promise broken.

---

## Watch list

| Who | Why | Signal |
|---|---|---|
| ServiceM8 | Could extend Track My Arrival to a persistent job page | Help centre article changes; add-on marketplace |
| Glympse PRO | Only small-business product with a status vocabulary | UK pricing in sterling; a "Paused" state |
| On My Way (tryonmyway.com) | Enterprise layer that sits on any scheduler, claims 35% call deflection | A self-serve tier under £50 a month |
| Apple Wallet order tracking | iOS 26 reads order emails in Mail with Apple Intelligence, no merchant list needed | "Appointments" or "visits" appearing beside orders |
| InPost | Owns Yodel and Menzies; a national home-delivery network with a two-hour window | A persistent "my deliveries" page outside the app |
| Checkatrade | Bought Rated People's brand after its liquidation, 16–17 Sept 2026 | Any job-status product; today it ends at the introduction |

---

## Sources

- InPost help: [Can I get a delivery time window?](https://inpost.co.uk/help/can-i-get-a-delivery-time-window), [What time do you deliver until?](https://inpost.co.uk/help/what-time-do-you-deliver-until), [Home delivery](https://inpost.co.uk/home-delivery), [Manage your parcel](https://inpost.co.uk/home-delivery/manage-your-parcel), [the app](https://inpost.co.uk/app), [Google Play listing, updated 12 Oct 2026](https://play.google.com/store/apps/details?id=uk.co.inpost.inmobile&hl=en_GB)
- InPost ownership: [InPost and Menzies Distribution](https://inpost.co.uk/distribution), [Yodel, merged into InPost 17 July 2026](https://en.wikipedia.org/wiki/Yodel_(company))
- The four InPost texts and the manage page: the owner's own phone, screenshots 13 Oct 2026
- Yodel tracking link redirect to `inpost.co.uk/tracking/result`: checked by request on 14 Oct 2026
- DPD: [Predict and Follow My Parcel](https://www.dpd.co.uk/content/products_services/predict_fmp.jsp), [Follow My Parcel](https://app.dpdgroup.co.uk/content/products_services/followmyparcel.jsp)
- Amazon: [How to track an Amazon package](https://www.aboutamazon.co.uk/news/retail/how-to-track-an-amazon-package)
- ServiceM8: [What is Track My Arrival](https://support.servicem8.com/hc/en-us/articles/201190600-What-is-Track-My-Arrival), updated 26 Feb 2026
- Commusoft: [Vehicle Tracking app](https://apps.apple.com/us/app/id1455236496)
- Glympse: [En Route](https://www.sandbox.glympse.com/platform/en-route-app), [Field services](https://corp.glympse.com/?p=17957), [Glympse PRO on TrustRadius](https://tr-web.dev.trustradius.com/compare-products/glympse-pro-vs-localz)
- On My Way: [features](https://tryonmyway.com/features/), [press release, 24 Aug 2026](https://businesswirepr.co.uk/on-my-way-introduces-customer-experience-layer-for-field-service-appointments/)
- Localz: [On My Way module](https://www.localz.com/modules/on-my-way), [Descartes acquisition](https://www.descartes.com/resources/news/descartes-acquires-localz)
- Arrivy: [customer experience](https://arrivy.com/features/customer-experience)
- Fortem: [On My Way tracking](https://www.housing-technology.com/fortem-offers-on-my-way-tracking/)
- Apple: [Order tracking FAQ](https://support.apple.com/en-au/guide/business/order-tracking-faq-abcbb713dd73/web)
- Parcel app: [App Store](https://apps.apple.com/gb/app/parcel-delivery-tracking/id375589283)
- Rated People: [acquired by Checkatrade after liquidation](https://www.myjobquote.co.uk/blog/rated-people-acquired-by-checkatrade)
