# Shop tracks parcels, TurnUp tracks arrangements

**Verdict in one line: Shop is a shopping app that reads parcel emails, and by its own published rules it cannot hold the thing TurnUp holds — a dated arrival with no tracking number, arranged between two people, that either side can change.**

Shopify's Shop app is a genuine giant (No. 4 in UK App Store Shopping, 4.7/5 from 742k ratings — [UK App Store](https://apps.apple.com/gb/app/shop-package-order-tracker/id1223471316)) and it is free because Shopify funds it out of payment processing and pay-per-conversion advertising, not out of tracking. That funding model is the whole competitive picture: tracking is the hook that gets a shopping app opened, so Shopify has no reason to make it good for anything it cannot sell a product against. Shop's own help centre draws the boundary: forwarding only works for an email "that's in English and includes a tracking number" ([Shop Help](https://help.shop.app/en/shop/delivery-tracking/add-a-delivery-with-email-forwarding)), and "You can track deliveries only in the Shop app" ([Shop Help](https://help.shop.app/shop/delivery-tracking)) — so no forwardable link, and no row for a sofa with two men and a Tuesday window. Two things you should hear plainly, though. **First, you are wrong if you think nobody tracks a person arriving at a home**: ServiceM8 — your own integration partner — sells a Track My Arrival add-on today, British Gas has had engineer tracking since 2018, and Currys shows a live map of the engineer. **Second, the grocery idea is dead** and the reason is not technical. What is genuinely unoccupied is narrower than "arrival tracking" and more defensible than it looks: a reopenable, forwardable job state that covers Booked / Paused / Done, carries only what a named party said, and keeps a record of what was agreed. Everything that exists today is a moving dot that expires in about two hours.

---

## Shop has five ways in, and four of them are email scraping with a parcel-shaped hole

**Only Shopify's own orders arrive first-party. Everything else is a guess at your inbox.**

| Route | How it works | The catch |
|---|---|---|
| Shopify store / Shop Pay order | Populates automatically, matched on email address, no inbox access | Only Shopify merchants |
| Connected Gmail or Outlook | Scans last **30 days**, then "keeps checking"; keywords given as "tracking number" and "track your package" | Full keyword list not published; rescan frequency not published |
| Your unique forwarding address | Forward from anywhere, or set a mail rule | **English + a tracking number only** |
| Manual entry | Three fields: **Tracking number, Package name, Carrier** | No field for a date, a window, a crew or an engineer |
| In-app email search | A helper inside manual add | Needs an inbox already connected |

Sources: [Delivery tracking](https://help.shop.app/shop/delivery-tracking), [Automatically track orders](https://help.shop.app/hc/en-us/articles/360058869972-Automatically-track-orders), [Track your orders](https://help.shop.app/en/shop/delivery-tracking/track-orders), [Add a delivery with email forwarding](https://help.shop.app/en/shop/delivery-tracking/add-a-delivery-with-email-forwarding), [Manually add a tracking number](https://help.shop.app/en/shop/delivery-tracking/manually-add-tracking-number).

**The sentence that matters most to you is Shop's own admission of failure:** "Not all orders from stores outside of the Shop network are automatically tracked" — some tracking emails simply cannot be read, and the fix offered is to type it in by hand ([Shop Help](https://help.shop.app/hc/en-us/articles/360058869972-Automatically-track-orders)). Users report exactly that, independently: Shop "often can't pull tracking information from order confirmation emails, which forces manual entry" ([Trustpilot](https://www.trustpilot.com/review/shop.app) — user-submitted, unverified, and Trustpilot's summaries are auto-generated).

**And the one that is your opposite:** Shop will overrule the carrier. "The delivery page may show a 'Predicted by Shop' date when it differs from the carrier's estimate" ([Shop Help](https://help.shop.app/en/shop/delivery-tracking/track-orders)). That is a named, documented feature doing the exact thing TurnUp refuses to do. Your "say what the sender said, and name them" rule is not a quirk — it is the stated difference, and you can point at their page.

Three more hard edges, all Shop's own words: Shop "isn't involved in the fulfillment or delivery process" ([Shop Help](https://help.shop.app/shop/delivery-tracking)) — there is nobody on the other end who can move the state, so nothing in Shop can ever say "running 30 minutes late"; marking something delivered can only be undone within 7 days; after delivery only the package name can be edited ([Shop Help](https://help.shop.app/en/shop/delivery-tracking/track-orders)).

**Flagged gaps you must not paper over.** Shop publishes **no carrier list for any region**. The "600+ carriers" number is marketing copy reproduced by [Coywolf](https://coywolf.com/news/ecommerce/shopify-adds-amazon-order-tracking-to-shop-app/) with nothing enumerated behind it. So whether Shop tracks Royal Mail, Evri, DPD, Yodel or Parcelforce **is unconfirmed** — not researched-and-negative, genuinely unknown. The help centre is also a US-locale site; there is no UK version, so every limit quoted above is Shop's US-facing statement. And Amazon: Shop's help centre says that "as of September 23, 2024, Amazon is no longer available as a separate order source", while the same help centre still describes a US-only Amazon Prime connection — the two do not reconcile, Shopify has published no reason, and there was no tech-press coverage at all.

---

## Shopify funds Shop out of payments and ads, which is why trade visits will never interest it

**Shop is not a revenue line. It is the shell around Shop Pay and a pay-per-customer ad product.**

Shop launched 28 April 2020 as a rebrand of **Arrive**, Shopify's package tracker, which Shopify said had **16 million consumers** ([TechCrunch, 28 Apr 2020](https://techcrunch.com/2020/04/28/shopify-launches-shop-a-new-mobile-shopping-app/amp)). That sequence is the most instructive fact in this report: Shopify's own history treats delivery tracking as the habit that earns a home-screen slot, and shopping as the payload. You are competing with the bait, not the business.

The money comes from two places Shopify names itself. Merchant solutions revenue is principally payment processing through Shopify Payments, and the FY2025 10-K names "advertising on the Shopify App Store and **Shop Campaigns**, our buyer acquisition offering" ([Shopify FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm)). Shop Campaigns (formerly Shop Cash Offers) is pay-on-conversion: brands set a target acquisition cost, attach a Shop Cash multiplier, and Shopify earns a fee when a qualifying transaction happens ([Form 40-F FY2023](https://www.sec.gov/Archives/edgar/data/1594805/000159480524000007/exhibit11annualinformation.htm)). Shop Cash itself is a 1% rebate, spendable only across Shopify brands ([Modern Retail](https://www.modernretail.co/operations/shopify-is-betting-on-its-shop-cash-rewards-to-grow-app-sales/)).

**Read that loop once and the strategic answer falls out: the unit economics need a card transaction on a Shopify store.** A plumber's visit has no Shopify transaction, no repeatable merchant-acquisition value, and no product catalogue to feed the agentic-commerce infrastructure Shopify is now building. Shopify extending Shop into home-service visits is implausible *on its own economics*, not merely absent from the roadmap. Supporting evidence: Shopify has had no native appointment booking for six-plus years and leaves it to App Store apps ([Evey Events](https://www2.eveyevents.com/blog/can-you-book-appointments-on-shopify/)), and the FY2025 10-K and the Winter '26 Edition mention services, appointments, bookings and trades **not once** ([Winter '26 Edition](https://www.shopify.com/news/winter-26-edition-renaissance)). That is absence of evidence, which I am stating as such rather than as evidence of absence.

### The numbers, and the two you must never conflate

| Figure | Value | Status |
|---|---|---|
| Shop app MAU, Q1 2021 | "more than 24 million" | **Shopify's own, and the last one ever published** ([Form 6-K Q1 2021](https://www.sec.gov/Archives/edgar/data/1594805/000159480521000020/exhibit991pressreleaseq120.htm)) |
| Shop app MAU, any date after Q1 2021 | none exists | Shopify does not report it |
| Shop app GMV | none exists | Shopify does not break it out |
| **Shop Pay** lifetime GMV | passed **$400bn** June 2026; +53% YoY in Q2 2026 | Shopify, via [Digital Commerce 360, 6 Aug 2026](https://www.digitalcommerce360.com/article/shopify-revenue-gmv/) — **this is Shop Pay, a checkout button on merchants' own sites, NOT the Shop app** |
| "238.5m monthly active users" | website *visits*, mislabelled | [datarefs](https://www.datarefs.com/statistics/ecommerce/shopify/) — do not use |
| "40% MAU growth, Q1 2026" | SEO blog, no primary source, uncorroborated | [webtonic](https://www.webtonic.io/blog/e-commerce-shopify-statistics) — do not use |

**Any "Shop app has N million users" figure in circulation for 2025–26 is an aggregator's estimate.** Shopify reports the number it wants judging on, and it stopped reporting this one.

**Direction of travel: away from the Shop app.** Shopify's 2025–26 energy is in being the infrastructure under everyone else's surface — Agentic Storefronts, the Universal Commerce Protocol with Google, selling through ChatGPT and Gemini, Finkelstein's "We build the primitives, we open them up" ([Digital Commerce 360](https://www.digitalcommerce360.com/article/shopify-revenue-gmv/); [Shopify](https://www.shopify.com/blog/how-agentic-commerce-works)). A 150-update release in December 2025 mentioned the Shop app once in passing. Shopify also has a record of dropping things people relied on (Ping and Kit, the Product Reviews app, Amazon tracking) and of promise drift — Shop's GM said in 2020 the app would carry **no ads**; by 2023–24 there was an ad business in the 10-K. **Treat Shop as a design reference, never as a platform, partner or channel.**

---

## Shop is strong at scale and weak at exactly the five things you care about

**Its real strength is distribution and zero setup. Its documented weaknesses are all in the plumbing, and users independently confirm them.**

| Strength | Evidence |
|---|---|
| Massive installed base, free | No. 4 UK Shopping, 4.7/5 from 742k ratings ([UK App Store](https://apps.apple.com/gb/app/shop-package-order-tracker/id1223471316)) — *unconfirmed whether 742k is UK-only or global* |
| Zero setup for Shopify orders | No inbox connection needed ([Shop Help](https://help.shop.app/en/shop/delivery-tracking/track-orders)) |
| Merchants can't switch it off | Shop's tracking notifications can't be deactivated or edited by merchants, only by the customer ([Shopify Help](https://help.shopify.com/en/manual/fulfillment/setup/notifications/customer-notifications)) — distribution by default |
| Granular push controls | Per-type toggles plus a global switch ([Manage notifications](https://help.shop.app/hc/en-us/articles/6018738424724-Manage-notifications)) |

| Weakness | Evidence |
|---|---|
| Cannot parse an unknown share of emails | Shop's own admission, plus matching user reports ([Shop Help](https://help.shop.app/hc/en-us/articles/360058869972-Automatically-track-orders); [Trustpilot](https://www.trustpilot.com/review/shop.app)) |
| Stale updates | "usually doesn't update for several hours" ([Trustpilot](https://www.trustpilot.com/review/shop.app)) |
| Privacy objection to inbox access | Apple's privacy label lists data linked to the user including purchases, financial info, precise location and "emails or text messages", unverified by Apple ([UK App Store](https://apps.apple.com/gb/app/shop-package-order-tracker/id1223471316)); a blogger uninstalled it in "about 10 minutes" over ads and inbox scanning ([Hagensieker, 6 Dec 2025](https://hagensieker.com/2025/12/06/dont-use-the-shop-app/)) |
| Shopping app first | Ads and the discovery feed are the business model, not an oversight; users object to being forced into it by retailers ([Pissed Consumer](https://shop-app.pissedconsumer.com/review.html)) |
| No shareable surface | "You can track deliveries only in the Shop app" ([Shop Help](https://help.shop.app/shop/delivery-tracking)) |

All review evidence above is user-submitted, anecdotal and unquantified. The 4.7 aggregate should not be read as a verdict on the tracking — most ratings come from people using it to shop.

**The honest competitive read:** you are not competing with Shopify's business, you are competing with its loss-leader, and Shopify has no incentive to make that loss-leader excellent for things it cannot monetise. That is more defensible than it first sounds. It is also a cap, not a path to displacement — see the pricing section.

---

## Apple and Google already own this, but only where there is a tracking number

**Short answer to the Wallet and Live Activity question: a pass is open to you, a Live Activity is not, and neither Apple nor Google can currently see a tradesperson.**

| Surface | Can a third party with no app use it? | Notes |
|---|---|---|
| **Apple Wallet pass (PassKit)** | **Yes.** `generic` style, installed straight from a link or email by Mail/Safari, updated by APNs + your own web service | Costs: an Apple developer identity, a Pass Type ID certificate that **expires annually and can't be renewed in place**, and a long-lived service answering Apple's four endpoints ([Apple PassKit Ecosystem](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Ecosystem.html); [Creating Pass Packages](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html); [Passmint](https://passmint.com/blog/passkit-generator-vs-hosted-pass-api)) |
| **iOS Live Activity / Dynamic Island** | **No. Closed.** | The layout "is a widget extension compiled into your app"; Live Activities "do not run on Android or the web" ([OneSignal](https://documentation.onesignal.com/docs/en/live-activities)). No path from a web page, a PWA, web push or a Wallet pass. Also capped at **8 hours** active (+4 visible), so a Booked-for-Thursday state could never live there anyway |
| **Android Live Updates** | **No** (app-posted) | `Notification.ProgressStyle`, aimed at "rideshare, delivery, and navigation" — and Google's guidance tells developers to include "time of arrival" ([Android Developers](https://developer.android.com/about/versions/16/features/progress-centric-notifications)) |
| **Google Wallet Generic pass** | Yes, slowly | Needs an issuer profile, a pass class, a signed JWT and **Google's publishing approval** before issuing to the public ([Google Wallet](https://developers.google.com/wallet/generic)) |
| **Web push** | Yes — this is your surface | iOS only from a home-screen-installed page, which is exactly what `Notify.jsx` already handles |

*Caveat on the Live Activity finding: Apple's own ActivityKit pages render client-side and could not be read as text, so this rests on a push vendor's documentation plus several independent developer guides. Nothing found contradicts it, and the architectural reason is not disputed anywhere.*

**Does Shop put a delivery on a Wallet card or a Live Activity? Unconfirmed — no evidence either way was found.** No Shop documentation, press item or credible user report says it does.

The bigger platform story is Apple's own. Since **iOS 26** Apple Intelligence reads **Apple Mail** on-device for order confirmation and shipping emails and extracts "the organisation name, order status and tracking number", surfacing them on Wallet's Order Tracking page with a "Found in Mail" label ([Apple Order Tracking FAQs, en-GB, 14 April 2026](https://support.apple.com/en-gb/guide/business/abcbb713dd73/web)). It needs Apple-Intelligence hardware, Apple Mail specifically, and an opt-in; Apple says detection relies on common email patterns so "it doesn't capture every order", and a tester found orders "showing up very inconsistently" ([iPhone Life](https://www.iphonelife.com/content/how-to-track-a-shipment-with-apple-wallet)). **UK availability is unconfirmed**: Apple gates it on "countries or regions where the feature has been officially launched" and publishes no list. The en-GB page existing is weak-to-moderate evidence, not confirmation.

Google splits in two, and they get confused. The Gmail inbox tracking card is **"available for participating carriers in the US"** — the clearest US-only gate in the landscape ([Gmail Help](https://support.google.com/mail/answer/13073650?hl=en&co=GENIE.Platform%3DDesktop)). The cross-border mechanism that does work here is `ParcelDelivery` markup the *sender* adds ([Google](https://developers.google.com/workspace/gmail/markup/reference/parcel-delivery)) — and no UK trade or furniture firm will add it. On the September 2025 Gmail "Purchases view", the reporting conflicts: TechCrunch said it "will start rolling out in the coming weeks on mobile to users in their personal Google accounts" ([TechCrunch, 11 Sep 2025](https://techcrunch.com/2025/09/11/gmail-makes-it-easier-to-track-upcoming-package-deliveries/)), while a Yahoo Finance syndication said it was rolling out "today on mobile and web to users around the world" ([Yahoo Finance](https://finance.yahoo.com/news/gmail-makes-easier-track-upcoming-160000895.html)). Google's own post does not say.

**The decisive point across all of it: every automatic platform mechanism is keyed on a tracking number or a retail order.** Apple extracts a tracking number; Gmail's card requires tracking number plus merchant, order number and estimated date; Shop requires tracking number and carrier. A person coming to a house has none of those. **The realistic platform risk is not Apple building trade tracking — it is Apple's email parser widening to dated, tracking-number-free "we will attend" emails, which it already has the on-device model for.** Whether it catches those today is undocumented and untested; treat it as unknown.

**And the carriers have set the expectation you will be measured against.** DPD gives a one-hour window on the day narrowing to a 15-minute slot on a live map with the driver's name and stops remaining ([DPD UK](https://www.dpd.co.uk/content/products_services/predict_fmp.jsp) — note this page is roughly a decade old and the current app flow was not re-verified). Amazon pushes "10 stops away" with a map, for its own deliveries only ([About Amazon UK](https://www.aboutamazon.co.uk/news/retail/how-to-track-an-amazon-package)). Royal Mail is the weakest: notifications and redelivery, not windows or maps. Yodel and Parcelforce were not covered by any source — a real gap. Note what DPD's best feature actually is: **stops remaining is information without a promise**. That is the model for a product that refuses to guess.

---

## Somebody does track a person arriving — and one of them is ServiceM8

**You are wrong if you believe this ground is empty. It is occupied, in one consistent shape, and that shape is where your opening is.**

| Product | Customer-facing live link | Dependency | Expiry |
|---|---|---|---|
| **ServiceM8** Track My Arrival | **Yes — first-party, the trade's own phone GPS, no hardware** | Add-on toggle; needs a GPS fix when the text sends | **Only while you are "Navigating"; deactivates shortly after** |
| Jobber | Yes | **Force Fleet Tracking integration, US accounts only, Connect plan or higher** | 2 hours, or visit end, or completion |
| Housecall Pro | Yes | Force Fleet add-on, bought separately | 2 hours, or Start/Finish/Invoice |
| Commusoft (UK) | Yes | **Hardwired van GPS trackers**; add-on; price not published | not stated |
| Zuper | Claimed in marketing; **not in its own docs** | — | — |
| Tradify, Powered Now, Klipboard (all UK) | **No live link found** — reminders and portals only | — | — |

Sources: [ServiceM8 Help Center](https://support.servicem8.com/help-center/servicem8-add-ons/servicem8-add-ons/what-is-track-my-arrival); [Jobber Help Center](https://help.getjobber.com/hc/en-us/articles/29976893311255-Jobber-and-Force-Fleet-Tracking); [Housecall Pro Help Center](https://help.housecallpro.com/en/articles/6060351-vehicle-gps-tracking-overview); [Commusoft](https://www.commusoft.com/en-gb/features/fleet-management-software/); [Zuper docs](https://docs.zuper.co/Timesheets_Management/Timelogs/Tracking_Users); [Tradify](https://www.tradifyhq.com/features/job-tracking-software).

**Two things in that table should change how you talk about TurnUp.** ServiceM8's version is first-party, phone-GPS, no hardware, and documented as established by at least January 2020 — it is the closest thing to a competitor you have, and it is inside the product you integrate with. Its On-the-Way text **includes an ETA**, which is the thing you refuse to send. And three independent vendors have converged on roughly the same two-hour expiry, which tells you the constraint is staff privacy plus the fact that a moving dot has nothing to say outside the drive.

**That is the gap, stated precisely: what exists is a dot during the drive. What does not exist anywhere found is a reopenable job state.** No product found covers Booked in, or Paused with a reason, or Done. No link found can be opened the day before, or re-opened to see why the job is paused. Nothing holds who proposed what hours and whether the other side agreed.

Four supporting findings worth keeping:

- **UK homeowners are already trained.** British Gas has had "Track my engineer" since September 2018 ([British Gas on X, 23 Sep 2018](https://x.com/BritishGas/status/1043922949605011456); [British Gas](https://www.britishgas.co.uk/cover/book-an-engineer)). Currys' "Track it" shows **a live map of the engineer** ([Google Play](https://play.google.com/store/apps/details?id=uk.co.currys.trackit&hl=en_GB)). John Lewis texts the night before to narrow to a **two-hour window** and the crew **calls 30 minutes out**; a guaranteed two-hour slot costs £39.95 ([John Lewis](https://www.johnlewis.com/customer-services/delivery-information/uk-delivery); [timed deliveries](https://www.johnlewis.com/customer-services/delivery-information/faster-and-timed-deliveries) — that page was ~545 days old, verify). A customer who has had all three is the one being told "sometime Thursday".
- **The lead-generation platforms have nothing, and structurally cannot.** Checkatrade, MyBuilder and Rated People all end at the introduction: no job record, no schedule, no engineer app, so nothing to build a status page on ([GES](https://gasengineersoftware.co.uk/blog/lead-gen-site-guide-for-heating-businesses/); [TradeHand](https://tradehand.com/blog/mybuilder-rated-people-checkatrade-builders)). **Caveat: Local Heroes (Centrica-owned) and Trustatrader were not checked, and Checkatrade's newer Express Job booking flow was not researched.** Local Heroes is the single most plausible place this already exists — check it before claiming the ground is clear.
- **Nothing aggregates people and things arriving at one house.** Parcel aggregators stop at parcels because they are keyed on a tracking number. **But not finding a dead startup is weak evidence** — failed consumer apps leave thin traces. Do not claim nobody has tried.
- **Tracking does not prevent a missed appointment; it prevents the customer being uninformed.** British Gas has had a tracker since 2018 **and** paid about £1.1m to roughly 12,000 customers over missed appointments, at Ofgem's £30 per missed appointment ([Ofgem](https://www.ofgem.gov.uk/press-release/british-gas-pays-ps11m-compensate-customers-after-agents-missed-appointments); [Ofgem Guaranteed Standards](https://www.ofgem.gov.uk/sites/default/files/docs/2016/12/guaranteed_standards_-_open_letter_16_december_2.pdf)). Keep the claim about information, not reliability. E.ON paid £3.1m in a comparable case.

**On demand evidence, be careful.** The famous "72 million hours a year waiting in for tradespeople" is a **2013 HomeServe PR survey** — 13 years old, commissioned by a company selling home cover ([PR Newswire](https://www.prnewswire.com/news-releases/waiting-in-drain-homeserve-discover-brits-spend-72m-hours-a-year-waiting-for-plumbers-201574491.html)). The recent, better-sourced surveys measure something adjacent: 35% of 500 UK homeowners said tradespeople failing to turn up is a major inconvenience ([Markel, April 2026](https://www.markeluk.com/knowledge-centre/tradie-etiquette-uk)). **No recent UK survey measuring hours wasted waiting was found.** Do not lean on the 72 million hours without both caveats attached.

---

## The grocery idea does not work, and the reason is that the supermarkets already do it

**Verdict, first line, unsoftened: do not build it. The feasible version has no value and the valuable version requires holding other people's supermarket passwords. There is no overlap. That is the trap.**

The reminder you want to send is already sent, by the people who own the data:

| Retailer | Amend cut-off | Who already tells the customer |
|---|---|---|
| Ocado | **~48 hours** before delivery | **Ocado sends an email or SMS closer to the date with the exact cut-off** |
| Sainsbury's | 11pm day before (midday same-day) | **Stated in the confirmation email, with how long is left to amend** |
| Tesco | 11:45pm night before | Stated at checkout; separate 14 Dec deadline for Festive Food to Order |
| Asda | 11pm night before | Points customers at "Your Orders" |
| Waitrose | 11pm day before (10pm, 20–24 Dec) | Shown after checkout and in My Orders |
| Morrisons | **not reliably established** (sources say 24h / 8pm / 11:59pm, all 2018–2020) | reported to be in the confirmation email |

Sources: [Ocado help](https://help.ocado.com/hc/en-us/articles/15885680021660); [Sainsbury's help](https://help.sainsburys.co.uk/help/ordering/place_order); [Tesco help](https://www.tesco.com/help/pages/online-grocery-faqs/ordering-online/changing-delivery-or-click-collect-slots); [Tesco Festive Food](https://www.tesco.com/shop/en-GB/zone/festive-food-to-order); [Asda](https://www.asda.com/groceries/delivery/how-to-shop); [Waitrose help](https://www.waitrose.com/ecom/help-information/customer-service/delivery-amending-an-order-and-substitutions). **Caveat: Tesco's, Waitrose's and Ocado's help pages returned 403 / 503 / empty body to automated fetching, so those three are quoted via search-engine extracts, not a direct read.** That blocking is itself the finding — see below.

Five reasons it fails, in order of how fatal they are:

1. **Ocado already ships your core feature, free and authoritative.** The single most damaging finding.
2. **A reminder computed from a published rule will be wrong, in the direction that destroys trust.** Ocado reserves the right to bring the cut-off forward on capacity ([@Ocado](https://x.com/Ocado/status/1246411404376145921), 2020); Tesco runs separate seasonal deadlines; Asda tells people to check their account rather than the published time. You would have to parse the per-order string, not apply a rule.
3. **The "usuals" list is already in every retailer's app, better.** Tesco and Sainsbury's both do reorder-from-previous-order plus favourites. A list rebuilt from emails is lossy, lagging, carries no product IDs, and drifts from what was actually delivered once substitutions happen. Ocado even built an importer that pulls favourites **out of** Asda, Tesco, Sainsbury's and Waitrose ([Images RetailME](https://www.imagesretailme.com/ocado-introduces-tool-to-import-online-shopping-lists/)) — proving the feature is valuable to whoever is trying to win the customer, and worthless to a neutral third party.
4. **There is no API, and the alternative is a credential store.** Tesco's 2009 developer API was read-only — "It doesn't allow for ordering" — and it was retired with nothing replacing it ([DEV, 2026](https://dev.to/yappman/how-to-get-tesco-prices-with-an-api-in-2026-4n20); [archived Ruby gem](https://github.com/jphastings/TescoGroceries)). The only way to write to a basket is to drive private endpoints with the customer's own session or password, which is what the open-source [Open Supermarkets](https://github.com/abracadabra50/uk-grocery-cli) project does — and its own docs say "Ocado slot booking and checkout are blocked by AWS WAF", sessions expire, and retailers "may change APIs without notice". **For a sole trader, holding other people's supermarket logins and saved cards is an unbounded liability with no insurance behind it.**
5. **The legal precedent is the worst possible one.** *Ryanair v PR Aviation* (CJEU C-30/14, 2015) was a price-comparison scraping case, and the holding is counter-intuitive: because the data was **not** protected by copyright or database right, the Database Directive's user-protecting exceptions did not apply, leaving Ryanair's terms of use fully enforceable against the scraper ([Pinsent Masons](https://www.pinsentmasons.com/out-law/news/website-operators-can-prohibit-screen-scraping-of-unprotected-data-via-terms-and-conditions-says-eu-court-in-ryanair-case)). The instinct "the prices aren't protected so I can take them" is exactly the argument that lost. Post-Brexit it is persuasive rather than binding — a thin reed, resolved by a letter from a supermarket's legal department rather than a judgment. **Computer Misuse Act exposure was not researched and should go to a solicitor, not to me.**

**And the history is a graveyard, not an underserved market.** mySupermarket, the fifteen-year category leader, closed on 1 March 2020 ([MoneySavingExpert](https://www.moneysavingexpert.com/news/2020/02/mysupermarket-site-and-app-set-to-close-on-sun-1-mar/)); it never took a transaction and its data went stale. Its volunteer successor Trolley.co.uk "has never made any money" and in 2022 was days from closing over £28,000 ([Big Issue](https://www.bigissue.com/news/social-justice/food-comparison-site-close-cost-living-crisis/)). PriceRunner survived by being bought by Klarna.

**One last thing: the pain is unevidenced.** No UK data was found on how often shoppers amend an order, or on forgotten-item frequency. The strong 2026 statistic — one in five grocery trips involves a missing item ([The Grocer](https://www.thegrocer.co.uk/news/one-in-five-grocery-trips-involves-missing-items-research/715917.article)) — is about **the supermarket being out of stock**, which no reminder can fix. Using it to justify this product would be misreading it.

**The salvageable part is not a grocery product.** It is the observation that "a deadline the supplier set, repeated to the customer before it passes" is a general pattern — which is exactly what your window and nudge machinery already does for a trade's job. If you want to spend anything on this, spend it on the cheap decisive test: place one order with each of the six retailers and read the actual emails. That answers the open questions for the price of six shops, and it is still probably a no.

---

## Price it at £9.99 a month, and know that 300 trades is the real target

**The ceiling is set by ServiceM8's £25 for an entire job-management system. An add-on priced near that reads as mispriced however good it is.**

| What this market charges | Price | Why it matters |
|---|---|---|
| ServiceM8 Starter | **£25/mo flat, unlimited users**, 50 jobs, 100 SMS, API and add-ons included | The hard anchor, and the system you attach to ([ServiceM8 UK](https://www.servicem8.com/uk/pricing)) |
| ServiceM8 Free | £0, 30 jobs | Proof that a free tier metered on **jobs** works here |
| YourTradebase | £29/mo flat, whole system | ([YourTradebase](http://www.yourtradebase.com/pricing/)) |
| Powered Now Professional → Premium | **+£8/user/mo**, and the headline of that step is the **customer portal and appointment reminders** | The in-market bundled price of a customer-facing layer ([Powered Now](https://www.powerednow.com/pricing)) |
| Tradify Instant Website | **£10/mo** | The clearest comparable standalone add-on ([Tradify UK](https://www.tradifyhq.com/en-gb/pricing)) |
| Tradify / Powered Now / Joblogic | £34–£45 **per user** per month | Per-seat, which is wrong for a one-man firm |
| SMS pass-through | 5p (ServiceM8 extra) to 10p (Tradify) | Metered messaging is the only adjacency the whole market monetises |
| Checkatrade | advertised from £59/mo; **typical real spend £67–£200/mo**, 12-month auto-renew | ([Checkatrade cost guides](https://whito.co.uk/tools/checkatrade-cost-uk/)) |

**Recommendation: £9.99/month ex VAT, flat per account, unlimited customers and unlimited links, monthly, cancel any time, no minimum term. Annual = two months free (~£99.90), because that is the convention this buyer already recognises.** A free tier metered on live jobs, not on features — the free page must be the complete status page, because a crippled free page loses to a platform's generous free page on sight. Path to £14.99–£19 later, earned by the **record-keeping** (terms snapshots, window agreement history, the dual-clock audit trail), not by more notifications.

**Do not price per notification.** Web push has no marginal cost, the bill would be unforecastable, and charging more when the trade communicates more punishes the exact behaviour the product exists to encourage. If you ever send SMS, pass it through at 5–10p and say it is a pass-through.

### The arithmetic, stated bluntly

Assume 5% monthly churn (SMB SaaS benchmarks cluster 3–7%, midpoint 4–5%; one 2026 dataset reports 4.5% and says the top cancellation reason is **"small business closed or owner exited" at 32%** — [RetentionCheck](https://retentioncheck.com/churn-benchmarks/smb-saas), vendor data, methodology unstated).

At £9.99 and 5% monthly churn, average customer life is ~20 months, so **gross lifetime value is about £200**.

| Paying trades | Per month | Per year | New signups needed each month just to stand still |
|---|---|---|---|
| 50 | £500 | ~£6,000 | 2–3 |
| 100 | £999 | ~£12,000 | 5 |
| **300** | **£2,997** | **~£36,000** | **15** |
| 500 | £4,995 | ~£60,000 | 25 |
| 1,000 | £9,990 | ~£120,000 | 50 |

At £14.99 the same table needs **~250 trades for £3,750/month** and ~200 for £3,000.

**What that means for being off the tools by 2029–31.** You need roughly **300 trades at £9.99, or 250 at £14.99**, to reach a £36–£45k annual run rate — and then 15–25 new signups a month, every month, for ever, to hold it. The reassuring framing: the UK addressable base across plumbing/heating (~118,600–150,000 people) and electrical (~198,300–320,000) at a 35–40% sole-trader share is plausibly in the **low hundreds of thousands** ([House of Commons Library SN06152](https://researchbriefings.files.parliament.uk/documents/SN06152/SN06152.pdf) for the macro; trade-site estimates for the trade counts, definitions vary, **do not average them**). 300 trades is about **0.2%** of just those two trades. The unforgiving framing: a £200 LTV rules out any acquisition channel costing more than roughly £50–£60 per customer. **That rules out paid search in trade keywords and rules out a sales call. This is a zero-touch, distribution-led business or it is nothing** — which is the real argument for the ServiceM8 add-on marketplace, where API access and third-party add-ons are already available from the £25 Starter tier.

**Headroom clue worth acting on:** trades pay 3–8× more for leads than for software (£67–£200 vs £25). Willingness to pay is attached to *getting work*, not *running work*. A pricing story that connects the status page to repeat work and referrals has far more room than one framing it as admin tooling.

**The central commercial risk, which no source resolves:** whether a UK sole trader will pay anything at all for this as a separate line item, rather than expecting it inside their existing £25–£44 subscription. There is **no independent UK data on trade willingness to pay**, no price-sensitivity study, and no standalone competitor to compare against — the £8–£15 range is inferred from adjacent add-on prices. Test £9.99 on ten real trades before building any billing.

**On competing with free, the record is sobering and should set your expectations.** The best-documented case is Slack against Microsoft Teams: as of April 2021, ~145 million Teams customers against Slack's 12 million, and of the Fortune 100, 91 had Teams and 65 had Slack ([HBS Working Knowledge](https://www.library.hbs.edu/working-knowledge/free-isnt-always-better-how-slack-holds-its-own-against-microsoft-teams)). Harvard's David Yoffie's conclusions transfer directly: the main threat is **imitation and integration**, and the likely outcome is a **split** — the independent leads in segments the bundler serves worse. **The good outcome is a loyal paying minority in a defined niche. Nothing in the record supports a plan where you displace the free product.** No case was found of a *single-founder* product surviving next to a platform's free feature — every documented case is a venture-funded company with a sales force. That transferability is an inference, not a finding.

---

## What to build next, and what to leave alone

**Build the things that are records. Leave the things that are notifications — the market already has those.**

**Build:**

| Do this | Because |
|---|---|
| **The ServiceM8 add-on listing** | Self-serve distribution into exactly the right buyer, no sales call, API access is included from £25, and you already have the integration. The single highest-leverage move available. |
| **The pass web service** (`/api/passes/v1`) | A `generic` Wallet pass is the one rich platform surface genuinely open to you, installable from a link with no app. Until it exists, a pass shows the stage at the moment it was added — so keep calling TurnUp a link, not a card, everywhere customer-facing. |
| **Lean harder on what makes a reopenable link different from a dot** | Every competitor's link expires in ~2 hours and says nothing about Booked, Paused or Done. Say that in the marketing, with the specifics. |
| **The record: window agreement history, terms snapshots, the dual-clock event log** | These accumulate, cannot be back-filled by a competitor shipping the feature next month, and a trade with two years of them cannot leave without losing them. The terms snapshot has an external reason to exist (Consumer Rights Act 2015, Consumer Contracts Regulations 2013) that a platform shipping a free status page has no reason to touch. |
| **Check Local Heroes and Checkatrade's Express Job flow** | Local Heroes is Centrica-owned, and Centrica is the one UK brand that already has engineer tracking. If a homeowner-to-sole-trader status link exists anywhere, it is most likely there. Unchecked. |

**Do not build:**

| Not this | Because |
|---|---|
| **The grocery product, in any version** | See above. Ocado already sends it, there is no API, and the valuable version is a supermarket credential store. |
| **An ETA, a countdown, or anything that guesses** | Shop's "Predicted by Shop" and Android's "include time of arrival" are the platform defaults; your refusal is the differentiator. It is also the one thing a one-van trade genuinely cannot honour. |
| **A native iOS app chasing a Live Activity** | 8-hour ceiling, a widget extension, an App Store release per use case, and ActivityKit push infrastructure — all to show a state you already push to a lock screen. |
| **Insurance, warranty or finance referrals** | Credit broking is a regulated activity under art. 36A RAO; you would need FCA authorisation or appointed-representative status under a principal carrying PI cover for your conduct, plus mandatory fee disclosure ([FCA Handbook SUP 12](https://handbook.fca.org.uk/handbook/sup12)). A compliance programme, not a revenue line. |
| **Payment take rates or lead generation** | Payments are already free-at-the-margin inside every incumbent; lead gen means competing with Checkatrade's £67–£200/month on 12-month terms. |
| **A household-card business plan** | Build the card for retention of the *trade's* customer, not as a second product. There is no payer on the household side, the parcel aggregators have been commoditised to free by three parties who do not need the revenue, and there is **no network effect**: one plumber using TurnUp makes it no better for the next plumber. |
| **Anything built on Shop as a partner or channel** | Promise drift (no ads → an ad business), Amazon dropped without explanation, Ping and Kit retired, and shop.app moved to shop.com. |

---

## The verdict: you win on the arrangement and the record, and you lose on reach

**Where TurnUp can defensibly win:** the arrival that has no tracking number and no carrier, where both ends can change it and somebody has to say so. Shop's own documentation closes that door — "in English and includes a tracking number", a three-field form with no slot for a date or a crew, and "Shop isn't involved in the fulfillment or delivery process" so nobody on the other end can ever move the state. Apple and Google close it the same way, keying on an order number and a tracking number. The field-service products that do track a person all produce a moving dot that dies in two hours and promises an ETA the trade cannot keep. **What nobody holds is the job state and its history: who proposed which hours, who agreed, what the customer was told and when, what terms they accepted before the day, and what the tap said versus what the server saw.** That is a record rather than a notification, it compounds, and the strongest version of it is the compliance one — a timestamped agreement is what makes a short-notice charge enforceable, and no platform has a reason to build that for UK sole traders. Add the ServiceM8 marketplace as distribution and the £200 LTV becomes workable.

**Where TurnUp loses, and you should plan for losing there:** reach, parcels, and anything resembling a consumer habit. Shop is free, funded by somebody else's business, sitting at No. 4 in UK Shopping, and pushed at customers by retailers who cannot switch its notifications off. You will not out-distribute that, and the Slack record says the honest ambition is a loyal paying minority, not displacement. You also lose the richest surfaces outright: the Live Activity and the Dynamic Island are closed to a product with no native app, full stop. And you lose on precision — DPD's 15-minute slot and Amazon's "10 stops away" are what your customer's expectation is set by, and refusing to guess will read as a deficiency to some of them however right it is. The uncomfortable one: **"customer status notifications" is already a feature inside every field-service product, including the one you integrate with.** ServiceM8 could ship a reopenable status page tomorrow, owns the relationship, the key and the API terms, and **no evidence was found either way about whether it intends to.** That is the single most important unknown for your defensibility, and it is not answerable from this research.

Two honest shifts in understanding that came out of this. First, the "nobody tracks a person arriving" premise is false, and dropping it makes the pitch stronger rather than weaker — the thing to claim is not live tracking but a link that still works tomorrow and says why the job is paused. Second, the household card is the right strategic instinct for the wrong commercial reason: the arrivals-not-parcels wedge is real and documented by Shop itself, but every consumer-side aggregator in this space has been driven to free by somebody with another business, and TurnUp has no other business. Keep the card as the reason a household remembers which plumber sent it. Do not expect it to pay.
