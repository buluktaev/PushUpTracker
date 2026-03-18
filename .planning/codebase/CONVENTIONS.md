# Coding Conventions

**Analysis Date:** 2026-03-18

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension
  - Example: `CameraWorkout.tsx`, `ThemeToggle.tsx`, `Icon.tsx`
- Hooks: `use` prefix with camelCase, `.ts` extension
  - Example: `useRooms.ts`
- API routes: kebab-case directories with `route.ts` filename
  - Example: `app/api/rooms/[code]/join/route.ts`
- Utility/lib files: camelCase with `.ts` extension
  - Example: `emailRateLimit.ts`, `verify-password.ts`

**Functions:**
- camelCase naming
- Action verbs for functions: `generateCode()`, `checkRateLimit()`, `ensureProfile()`
- Private/internal functions prefixed with underscore not used; rely on file module scope
- API route handlers: named exports (`GET`, `POST`, `PUT`, `DELETE`)

**Variables:**
- camelCase for all variables and constants
- Constants use UPPER_CASE with `const`: `WINDOW_MS`, `MAX_ATTEMPTS`
- State hooks: descriptive names following React conventions
  - Example: `[count, setCount]`, `[cameraOn, setCameraOn]`, `[holding, setHolding]`
- Ref names: suffixed with `Ref`
  - Example: `videoRef`, `canvasRef`, `streamRef`, `landmarkerRef`, `angleBufferRef`

**Types:**
- Interfaces: PascalCase, used for React component props
  - Example: `interface Props { name: string; size?: number }`
- Type aliases: PascalCase
  - Example: `type AnyObj = any` (note: used pragmatically for complex MediaPipe objects)
- TypeScript strict mode enabled in `tsconfig.json`

**localStorage Keys:**
- snake_case with `pushup_` prefix
  - Example: `pushup_rooms`

**CSS Variables:**
- kebab-case with `--` prefix
  - Example: `--bg`, `--surface`, `--surface-dim`, `--border`, `--text`, `--muted`, `--accent-default`

**Git Branches:**
- kebab-case with type prefix
  - Example: `feature/phase1-auth`, `fix/join-upsert`, `refactor/variant-a`

## Code Style

**Formatting:**
- Tool: ESLint (Next.js config)
- Config: `.eslintrc.json` extends `next/core-web-vitals`
- No Prettier config — relies on Next.js ESLint rules

**Linting:**
- Tool: ESLint with Next.js preset
- Run: `npm run lint`
- Enforces strict TypeScript (`strict: true` in `tsconfig.json`)

**TypeScript Configuration:**
- `strict: true` — all strict options enabled
- `moduleResolution: bundler`
- `jsx: preserve` — Next.js handles JSX compilation
- Path alias: `@/*` maps to project root

## Import Organization

**Order:**
1. React and external packages (e.g., `import { useRef } from 'react'`)
2. Next.js utilities (e.g., `import { NextResponse } from 'next/server'`)
3. Third-party libraries (e.g., `import NumberFlow from '@number-flow/react'`)
4. Local imports using `@/` alias (e.g., `import { prisma } from '@/lib/prisma'`)
5. Type imports kept with standard imports (not separated)

**Path Aliases:**
- `@/*` resolves to project root
- Used consistently: `@/lib/prisma`, `@/components/Icon`, `@/hooks/useRooms`

**Named Exports:**
- Prisma client exported as named: `export const prisma`
- Avoid default exports except for Next.js page/layout components

## Error Handling

**Patterns:**
- Try-catch blocks in async functions (API routes, async effects)
- API routes catch all errors and return `NextResponse.json({ error: 'Server error' }, { status: 500 })`
- Client-side: error logged to console, user shown error message from response
  - Example: `setError(e instanceof Error ? e.message : 'ошибка')`
- Validation before operations: check request body properties, validate lengths
  - Example: `if (!name?.trim())`, `if (name.trim().length > 64)`
- Database operations wrapped in try-catch; 404 responses for missing records

**Console Usage:**
- `console.error(err)` for exceptions in production-facing code
- No debug logging (console.log not used for tracing)

