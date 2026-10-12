# The ServiceM8 connection: what works today, what needs an add-on, and the plan

*12 October 2026. Written after the box on the dashboard told Will it could not
look inside ServiceM8, and he asked for a better way.*

## What the API key can do, checked against the live account

The connector authenticates with an account API key (`SM8_API_KEY`). Tested on
12 Oct 2026 against job 2742:

| Need | Endpoint | Works with the key? |
|---|---|---|
| The job, by number or uuid | `job.json` | yes |
| Bookings (scheduled visits) and check-ins | `jobactivity.json` | yes, with a `start_date gt` filter for the week ahead |
| The customer on the job, mobile included | `jobcontact.json` | yes |
| **Whether the booking email went, and whether it was opened** | `email.json?$filter=related_object_uuid eq {job}` | **yes** — `direction`, `timestamp`, `to_email`, `subject`, `opened`, `first_opened_at`, `bounced`, full text |
| **Whether the booking text went** | `sms.json?$filter=related_object_uuid eq {job}` | **yes** — `direction`, `timestamp`, `to_phone`, full text |
| Inbox (incoming email and web enquiries) | `inboxmessage.json` | yes |
| Being told when a job moves | webhook subscriptions | yes, five subscriptions live |
| Email and SMS templates | `emailtemplate.json`, `smstemplate.json` | yes, read and write |
| The job diary as a whole | — | **no**: "not an authorised object type". The diary is readable only through ServiceM8's own apps and its MCP connector |
| Sending an SMS through ServiceM8 | Messaging API `send_sms` | **no with a key**: needs an add-on and incurs the account's SMS charges |
| Writing a diary item | add-on Job Diary endpoint | **no with a key**: add-ons only, create-only, attributed to the add-on |
| A button on the job card | add-on Job Action | add-ons only |

So the thing Will asked for on 12 Oct ("check what's on ServiceM8 and whether
the initial email and text with the link has been sent") is answerable from the
key alone. Job 2742: ServiceM8 sent the confirmation **email** at 00:05 on 10 Oct
with the link in it, Will opened it at 20:02 the same day, and **no text was
sent at all**. That is the automation's "Send text message confirmation" method
being off, or the booking not having been made from the job card with Send
Booking Confirmation ticked. ServiceM8 does not send a confirmation for a job
dragged onto the calendar.

## What shipped now (v1.33.0)

- `fetchMessages(jobUuid)` and `confirmationState()` in `src/lib/servicem8.js`:
  the verdicts *texted and emailed · texted · emailed, opened · emailed, not
  opened yet · emailed, bounced · sent, but without the link · nothing sent*.
- `fetchUpcoming({ days })`: every scheduled visit in the window, de-duplicated,
  with the job, the contact, the verdict and whether a TurnUp card follows it.
  Cached 90 seconds per instance; ServiceM8 allows 180 calls a minute.
- **This week in ServiceM8** on the dashboard (`Sm8Week.jsx`): one row per
  booking, the verdict in colour, *Text the link* (opens Messages with the number
  and the words in, so the trade sends it from their own phone and it costs
  nothing), *Make the card now*, *Open their page*.
- The box is given the same lines and answers "did the link go?" from them.

What this deliberately does not do: send anything itself. A text sent from the
trade's own phone is honest about who sent it and lands in their own Messages
thread; a text sent through ServiceM8 lands in the job diary, which is better,
and is Phase 1.

## The plan for the full connection

**Phase 1 — a private add-on (the one that matters).** ServiceM8's Addon Kit
lets a single account install an add-on without Store review. It gets OAuth
scopes the key does not have:

- `publish_sms`: TurnUp sends the booking text and the day-before text through
  ServiceM8, so they appear in the job diary and the customer's existing thread.
  Charged against the account's SMS allowance, like any ServiceM8 text.
- Add-on Job Diary items: every TurnUp event (set off 07:42, on site 08:10,
  terms agreed, no one home, customer replied *someone else will be in*) written
  into the job diary, attributed to TurnUp. The trade's system of record then
  holds the evidence without anyone copying it.
- `manage_badges` / notifications: a *Customer not home* badge and a *Running
  late* badge so ServiceM8's own Badge Follow Up automation can act.
- A Job Action button on the job card: *Open in TurnUp*, which opens the card.

What it needs: a ServiceM8 developer account (free), the Addon Kit, a small
serverless function or a route on getturnup.com to hold the OAuth tokens, and
an afternoon. Will installs it on his own account; nobody else sees it until it
is listed.

**Phase 2 — the card made and the link sent the moment a booking is made.**
With Phase 1 in place, an event webhook on job creation or booking creation
makes the card and sends the link through `publish_sms`, in TurnUp's own words,
with the terms line. The ServiceM8 Booking Confirmation automation then becomes
optional rather than the single point of failure it is today.

**Phase 3 — the Store listing.** Only once two or three other trades have
asked. Review, a public listing, and the same add-on for anyone on ServiceM8.

## What not to do

- Do not scrape the diary or drive ServiceM8's web app. The history endpoints
  give the facts that matter, and an add-on gives the rest properly.
- Do not send SMS from TurnUp's own gateway to work around ServiceM8. Two
  threads for one job is the confusion this product exists to remove. When
  TurnUp has its own SMS it will be for trades who do not use ServiceM8.
- Do not claim in any copy that the connector sent a text. Today it opens
  Messages; the trade sends it.
