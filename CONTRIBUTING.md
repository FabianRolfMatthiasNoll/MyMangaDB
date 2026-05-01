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

## Translations

MyMangaDB supports multiple languages via [react-i18next](https://react.i18next.com/).

### Adding a New Language

1. **Copy the English translation file** as a template:

```bash
cp frontend/src/locales/en.json frontend/src/locales/<lang>.json
```

2. **Translate all values** (keys must stay unchanged). For example:

```json
// en.json
"nav": { "dashboard": "Dashboard" }

// your-new-file.json
"nav": { "dashboard": "Übersicht" }
```

3. **Register the new language** in `frontend/src/i18n.ts`:

```typescript
import <lang> from './locales/<lang>.json';

const resources = {
  en: { translation: en },
  de: { translation: de },
  <lang>: { translation: <lang> },  // Add this line
};
```

4. **Add to `supportedLngs`**:

```typescript
supportedLngs: ['en', 'de', '<lang>'],
```

5. **Add the language to the selector** in `frontend/src/components/Header.tsx`:

```tsx
<MenuItem
  onClick={() => handleLanguageChange("<lang>")}
  selected={i18n.language === "<lang>"}
>
  {t("language.<langKey>")}
</MenuItem>
```

Also add a translation key `language.<langKey>` in your locale file (e.g., `"language.es": "Español"`).

### Translation Keys Structure

Keys are organized by feature area:

| Namespace                                          | Purpose                            |
| -------------------------------------------------- | ---------------------------------- |
| `nav.*`                                            | Navigation items                   |
| `common.*`                                         | Reusable UI elements               |
| `manga.*`                                          | Manga-related strings              |
| `volume.*`                                         | Volume management                  |
| `errors.*`                                         | Error messages                     |
| `auth.*`                                           | Login page                         |
| `settings.*`                                       | Settings page                      |
| `lists.*`, `authors.*`, `genres.*`, `statistics.*` | List/author/genre/statistics pages |
| `language.*`                                       | Language selector                  |

Use `{{variable}}` for interpolation (e.g., `{{count}} manga(s)`).

## Coding Conventions

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, deps, build changes
- `docs:` — documentation only
- `refactor:` — code refactoring
