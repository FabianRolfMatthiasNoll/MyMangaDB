# GitHub Issue Drafts

Paste-ready issue drafts for [MyMangaDB](https://github.com/FabianRolfMatthiasNoll/MyMangaDB).

Each file contains a **Title** and a **Body** — create the issue on GitHub, paste the body, done.

| # | File | Area | Depends on |
|---|------|------|-----------|
| 01 | [Wishlist / ownership state](01-wishlist-ownership-state.md) | Backend · Data model | — |
| 02 | [Dedicated wishlist tab](02-wishlist-tab-ui.md) | Frontend · UX | 01 |
| 03 | [Full-text search (SQLite FTS5)](03-full-text-search.md) | Backend · Search | — |
| 04 | [MangaDex source adapter](04-mangadex-source-adapter.md) | Backend · Integrations | — |
| 05 | [PWA / offline support](05-pwa-offline.md) | Frontend · Platform | — |
| 06 | [Collection value & spend tracking](06-collection-value-spend-tracking.md) | Backend + Frontend · Stats | 01 |

## Ordering suggestion

1. **01 → 02** together — the wishlist is one feature split across model and UI.
2. **03** is self-contained and delivers the most day-to-day value on a large collection.
3. **04** is self-contained; research is already done (see the issue body).
4. **05** is independent and can land whenever.
5. **06** builds on 01 — reuse the ownership state to know what has been bought.

> **Note:** these need a database migration layer (Alembic) before 01, 02 and 06 can ship.
> There is currently no `migrations/` directory — `Base.metadata.create_all()` is the only
> schema management, which means any column change requires dropping the database.
