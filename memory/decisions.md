# Decisions

## 2026-03-31 — Repo-local memory is the canonical Codex memory

- Memory for this project lives in repository files, not only in agent-local home directories.
- Rationale: the team needs a durable, reviewable, git-versioned history that can be reopened at any time.

## 2026-03-31 — Session logs are the canonical dated history

- The canonical historical record is `memory/sessions/YYYY-MM-DD.md`.
- Rationale: the main request is to preserve what was done by date, not just a rolling summary.

## 2026-03-31 — Significant sessions update memory, not every short exchange

- Memory should be updated at the end of significant implementation/debugging/design sessions.
- Rationale: this keeps history useful and searchable without flooding it with low-value noise.

## 2026-03-31 — `/components` is the primary redesign review surface

- During redesign sync work, primitives and components should be reviewed first on `/components`.
- Rationale: one stable review surface reduces context-switching and makes parity checks faster.

## 2026-03-31 — Never run `build` alongside `next dev` in the same worktree

- `npm run build` and `next dev` must not run concurrently in the same worktree.
- Rationale: both write to `.next` and can corrupt the dev chunk graph, leading to failures like `Cannot find module './682.js'`.

## 2026-03-31 — Screen redesign proceeds one screen at a time

- After components/tokens are fixed, redesign implementation should move screen-by-screen rather than taking an entire flow in one batch.
- For each screen, implementation closes `light/dark` and `desktop web/mobile PWA` together before moving to the next screen.
- Rationale: this matches the current preview architecture, keeps review slices small, and makes component gaps obvious before they spread across multiple screens.

## 2026-03-31 — Screen review gets its own dedicated surface

- Built screens should be reviewed on a dedicated `/screens` page with a theme toggle, similar to `/components`.
- `app/design-preview/page.tsx` remains as the fuller catalog/reference surface, but `/screens` is the primary review page during screen work.
- Rationale: one focused screen review surface reduces scanning noise and matches the component-review workflow already established on `/components`.

## 2026-03-31 — Registration desktop form starts 200px from the top edge

- For the registration screen family, the desktop/web form block is anchored `200px` from the top edge of the viewport.
- Rationale: this is a reviewed Figma layout rule for the empty registration screen and should stay stable across later registration states.

## 2026-03-31 — `/screens` contains production-shaped screens, not decorative mocks

- Screen code built on `/screens` should be transferable into real product routes without redoing the layout from scratch.
- Rationale: `/screens` is the review and stabilization surface for future production screens, not a parallel throwaway implementation.

## 2026-03-31 — Registration mobile geometry is also fixed

- For the registration email/password step on mobile:
  - form block starts `144px` from the top edge
  - form width is `327px`
  - legal block sits `56px` from the bottom edge
- Rationale: these values were reviewed against Figma and should remain stable across registration screen states.

## 2026-03-31 — Registration welcome screen is post-confirmation, not flow entry

- The registration `Welcome` screen should appear after email confirmation, not as the first screen of the registration flow.
- Rationale: the reviewed Figma flow places it after confirmation, so `/screens` must preserve that product sequence.

## 2026-03-31 — Registration flow includes explicit email-confirmation screens

- The registration flow is not complete after submit/loading.
- It must include:
  - waiting-for-email confirmation screen with cooldown
  - resend-available confirmation screen
  - attempts-exceeded confirmation screen
  - confirmation-in-progress screen after clicking the email link
  - confirmation-error screen for invalid/expired/used links
- Rationale: these are part of the reviewed registration flow and must be visible on `/screens`, not implied or skipped.

## 2026-03-31 — Real registration flow must mirror the reviewed sequence

- The actual application routes should follow the same reviewed sequence as `/screens`:
  - `/register`
  - `/verify-email`
  - `/auth/confirm`
  - `/welcome`
  - `/register/name`
- In particular, successful email confirmation routes to `/welcome`, not directly to `/`.
- Rationale: `/screens` is a production-shaped surface, so the agreed flow order must be reflected in the real routes rather than living only in preview components.

## 2026-03-31 — Registration flow should fail closed on localized copy, not raw provider messages

- For `auth/confirm`, provider error text from Supabase must not leak into the UI.
- The route should always render the reviewed Russian copy for invalid/expired/used links.
- Rationale: the confirmation screen is part of the product flow and must stay consistent with the approved design language.

## 2026-03-31 — Registration-family screens use `bg-surface` at page level

- The page background for registration, verify-email, confirm, welcome, and register-name routes should be `bg-surface`.
- Inner confirmation mail card uses `bg-primary`.
- Rationale: this matches the reviewed token contract and avoids body/page contrast mismatches from the legacy dark landing background.

