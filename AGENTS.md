# Project Overview

**Kippenstummel** is a community-driven platform for collaboratively mapping and
rating cigarette vending machines (CVMs). Users can register CVM locations,
verify and correct positions, and rate machines based on availability and
functionality. A reputation system based on karma and trust scores ensures
data quality through swarm intelligence — rewarding reliable contributors and
surfacing inaccurate or outdated entries.

The platform consists of four components:

- **API** — backend service providing the core business logic, data persistence,
  and REST API consumed by all other components
- **Web** — browser-based map frontend for end users; allows registering, locating,
  and rating CVMs, and manages anonymous user identities and karma
- **KMC** _(Kippenstummel Management Console)_ — internal tooling for moderators
  to review reported machines, manage trust scores, and handle abuse cases
- **CredLib** — utility library containing algorithms for calculating
  an user's credibility.

This repository contains the **KMC** component of the Kippenstummel project.

## Functionality

Kippenstummel is a crowd-sourced map of cigarette vending machines (CVMs). The
core use case is simple: users report CVM locations, and the community
collectively verifies and maintains their accuracy over time.

**Map & Discovery**
The map displays all registered CVMs, clustered at lower zoom levels for
clarity. Each machine is represented by a badge-coded marker reflecting its
current trust level, derived from its score (ranging from -10 to +10):

- **Top Rated** (+5 to +10) — repeatedly confirmed as working and correctly located
- **Neutral** (0 to +4) — not yet well-verified or mixed feedback
- **Bad** (-1 to -7) — frequently reported as missing or defective
- **For Deletion** (-8 to -10) — likely invalid; pending removal

**CVM Lifecycle**
Any registered user can submit a new CVM location. When submitting, the
reporter provides the exact coordinates (typically via GPS). From that point,
the community takes over: users who encounter the machine in the real world can
upvote it (working, correctly placed) or downvote it (missing, broken, wrong
location). If a machine's position is slightly off, any user can propose a
coordinate correction without re-registering it. In severe cases — spam,
abuse, or gross misplacement — machines can be flagged for moderator review.

**Identity & Anonymity**
Active participation requires an account, but Kippenstummel avoids traditional
registration. Instead, users receive an anonymous identity — no email, no phone
number. This identity is personal and persistent, and tied to all interactions
on the platform.

**Karma & Permissions**
Every user accumulates karma based on the quality and reception of their
contributions. Registering machines that other users confirm as accurate
increases karma; contributing low-quality or incorrect data decreases it.
Karma directly influences a user's permissions and ability to act on the
platform, creating a self-regulating trust hierarchy.

**Moderation**
Moderators operate independently of the crowd-rating system and handle
escalated cases — abuse reports, spam, or systematic data manipulation — that
fall outside what swarm intelligence alone can resolve reliably.

## Tech Stack

- **Runtime**: Node.js, TypeScript 5+
- **Framework**: Next.js 15+ (App Router) with React 19+
- **Styling**: Tailwind CSS v4+, `tailwind-variants` for component variants
- **UI Components**: React Aria Components with `tailwindcss-react-aria-components`
- **Map**: MapLibre GL via `react-map-gl`
- **Charts**: Plotly.js, `react-calendar-heatmap`
- **State Management**: Redux Toolkit with `redux-persist` for client-side
  persistence; SWR for server-state / data fetching
- **Auth**: NextAuth v4 with credentials provider; short-lived JWT access
  tokens issued server-side and rotated on expiry
- **Forms**: Formik + Yup
- **Animation**: Motion
- **Testing**: Vitest (unit), Storybook + Chromatic (UI)

## Project Structure

```
.
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/                 # NextAuth route handler
│   │   │   ├── bff/                  # BFF proxy routes forwarding to the KMC API
│   │   │   ├── geocoding/            # Geocoding API route
│   │   │   └── runtime-config/       # Runtime config endpoint for CSR
│   │   ├── cvms/                     # CVM management pages
│   │   ├── ident/                    # Identity management pages
│   │   ├── jobs/                     # Background job monitoring pages
│   │   ├── stats/                    # Platform statistics and charts
│   │   ├── signin/                   # Login page
│   │   ├── home/                     # Dashboard home
│   │   ├── layout.tsx
│   │   └── globals.css               # Tailwind base styles and customizations
│   ├── components/                   # UI components (Atomic Design)
│   │   ├── atoms/                    # Single-purpose base components
│   │   ├── molecules/                # Composed components
│   │   ├── organisms/                # Full sections and feature blocks
│   │   └── templates/                # Page-level layout templates
│   ├── contexts/                     # React context providers
│   ├── hooks/                        # Custom React hooks
│   ├── store/                        # Redux store and slices
│   │   └── slices/                   # theme
│   ├── api/                          # Typed API client
│   └── lib/                          # Utilities and shared logic
│       ├── types/                    # Shared TypeScript types
│       ├── auth-options.ts           # NextAuth configuration
│       ├── constants.ts
│       ├── geo.ts                    # Geospatial helpers
│       └── visualization.tsx         # Chart/visualization helpers
├── public/                           # Static assets
├── .storybook/                       # Storybook configuration
├── next.config.ts
├── tailwind.config.mjs
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Design Decisions

- **Atomic Design**: Components follow atomic design principles — atoms,
  molecules, organisms, templates — for reusability and consistent composition
  across the dashboard.
- **BFF Proxy**: The KMC never calls the Kippenstummel API directly from the
  browser. All requests are routed through Next.js API routes acting as a
  Backend-for-Frontend proxy, keeping the backend URL and access token
  server-side only.
- **Credentials-based Auth with short-lived JWT**: Authentication is handled
  via NextAuth with a single admin credentials provider. On login, a short-lived
  JWT access token (5 minutes) is issued server-side and attached to the
  session. Tokens are rotated transparently on expiry within the NextAuth JWT
  callback — no client-side token management required.
- **No i18n**: The KMC is an internal tool targeting a single operator audience.
  Internationalisation adds overhead without benefit here; all UI strings are in
  English.
- **No PWA**: Unlike the web frontend, the KMC is a desktop-first internal
  dashboard. No service worker, no offline support, no installability.
- **Redux for UI State, SWR for Server State**: Minimal client-side Redux
  state (currently only theme preference). Remote data is fetched and cached
  via SWR. The two concerns are kept strictly separate.
- **Strict Typing**: The project targets strict TypeScript throughout. Shared
  types live in `src/lib/types`, API response shapes are typed at the API
  client layer.
- **Barrel Exports per Module**: Each component group and library module
  exposes a clean public API via `index.ts`. Internal implementation details
  are not directly importable from outside.
- **Storybook for UI Development**: Components are developed and tested in
  isolation via Storybook, ensuring visual consistency across the dashboard
  independently of backend availability.
