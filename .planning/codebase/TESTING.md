# Testing Patterns

**Analysis Date:** 2026-03-18

## Test Framework

**Runner:**
- Not configured — no test framework installed or in use
- `package.json` has no jest, vitest, mocha, or other test runner

**Assertion Library:**
- None — not applicable

**Run Commands:**
```bash
npm run lint              # Only linting available (ESLint + Next.js)
npm run build             # Build validation
npm run dev               # Development with automatic migration
```

## Test File Organization

**Location:**
- No test files exist in the codebase
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in source directories
- Testing infrastructure not implemented

**Naming:**
- N/A — no established pattern

**Structure:**
- N/A — no test files present

## Test Strategy (Current State)

**Manual Testing Only:**
- Development server (`npm run dev`) used for manual feature verification
- Build validation (`npm run build`) ensures TypeScript compiles without errors
- Linting (`npm run lint`) checks code style

**Code Validation:**
- TypeScript strict mode provides compile-time type safety
- ESLint enforces code quality rules
- Next.js built-in checks (link validation, etc.)

## Mocking

**Framework:**
- None — not applicable

**Patterns:**
- N/A

**What Would Need Mocking (If Tests Added):**
- MediaPipe Vision API: `FilesetResolver`, `PoseLandmarker` — would require dependency injection or jest mocks
- Browser APIs: `navigator.mediaDevices.getUserMedia()`, `requestAnimationFrame`, `setInterval`
- Network calls: `fetch()` for API endpoints
- Supabase Auth: `createClient()`, `supabase.auth.getUser()`
- Prisma: `prisma.room.findUnique()`, `prisma.participant.create()`, etc.

## Test Types (Not Implemented)

**Unit Tests:**
- Would test: Utility functions (`generateCode()`, `checkRateLimit()`, `angleBetween()`, angle buffer filtering)
- Would test: Hook logic (`useRooms` state management, localStorage operations)
- Would test: Data validation (input length checks, email validation)

**Integration Tests:**
- Would test: API routes with realistic Prisma and Supabase calls
- Would test: Multi-step flows (create room → join room → save session)
- Would test: Database queries and constraints
- Would test: Middleware auth flow

**E2E Tests:**
- Not currently implemented
- Could use Playwright or Cypress for full user workflow testing
- Would cover: Room creation, joining, camera workout flow, leaderboard display

## Fixtures and Factories

**Test Data:**
- N/A — no test infrastructure

**Location:**
- N/A

**Patterns (If Implemented):**
- Would likely need factory functions for creating test rooms, participants, sessions
- Supabase test database (`eu-west-1`, accessed via `.env.test`) already available
- Prisma would support test data seeding via `prisma/seed.ts` (not currently created)

## Coverage

**Requirements:**
- None enforced — no coverage tracking tool configured

**Current State:**
- Manual testing only
- Code coverage metrics not tracked

**View Coverage:**
- Not available — would require Jest or Vitest configuration

## Testable Code Patterns (Existing)

**Pure Functions (Easily Testable):**

```typescript
// lib/emailRateLimit.ts — pure rate limiting logic
export function checkRateLimit(email: string): RateLimitResult {
  const now = Date.now()
  const key = email.toLowerCase().trim()
  const entry = store.get(key)
  // ... deterministic logic
  return { allowed, attemptsLeft, retryAfter }
}
```

**Hook Logic (Would Need Testing):**

```typescript
// hooks/useRooms.ts — complex state management
export function useRooms() {
  const [rooms, setRooms] = useState<SavedRoom[]>([])
  // ... localStorage + server hydration logic
  return { rooms, loaded, addRoom, removeRoom, clearRooms, getRoom, nextRoom }
}
```

**API Route Pattern (Would Need Mocking):**

```typescript
// app/api/rooms/route.ts — typical route structure
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // ... business logic
    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Component Patterns (Would Need React Testing Library):**

```typescript
// components/CameraWorkout.tsx — stateful component with refs
export default function CameraWorkout({ participantId, onSessionSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // ... many refs and state variables
  // Difficult to test without mocking browser APIs
}
```

## Validation Approach (Current)

**Build-Time Validation:**
- `npm run build` — ensures TypeScript strict compilation
- Catches type errors before deployment

**Lint-Time Validation:**
- `npm run lint` — enforces code quality rules
- Catches naming/style violations

**Runtime Validation:**
- API routes validate request body: `if (!name?.trim())`
- API routes validate field types and constraints
- Middleware protects routes with auth check

## Manual Testing Practices (Inferred)

**Development Workflow:**
1. Run `npm run dev` (starts dev server with Prisma migration)
2. Open browser to `http://localhost:3000`
3. Test features manually:
   - Create room → join room → workout session → verify leaderboard
   - Test theme toggle (light/dark)
   - Test camera permissions and MediaPipe loading
   - Test error cases (invalid room codes, network failures)
4. Test on mobile via PWA installation
5. Run `npm run lint` before committing

**Testing Environments:**
- Development: `npm run dev` with `.env` (test Supabase database)
- Production: Deployed to Render with Yandex Cloud PostgreSQL
- No staging environment noted

## Known Gaps (If Tests Were to be Added)

**Critical Test Candidates:**

| Component | Why Test | Difficulty |
|-----------|----------|-----------|
| MediaPipe angle calculation | Core business logic, non-obvious math | High (requires ML model, video stream mocking) |
| Rate limiting (`emailRateLimit.ts`) | Time-dependent logic with edge cases | Low (pure function) |
| Room creation with unique code generation | Database constraint handling | Medium (needs Prisma mock) |
| useRooms hook | Multi-source state (localStorage + API) | Medium (React Testing Library + API mocks) |
| Auth middleware | Access control, redirect logic | Medium (Next.js middleware testing) |
| API error handling | Proper error codes and messages | Medium (fetch mocking) |

**Missing Infrastructure:**
- No test runner configured
- No test database setup automation
- No CI test pipeline (GitHub Actions, etc.)
- No coverage reporting

---

*Testing analysis: 2026-03-18*

## Implementation Path (If Tests Are Needed)

To add testing:

1. **Install test dependencies:**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest
   npm install --save-dev @types/jest
   ```

2. **Create `jest.config.ts`:**
   ```typescript
   export default {
     preset: 'ts-jest',
     testEnvironment: 'jsdom',
     roots: ['<rootDir>'],
     testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
     moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
   }
   ```

3. **Organize tests:**
   - Utility tests: `lib/emailRateLimit.test.ts`
   - Hook tests: `hooks/useRooms.test.ts`
   - Component tests: `components/CameraWorkout.test.tsx` (complex, would need mocks)
   - API tests: `app/api/rooms/route.test.ts` (would need Prisma mock)

4. **Create test database helpers:**
   - Use `.env.test` Supabase instance
   - Create `prisma/seed-test.ts` for test data setup

5. **Update `npm run test` in package.json:**
   ```json
   "test": "jest",
   "test:watch": "jest --watch",
   "test:coverage": "jest --coverage"
   ```