## 2026-03-31 — Current worktree test Supabase env is not trustworthy

- The worktree `.env` / `.env.test` currently point to `jttxbcqcqulxkcrgqhyx.supabase.co`, which does not resolve by DNS.
- For live flow verification, dev was temporarily run against the root repo `.env`, whose Supabase host resolves and accepts auth requests.
- Rationale: current registration failures with `Failed to fetch` were caused by a dead auth endpoint in test env, not by the redesigned registration code.

## 2026-03-31 — Pre-auth screens follow only the system theme

- Before authentication, theme selection is not user-controlled inside the product flow.
- The following routes must follow system theme directly and ignore local theme override:
  - `/login`
  - `/register`
  - `/verify-email`
  - `/auth/confirm`
  - `/welcome`
  - `/register/name`
- Rationale: until the user is inside the system, manual theme switching is not part of the auth flow UX and should not interfere with system-theme parity.

## 2026-03-31 — App Router transitions get a real loading screen

- Intermediate transitions between auth-flow screens should use a real route-level loading screen, not only button spinners or preview-only mocks.
- The shared loading implementation is production code and is also mirrored on `/screens` for review.
- Rationale: loading between screens is part of the user experience, so it must exist in the live routes and not only in the screen catalog.

## 2026-03-31 — Post-auth room flow uses the same production-first rollout model

- The create-room redesign must be rolled out first on the real `/` route, then mirrored on `/screens`.
- Shared screen components should drive both the production route and the screen preview states so the redesign does not fork into separate implementations.
- Existing API contracts remain the source of truth:
  - create room -> `POST /api/rooms`
  - join room -> `POST /api/rooms/[code]/join`
  - created room redirect -> `/room/[code]?created=1&name=...`
- Rationale: post-auth flow work should follow the same discipline as auth work, where `/screens` is for QA and the real route stays canonical.

## 2026-03-31 — PushUpTracker redesign work should follow a dedicated project skill

- A project-specific Codex skill now exists at `/Users/buluktaev/.codex/skills/pushuptracker-redesign-workflow/SKILL.md`.
- It captures:
  - source-of-truth file locations
  - component and icon reuse rules
  - production-first route rollout
  - `/components` and `/screens` responsibilities
  - registration flow order and token rules
- Rationale: these rules are too project-specific and too easy to drift on if they live only in chat history.

## 2026-04-01 — Live verification in this worktree must not use a mixed auth/database env

- When validating the redesigned live flow in `feature/phase2-redesign-sync`, the running `next dev` process must use the worktree env files directly.
- Do not run auth from root `.env` while overriding only `DATABASE_URL` from `.env.test`.
- Rationale: mixed env startup caused auth to write into one backend while Prisma routes pointed at another database, which made room creation and registration debugging misleading.

## 2026-04-01 — Loading states in auth/create/join flows must hard-disable all interactive controls

- While a request is in flight, the UI must disable every control that can mutate state or navigate away:
  - inputs
  - submit buttons
  - back buttons
  - inline navigation links and text buttons
- Loading state should not be dropped back to idle on successful navigation paths before the next route takes over.
- Rationale: if controls re-enable before navigation completes, users can type extra characters, go back, or trigger conflicting actions during the transition gap.

## 2026-04-01 — Post-auth room entry on `/` branches by room count

- After authentication, the root route `/` now branches by available joined-room count:
  - `0 rooms` -> render the empty post-auth action screen from Figma
  - `1 room` -> redirect directly into that room
  - `2+ rooms` -> render the returning-room list screen
  - `2+ rooms` with `?add=1` -> render the compact `Новая комната` chooser
- The zero-room branch uses immediate action-card transitions instead of a separate `Продолжить` button.
- Rationale: this matches the reviewed Figma flow and removes the old generic landing behavior that did not respect the user's current room state.

## 2026-04-01 — Logout must clear Supabase auth on the server, not only in the browser

- Room logout now goes through `POST /api/auth/logout`, which calls `supabase.auth.signOut()` via the server client.
- Client-only `supabase.auth.signOut()` is not sufficient for this app because middleware can still observe stale auth cookies during the redirect to `/login` and bounce the user back to `/`.
- After logout, navigation to `/login` should be a hard browser redirect (`window.location.replace('/login')`), not only an App Router transition, because cached post-auth `/` payloads can still render briefly on the client after the session is gone.
- Rationale: server-side cookie clearing makes logout deterministic with middleware-protected routes.

