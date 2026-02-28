# AGENTS.md

## Cursor Cloud specific instructions

**ngFeed** is a frontend-only Angular 21 social feed app. All backend services (Firebase Auth + Realtime Database) are remote with hardcoded config — no local backend setup required.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npx ng serve` (http://localhost:4200) |
| Tests | `npx ng test --watch=false` (Vitest, 36 tests) |
| Build | `npx ng build` |

### Notes

- The Angular CLI (`ng`) is not installed globally; use `npx ng` or `npm start` / `npm test`.
- The app UI is in Italian. Key routes: `/per-te` (feed), `/auth` (login/signup), `/cerca` (search), `/preferiti` (favorites).
- Firebase API key and database URL are hardcoded in services under `src/app/core/services/`. No `.env` file or secrets needed.
- No linter (ESLint) is configured in this project. Code style is managed via Prettier config in `package.json`.
- The dev server supports hot reload; no restart needed after code changes.
- Post creation requires a logged-in user with a completed profile (name + username).
