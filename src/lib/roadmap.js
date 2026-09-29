/**
 * What this could become, written down so it can be voted on rather than
 * argued about at midnight.
 *
 * `state` is honest and is shown as such: 'live' works now, 'ready' is built
 * and waiting on something outside the repo, 'idea' is not built at all. Nothing
 * here is allowed to claim it works when it does not — that is the same rule
 * the customer-facing copy lives by.
 */
export const PHASES = [
  {
    id: 'now',
    title: 'Working now',
    blurb: 'Everything below is live on this app today.',
    items: [
      { key: 'status-link', name: 'One link per job', state: 'live',
        what: 'Booked in, on my way, on site, done. No promised time.' },
      { key: 'one-tap-text', name: 'Text the customer in one tap', state: 'live',
        what: 'Opens Messages with the number and the message already written.' },
      { key: 'passkey', name: 'Face ID sign-in', state: 'live',
        what: 'No password to type in a van.' },
      { key: 'window', name: 'Arrival window you can narrow', state: 'live',
        what: 'Sometime Tuesday becomes between 2 and 4 as the day settles.' },
      { key: 'run-position', name: 'Where they are in the day', state: 'live',
        what: 'You are 2nd today. A fact about order, not a clock.' },
      { key: 'presence', name: 'Will someone be in?', state: 'live',
        what: 'Four taps back from the customer. Saves the wasted trip.' },
      { key: 'access-notes', name: 'Which door, the dog, what3words', state: 'live',
        what: 'Told once by the customer, read before you knock.' },
      { key: 'who-to-expect', name: 'Who is coming and what they drive', state: 'live',
        what: 'Name, photo and the plate, shown only once you set off.' },
      { key: 'calendar', name: 'Put it in my calendar', state: 'live',
        what: 'Apple and Google. All day, or the window if you have set one.' },
      { key: 'installable', name: 'Add to home screen', state: 'live',
        what: 'Opens like an app, no address bar.' },
    ],
  },
  {
    id: 'next',
    title: 'Built, waiting on someone else',
    blurb: 'The code is done. These need an account or a certificate that only you can get.',
    items: [
      { key: 'wallet-pass', name: 'The card in Apple Wallet', state: 'ready',
        what: 'Updates itself on the lock screen when you tap a stage.',
        needs: 'Apple Developer Program, £79/yr' },
      { key: 'dvla', name: 'Van details from the number plate', state: 'ready',
        what: 'Type the plate, it fills in make and colour.',
        needs: 'A free DVLA API key' },
      { key: 'google-wallet', name: 'The same card on Android', state: 'idea',
        what: 'Google Wallet pass alongside the Apple one.',
        needs: 'Google Wallet issuer account, free' },
    ],
  },
  {
    id: 'soon',
    title: 'Next, if they are worth it',
    blurb: 'Tell me which of these you would actually use. That is what gets built.',
    items: [
      { key: 'sm8-sync', name: 'ServiceM8 sync', state: 'idea',
        what: 'Job booked there, link created and texted here. No double entry.' },
      { key: 'running-late', name: 'Running late, one tap', state: 'idea',
        what: 'Pushes the window back and tells them. Kills the "where are you" call.' },
      { key: 'photos', name: 'Photos when the job is done', state: 'idea',
        what: 'They see the finished work. Also your evidence if anyone queries it.' },
      { key: 'review-ask', name: 'Ask for the review at the right moment', state: 'idea',
        what: 'The page is open and the job just went well. Cheapest review you will get.' },
      { key: 'whatsapp', name: 'Send it on WhatsApp', state: 'idea',
        what: 'Most customers read WhatsApp faster than a text.' },
      { key: 'live-location', name: 'Live location while you are driving', state: 'idea',
        what: 'Starts at On my way, stops dead at On site. No history kept.' },
      { key: 'branded-card', name: 'Your own logo on the card', state: 'idea',
        what: 'The paid tier. Free shows My Trade Status instead.' },
    ],
  },
  {
    id: 'later',
    title: 'The bigger idea',
    blurb: 'A different product, and the one this was always pointing at. Every item here needs the data model rebuilt around a journey with two ends.',
    items: [
      { key: 'two-roles', name: 'Anyone can be either end', state: 'idea',
        what: 'Today the trade always moves and the customer always waits. In fact one person MOVES and one WAITS, and either of you can be either — a mate dropping something off, a neighbour picking up a key.' },
      { key: 'pickup-dropoff', name: 'Pickup and drop-off are two journeys', state: 'idea',
        what: 'Returning a parcel is a courier coming TO you, then going to the depot. A removal is a pickup here, a drop-off there. Each end is its own “will someone be in?”' },
      { key: 'household', name: 'An account per address, not per job', state: 'idea',
        what: 'Two or three adults who can let someone in or sign for something. The address answers, not one phone.' },
      { key: 'couriers', name: 'Couriers use it too', state: 'idea',
        what: 'Same question, same answer, same two ends. A failed delivery costs them more than a wasted visit costs you.' },
      { key: 'customer-invite', name: 'The waiting end asks for it', state: 'idea',
        what: 'A customer sends a link to whoever is coming. That is how it stops being one plumber and becomes a standard.' },
      { key: 'big-jobs', name: 'Programme of works for a big job', state: 'idea',
        what: 'RIBA stages, variations, what has been signed off and by whom.' },
      { key: 'quoting', name: 'Quotes and invoices', state: 'idea',
        what: 'Only worth doing once the card is in a hundred wallets.' },
    ],
  },
]

export const STATE = {
  live:  { label: 'Live',        tone: 'done' },
  ready: { label: 'Ready',       tone: 'onsite' },
  idea:  { label: 'Not built',   tone: 'booked' },
}

export const ALL_ITEMS = PHASES.flatMap((p) => p.items)
