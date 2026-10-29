# Company Creator contributor guide

## Project intent

Build a local, single-user panel that creates fictional German B2B AI company profiles and immutable static website versions. The canonical company profile is the only source of facts. Never introduce claims, people, customers, registrations, or product capabilities outside that profile.

## Working rules

- Keep identifiers and code comments in English; keep the product UI and primary documentation in Russian.
- Store all descriptive company content in both `ru` and `de`.
- Validate external and edited data with Zod at every persistence boundary.
- Keep API keys server-only. Never return, log, export, commit, or embed secrets in generated sites.
- Treat approved company data as mutable only through a revision: editing returns the profile to `draft`.
- Treat every site version as immutable. Render and export from its saved snapshot, never from the current company row.
- Generated companies and sites must clearly state that they are fictional project data.
- Generated sites must not contain forms, accounts, uploads, customer logos, testimonials, or unsupported product features. The local management panel may accept provider keys and employee photo uploads, as explicitly requested by the user.
- `ТЗ.txt` is local reference material and must remain ignored by Git.

## Commands

The supported environment is Docker because the host may not have Node.js installed.

```bash
docker compose up --build
docker compose run --rm backend-test npm test --workspace @company-creator/backend
docker compose run --rm backend-test npm run typecheck --workspace @company-creator/backend
docker compose run --rm backend-test npm run lint --workspace @company-creator/backend
docker compose run --rm frontend-test npm run typecheck --workspace @company-creator/frontend
docker compose run --rm frontend-test npm run lint --workspace @company-creator/frontend
docker compose run --rm --no-deps nginx nginx -t
```

For a host with Node.js 24+:

```bash
npm ci
npm run dev:backend
npm run dev:frontend
```

## Change discipline

- Work directly on `main` as requested, using atomic Conventional Commits.
- Run the checks relevant to a change before committing.
- Do not push without explicit user instruction.
- Preserve user changes and never rewrite unrelated history.
