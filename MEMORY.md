# Project Memory

This repository uses a repo-local, date-based memory system for Codex.

## Read Order

Start with these files:

1. [Current Status](memory/status.md)
2. [Decisions](memory/decisions.md)
3. Latest dated entry in [Sessions](memory/sessions/)

## Memory Structure

- [memory/status.md](memory/status.md)
  Current operational snapshot: where work stopped, what is active now, and what should happen next.
- [memory/decisions.md](memory/decisions.md)
  Durable project decisions and rationale that should survive beyond a single session.
- [memory/sessions/](memory/sessions/)
  Canonical dated session history. Append new significant session entries by date.
- [memory/templates/session.md](memory/templates/session.md)
  Template for new session entries.

## Rules

- Session logs are the source of truth for dated history.
- `status.md` may be rewritten as the current snapshot changes.
- `decisions.md` should contain only long-lived decisions, not every small implementation note.
- Significant sessions should update memory before wrapping up.

## Latest Session

- [2026-03-31](memory/sessions/2026-03-31.md)
