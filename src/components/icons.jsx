/**
 * The icon set.
 *
 * These replaced emoji. Emoji looked like a placeholder because it is one: it
 * renders in whatever style the customer's phone ships, at whatever weight,
 * with a colour nobody chose, and a cartoon van next to "On my way" undoes the
 * rest of the page. These are drawn in one stroke weight, inherit colour from
 * the stage tint via currentColor, and scale with font size.
 *
 * There is deliberately not a single emoji left anywhere under src/. If one
 * creeps back, add the drawing here instead.
 *
 * Deliberately hand-rolled rather than an icon package: there are eleven of
 * them, and a dependency that ships four thousand is four thousand things to
 * audit for a page a stranger opens with no login.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

const Svg = ({ size = 24, children, ...rest }) => (
  <svg {...base} width={size} height={size} {...rest}>
    {children}
  </svg>
)

/* --- Stage icons ---------------------------------------------------------- */

export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="4" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M8 15h.01M12 15h.01M16 15h.01" />
  </Svg>
)

// A van seen from the side: cab, body, two wheels. Reads at 24px, which a
// more literal drawing does not.
export const VanIcon = (p) => (
  <Svg {...p}>
    <path d="M2 16V7a1 1 0 0 1 1-1h10v10" />
    <path d="M13 9h3.6a2 2 0 0 1 1.7.96L21 14v2h-1" />
    <path d="M2 16h1.5M9.5 16h5" />
    <circle cx="6.5" cy="17.5" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
  </Svg>
)

export const WrenchIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 3.5a5 5 0 0 0-6 6.6L3.8 14.8a2 2 0 0 0 0 2.8l1.9 1.9a2 2 0 0 0 2.8 0l4.7-4.7a5 5 0 0 0 6.6-6l-3 3-2.8-.7-.7-2.8 3-3Z" />
  </Svg>
)

export const PauseIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9v6M14 9v6" />
  </Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.4l2.6 2.6L16 9.6" />
  </Svg>
)

/* --- Action icons --------------------------------------------------------- */

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M6.6 3h2.1a1 1 0 0 1 1 .8l.7 3.2a1 1 0 0 1-.5 1.1l-1.5.8a11 11 0 0 0 5.7 5.7l.8-1.5a1 1 0 0 1 1.1-.5l3.2.7a1 1 0 0 1 .8 1v2.1A2.4 2.4 0 0 1 17.4 19C10.5 19 5 13.5 5 6.6A2.4 2.4 0 0 1 6.6 3Z" />
  </Svg>
)

export const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)

export const ShareIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3v11" />
    <path d="M8.5 6.5 12 3l3.5 3.5" />
    <path d="M6 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1" />
  </Svg>
)

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="3" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6a3 3 0 0 0-3 3v6.5A2.5 2.5 0 0 0 5.5 15" />
  </Svg>
)

export const MessageIcon = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a7.5 8.5 0 0 1-11 7.4L4 21l1.4-4.2A8.5 8.5 0 1 1 21 11.5Z" />
  </Svg>
)

export const CalendarPlusIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="4" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M12 13v5M9.5 15.5h5" />
  </Svg>
)

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Svg>
)

export const LinkOffIcon = (p) => (
  <Svg {...p}>
    <path d="M9.5 14.5 7.8 16.2a3.6 3.6 0 0 1-5-5L4.4 9.5" />
    <path d="M14.5 9.5l1.7-1.7a3.6 3.6 0 0 1 5 5l-1.6 1.7" />
    <path d="M4 4l16 16" />
  </Svg>
)

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const WalletIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="13" rx="4" />
    <path d="M3 11h18" />
    <path d="M16.5 15h1.5" />
  </Svg>
)

// A bare tick, for a control that is already coloured — the ringed CheckIcon
// above reads as "job done" and means something else.
export const TickIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

// What the product could become: a road ahead rather than a literal map.
export const CompassIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9Z" />
  </Svg>
)

export const ChevronIcon = (p) => (
  <Svg {...p}>
    <path d="m9.5 5.5 7 6.5-7 6.5" />
  </Svg>
)

/* --- Presence: will someone be in? --------------------------------------- */

export const HouseIcon = (p) => (
  <Svg {...p}>
    <path d="M4 10.4 12 4l8 6.4V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.6Z" />
    <path d="M9.75 21v-5.5h4.5V21" />
  </Svg>
)

// Someone stepping out and coming back: a figure mid-stride.
export const WalkIcon = (p) => (
  <Svg {...p}>
    <circle cx="13" cy="4.5" r="1.9" />
    <path d="M12.4 21l1.1-5.4-2.6-2.2.9-4.4" />
    <path d="M11.8 9l3.1 1.5 1.5 2.7" />
    <path d="M11.8 9 8.6 10.6 7.4 13.6" />
    <path d="m13.5 15.6 2.4 2.1.9 3.3" />
  </Svg>
)

export const PeopleIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.4" />
    <path d="M17.6 14.6A6 6 0 0 1 21 20" />
  </Svg>
)

export const DoorIcon = (p) => (
  <Svg {...p}>
    <path d="M5.5 21V4.6a1.6 1.6 0 0 1 1.3-1.58l8-1.33A1.6 1.6 0 0 1 16.7 3.3V21" />
    <path d="M3.5 21h17" />
    <path d="M13.6 12.2v1.4" />
  </Svg>
)

export const KeyIcon = (p) => (
  <Svg {...p}>
    <circle cx="7" cy="12" r="4" />
    <path d="M11 12h9.5" />
    <path d="M17 12v3.2" />
    <path d="M20 12v2.4" />
  </Svg>
)

// Stands in for a photo of whoever is coming, until one is uploaded.
export const WaveIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
)

/* --- Stage → icon --------------------------------------------------------- */

// Keyed by `tone`, which each stage already carries for its colour. One name
// per stage doing both jobs: the stage table in src/lib/trade-status.js is
// imported by the API routes, so it holds no JSX and no CSS — a tone becomes a
// drawing here and a colour in globals.css.
const STAGE_ICONS = {
  booked: CalendarIcon,
  onway: VanIcon,
  onsite: WrenchIcon,
  paused: PauseIcon,
  done: CheckIcon,
}

export function StageIcon({ tone, size = 28, ...rest }) {
  const Icon = STAGE_ICONS[tone] || CalendarIcon
  return <Icon size={size} {...rest} />
}

const PRESENCE_ICONS = {
  IN: HouseIcon,
  BACK_SOON: WalkIcon,
  SOMEONE_ELSE: PeopleIcon,
  OUT: DoorIcon,
}

export function PresenceIcon({ presence, size = 22, ...rest }) {
  const Icon = PRESENCE_ICONS[presence] || HouseIcon
  return <Icon size={size} {...rest} />
}