## Logging

**Framework:** None — using native `console.error()`

**Patterns:**
- API route errors logged with full error object: `console.error(err)`
- Component errors logged before returning fallback: `console.error('MediaPipe load failed:', e)`
- Status messages in UI (in CameraWorkout): status object with text and color
  - Example: `setStatus({ text: 'searching...', color: '#f59e0b' })`

## Comments

**When to Comment:**
- Clarify non-obvious algorithm logic (MediaPipe angle calculations, anti-cheat body tilt check)
- Explain business logic and constraints
- Mark important implementation details (e.g., "Anti-cheat: determine body tilt")

**JSDoc/TSDoc:**
- Not consistently used; function signatures are self-documenting
- Interface properties sometimes documented inline as comments
  - Example in `useRooms.ts`: `name: string  // имя пользователя в этой комнате`

**Comment Style:**
- Single-line comments with `//` for code explanations
- Multi-line comments for section headers
- Russian language for domain comments (reflecting codebase language)

## Function Design

**Size:**
- Functions generally 10-50 lines
- Longer components like `CameraWorkout.tsx` (484 lines) are acceptable for UI-heavy components due to React state management
- Utility functions kept short (5-20 lines)

**Parameters:**
- Destructuring used for component props: `function CameraWorkout({ participantId, onSessionSaved }: Props)`
- API route handlers use destructuring for params: `{ params }: { params: Promise<{ code: string }> }`
- Optional parameters marked with `?` in TypeScript

**Return Values:**
- React components return JSX
- Hook functions return object with named exports: `return { rooms, loaded, addRoom, removeRoom, clearRooms, getRoom, nextRoom }`
- Utility functions return typed objects: `return { allowed, attemptsLeft, retryAfter }`
- API endpoints return `NextResponse.json()` with appropriate status codes

**Async/Await:**
- Used consistently in async functions
- Error handling with try-catch
- `void` prefix for fire-and-forget promises: `void hydrateFromServer()`

## Module Design

**Exports:**
- Named exports preferred throughout
- Default export used only for Next.js pages, layouts, and some components
- One component per file (CameraWorkout, ThemeToggle, Icon)

**Barrel Files:**
- Not used; imports specify exact file paths
- Example: `import { prisma } from '@/lib/prisma'` not `import { prisma } from '@/lib'`

**Module Scope:**
- Utility functions defined at module level as helpers
- Ref variables with Module.exports pattern for singleton Prisma client
  - Example: `const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }`

## React Patterns

**Hooks:**
- `useState` for local component state
- `useEffect` for side effects and cleanup
- `useRef` for stable references (video, canvas, MediaPipe instances)
- `useCallback` for memoized callbacks passed to child components or used in effects

**Cleanup:**
- useEffect always includes cleanup function for refs and timers
  - Example: `return () => { stopCamera(); if (timerRef.current) clearInterval(timerRef.current); }`
- Resource management: streams stopped, frames cancelled, intervals cleared

**Props:**
- TypeScript interfaces for component props
- Optional props marked with `?`
- Props destructured in function signature

## Special Patterns

**MediaPipe Integration:**
- Complex type handling with `type AnyObj = any` for flexibility
- Ref pattern for ML model instances: `landmarkerRef`, `drawingRef`
- Frame loop with `requestAnimationFrame` and abort mechanisms
- Angle calculations for pose detection

**Prisma:**
- Named export: `export const prisma`
- Import pattern: `import { prisma } from '@/lib/prisma'`
- Query patterns: `findUnique()`, `findFirst()`, `findMany()`, `create()`, `delete()`
- Include relations: `include: { room: true }`

**Supabase Auth:**
- Server-side client creation in middleware and API routes: `const supabase = await createClient()`
- User extraction: `const { data: { user } } = await supabase.auth.getUser()`
- Middleware protection for routes

**Theme Management:**
- CSS variables defined in `globals.css`
- Light theme in `:root`, dark theme in `.dark` class
- Theme toggle updates `html` element class

---

*Convention analysis: 2026-03-18*
