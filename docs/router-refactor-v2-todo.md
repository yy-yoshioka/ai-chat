# Router Refactor v2 — **"Only `/admin/{orgId}/…` after sign‑in"**

## 0 . Preparation

* [x] Create branch **`feature/routing-v2`**
* [x] `yarn test && yarn lint` ensure green baseline
* [x] Confirm *defaultOrgId* resolution logic (used by middleware)

---

## 1 . Remove /chat & /widgets top‑level pages

| Action            | Details                                           | Done                             |
| ----------------- | ------------------------------------------------- | -------------------------------- |
| **Delete files**  | `app/chat/**`  **or**  `pages/chat*.tsx`          | [x]                              |
|                   | `app/widgets/**` **or** `pages/widgets*.tsx`      | [x]                              |
| **Purge imports** | `git grep -nE "/chat                              | /widgets"` and remove references | [x] |
| **Redirects**     | Add legacy → new 301 in `next.config.js` (see §3) | [x]                              |

---

## 2 . Define the *only* valid post‑login tree

```
app/
└── admin/
    └── [orgId]/
        ├── layout.tsx              # shared sidebar / header
        ├── dashboard/page.tsx
        ├── chats/page.tsx          # ← was /chat
        ├── settings/               # ← widgets absorbed here
        │   ├── page.tsx
        │   └── widgets/page.tsx    # widget theme & embed code
        ├── faq/…
        ├── users/page.tsx
        ├── reports/page.tsx
        ├── logs/page.tsx
        └── billing-plans/page.tsx
```

| Task                                                                                                             | Details                         | Done |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---- |
| **Move `/chat` → `/admin/[orgId]/chats/page.tsx`**                                                               | reuse component, update imports | [x]  |
| **Create `settings/widgets/page.tsx`**                                                                           | merge previous widgets logic    | [x]  |
| **Ensure `layout.tsx` sidebar contains links**:<br>`Dashboard • Chats • FAQ • Users • Reports • Logs • Settings` |                                 | [x]  |

---

## 3 . Middleware & Redirects

### middleware.ts

* [x] If path starts with **`/admin`** **and** lacks orgId → redirect to `defaultOrgId`
* [x] Any request to removed paths (`/chat`, `/widgets`) → 301 → `/admin/{orgId}/chats` or `/admin/{orgId}/settings/widgets`

### next.config.js

```js
redirects: async () => [
  { source: '/chat',         destination: '/admin/default/chats',          permanent: true },
  { source: '/widgets',      destination: '/admin/default/settings/widgets', permanent: true },
  { source: '/admin',        destination: '/admin/default/dashboard',      permanent: false }
]
```

* [x] Replace `default` with server‑resolved org in middleware at runtime

---

## 4 . Internal links & API calls

| Item                       | Action                                                                  | Done |
| -------------------------- | ----------------------------------------------------------------------- | ---- |
| `<Link>` / `router.push()` | replace any **hard‑coded `/chat` or `/widgets`** paths                  | [x]  |
| Sidebar config             | update to new URLs                                                      | [x]  |
| API client                 | ensure widget endpoints now live under `/organizations/{orgId}/widgets` | [x]  |

---

## 5 . Clean‑up legacy directories

| Command                                | Purpose                             | Run? |
| -------------------------------------- | ----------------------------------- | ---- |
| `git rm -r pages/admin`                | remove duplicate Pages‑Router admin | [x]  |
| `git rm -r pages/chat* pages/widgets*` | purge obsolete pages                | [x]  |

---

## 7 . Documentation

* [x] Update **`README.md`** (post‑login URL examples)
* [x] Commit this file → `docs/router-refactor-v2-todo.md`
* [x] Amend **CHANGELOG**

---

### ✅ Completion Criteria

1. ✅ No route outside `/admin/{orgId}/…` is reachable after sign‑in.
2. ✅ Legacy `/chat`, `/widgets`, `/admin` root all redirect correctly.
3. ✅ Old files & links are entirely removed; linter & tests pass.

**All tasks completed successfully!** 🎉

The Router Refactor v2 is now complete. All chat and widget functionality has been moved to organization-aware URLs within the `/admin/{orgId}/...` structure.
