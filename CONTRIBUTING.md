# Contributing to MyMangaDB

## Development Setup

### Prerequisites

- **Python 3.12+** (backend)
- **Node.js 20+** (frontend)
- **Git**
- **Task** (task runner) — [Installation guide](https://taskfile.dev/#installation)

### Initial Setup

```bash
# 1. Clone the repository
git clone <your-fork-url>
cd MyMangaDB

# 2. Install all dependencies and generate .env files
task setup

# 3. Start development servers
task dev
```

This starts both backend (http://localhost:8000) and frontend (http://localhost:5173).

### Available Task Commands

| Command                      | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `task setup`                 | Install all deps, generate .env files, install git hooks |
| `task dev`                   | Run backend + frontend in parallel                       |
| `task backend:run`           | Run backend only                                         |
| `task frontend:run`          | Run frontend only                                        |
| `task backend:test`          | Run backend tests                                        |
| `task lint`                  | Run all linters (pre-commit)                             |
| `task frontend:generate-api` | Regenerate TypeScript API client from backend            |
| `task clean`                 | Remove venv, node_modules, build artifacts               |

## Git Hooks (Pre-commit)

Hooks are installed automatically by `task setup` (runs `pre-commit install`).

If hooks weren't installed, manually set up:

```bash
task git:hooks
```

Or directly:

```bash
backend/.venv/bin/pre-commit install
```

## Regenerating the API Client

If you modify backend schemas or API endpoints, regenerate the frontend TypeScript client:

```bash
task frontend:generate-api
```

This starts the backend briefly, fetches the OpenAPI spec, and generates typescript-fetch client code into `frontend/src/api/`.

## Coding Conventions

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, deps, build changes
- `docs:` — documentation only
- `refactor:` — code refactoring