## 2026-04-02 — `h1 + caption/body` is one visual group across auth/onboarding flows

- On auth/onboarding and create/join screens, `h1` and its supporting caption/body must be wrapped in one internal container.
- Outer layout `gap-2` is allowed only between major blocks (brand row, heading group, form group, button group, etc.), not between `h1` and its caption/body.
- Caption/body spacing inside the heading group should come from internal padding like `pt-2` and, where needed, `pb-[2px]`.
- Rationale: this preserves the reviewed Figma geometry and prevents accidental extra `8px` between title and supporting copy.

## 2026-04-02 — `ChoiceCard` and `SelectCard` have distinct but live interaction contracts

- `ChoiceCard` must expose a live `hovered` state in product screens without requiring manual state props from the parent.
- `SelectCard` also exposes a live `hovered` state in product screens, matching the reviewed Figma slice.
- The components are still not behaviorally identical:
  - `ChoiceCard`: `default`, `hovered`, `selected` with a synchronized `RadioButton`
  - `SelectCard`: `default`, `hovered`, `selected` with accent border on hover/select and accent icons only in `selected`
- Rationale: both cards are interactive, but their right-side affordances and selected-state treatment are different and must not be merged into one generic card contract.

## 2026-04-02 — Text polish is split into two global rules: crisp rendering and wrap quality

- `make text crispy` is handled globally in `app/globals.css` via:
  - `-webkit-font-smoothing: antialiased`
  - `-moz-osx-font-smoothing: grayscale`
  - `text-rendering: optimizeLegibility`
- Text wrapping is treated as a separate global layer:
  - headings (`h1`-`h4`) use `text-wrap: balance`
  - body-like text (`p`, `li`, `figcaption`, `blockquote`) uses `text-wrap: pretty`
- Rationale: crisp rendering and wrap quality solve different typography problems and should not be conflated or reimplemented ad hoc per component.

## 2026-04-02 — Form enter motion uses semantic section reveal, not whole-container animation

- Auth and create/join screens should animate by semantic chunks:
  - brand row
  - heading group
  - field group
  - action group
- Do not animate one full form container as a single block.
- The reusable `RevealSection` wrapper applies a small staggered enter using CSS only, without adding a motion dependency.
- Rationale: section-based stagger preserves the reviewed geometry while making transitions feel lighter and more legible than animating the whole panel.

## 2026-04-02 — Password visibility toggle uses contextual icon transition, not instant icon swap

- The password toggle inside `Input` keeps both eye icons mounted in the DOM.
- The visible state is animated via CSS only, using:
  - `opacity`
  - `transform: scale(...)`
  - `filter: blur(...)`
- The transition values follow the reviewed micro-interaction pattern:

## 2026-04-02 — Room workout tab is discipline-driven, not a static `Тренировка` label

- On `/room/[code]`, the workout tab should display the current room discipline:
  - discipline icon
  - short discipline label suitable for the mobile tabbar
- The discipline label should no longer appear next to the room name in the header.
- The same room-tab metadata contract must be reused by the real route and the room preview surface.
- Unknown disciplines fall back to:
  - label `Тренировка`
  - icon `fitness_center`
- Rationale: the lost discipline context is better restored through the workout tab itself, which stays visible in both desktop and mobile navigation and aligns better with the reviewed room-screen Figma.
  - inactive icon: `scale(0.25)`, `opacity: 0`, `blur(4px)`
  - active icon: `scale(1)`, `opacity: 1`, `blur(0)`
- No motion library is required for this interaction.
- Rationale: contextual icon transitions feel noticeably better than abrupt icon replacement and do not change the field’s behavior or accessibility contract.

## 2026-04-02 — Product web/mobile split is now app-specific at `1024px`

- The app now uses explicit product breakpoints instead of relying on mixed default Tailwind thresholds:
  - `app-mobile` -> `max-width: 1023px`
  - `app-web` -> `min-width: 1024px`
- Product routes and their parity previews should use these app-specific breakpoints instead of:
  - `sm:` for switching room desktop/mobile layouts
  - `max-md:` for auth/create/join mobile fallbacks
- This contract is intended for the product UI:
  - auth/onboarding
  - create/join flow
  - room screens
  - design-preview parity surfaces for those screens
- Review/docs pages may continue using default Tailwind `md/lg/xl` breakpoints where that better serves internal inspection layouts.
- Rationale: the product should not have a mixed `640 / 768 / 1024` responsive split. Everything below `1024px` is treated as mobile/PWA; `1024px` and above is web.
