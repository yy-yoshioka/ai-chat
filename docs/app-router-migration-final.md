# Master TODO — **Final Codebase Restructure**

> **Goal**  
> *Eliminate the mixed “pages Router + app Router” setup and move **everything** into the App Router (`app/`).*  
> This covers UI pages, API route handlers, components, hooks, libs, jobs, and types.  
> Baseline tree snapshot: 2025-06-22 (`pages/` + `app/(…)`).

## 1 . Public / Marketing — `(marketing)`

| Legacy path                      | New path                                                                  |
| -------------------------------- | ------------------------------------------------------------------------- |
| `/index.tsx`                     | `app/(marketing)/page.tsx`                                                |
| `/blog/index.tsx`                | `app/(marketing)/blog/page.tsx`                                           |
| `/blog/[slug].tsx`               | `app/(marketing)/blog/[slug]/page.tsx`                                    |
| `/faq/index.tsx`                 | `app/(marketing)/faq/page.tsx`                                            |
| `/help/index.tsx`                | _Delete_ (merged into FAQ)                                                |
| `/privacy.tsx`                   | `app/(marketing)/privacy/page.tsx`                                        |
| `/status.tsx` + `/status/rss.ts` | `app/(marketing)/status/page.tsx` + `app/(marketing)/status/rss/route.ts` |

- [ ] Move files above  
- [ ] Remove any client-side redirects in original pages  
- [ ] Update nav links in `Navigation.tsx`

---

## 2 . Auth Flow — `(auth)`

| Legacy path                    | New path                                      |
| ------------------------------ | --------------------------------------------- |
| `/login.tsx`                   | `app/(auth)/login/page.tsx`                   |
| `/signup.tsx`                  | `app/(auth)/signup/page.tsx`                  |
| `/logout.tsx`                  | `app/(auth)/logout/page.tsx`                  |
| `/onboarding/step-plan.tsx`    | `app/(auth)/onboarding/step-plan/page.tsx`    |
| `/onboarding/step-install.tsx` | `app/(auth)/onboarding/step-install/page.tsx` |

- [ ] Replace `router.push('/admin/dashboard')` with `/app/(org)/admin/${orgId}/dashboard`  
- [ ] Consolidate all auth guards into **`app/(auth)/layout.tsx`**

---

## 3 . Signed-in Personal Area — `(user)`

| Legacy path            | New path                              |
| ---------------------- | ------------------------------------- |
| `/profile.tsx`         | `app/(user)/profile/page.tsx`         |
| `/billing/cancel.tsx`  | `app/(user)/billing/cancel/page.tsx`  |
| `/billing/success.tsx` | `app/(user)/billing/success/page.tsx` |

- [ ] Create `app/(user)/layout.tsx` with `<AuthGuard>`  
- [ ] Update internal links (`<Link href=\"/profile\">` etc.)

---

## 4 . Organisation Admin — `(org)/admin/[orgId]`

All current `app/(org)/admin/[orgId]/**` files stay — just:

- [ ] Verify every sub-page exists (`dashboard`, `chats`, `settings/widgets` …)  
- [ ] Ensure **`layout.tsx`** fetches the org and provides context  
- [ ] Delete redundant copies in `pages/` (none should remain)

---

## 5 . Super Admin — `(super)/superadmin`

Already in place. To do:

- [ ] Migrate any missing sub-pages from `pages/` (none currently)  
- [ ] Add guard inside `app/(super)/superadmin/layout.tsx` (`role === 'super'`)

---

## 6 . API Routes → **Route Handlers**

1. Create `app/api/**` tree mirroring `pages/api/**`  
2. For each file:

   | Old (`pages/api`)            | New (`app/api`)                    | Notes                                        |
   | ---------------------------- | ---------------------------------- | -------------------------------------------- |
   | `beta-invite.ts`             | `beta-invite/route.ts`             | `POST` only → `export async function POST()` |
   | `billing/checkout.ts`        | `billing/checkout/route.ts`        | `POST`                                       |
   | `billing/webhook.ts`         | `billing/webhook/route.ts`         | `POST`, set `runtime = 'edge'` if needed     |
   | `chat/widget/[widgetKey].ts` | `chat/widget/[widgetKey]/route.ts` | Use `params.widgetKey`                       |
   | … (continue for all)         |

3. Delete `pages/api` directory when all handlers compile.

---

## 7 . Components / hooks / libs

### 7-A. Components

| Folder                                                               | Action |
| -------------------------------------------------------------------- | ------ |
| `components/Chat/*` → `app/(org)/admin/_components/chat/*`           |
| `components/Dashboard/*` → `app/(org)/admin/_components/dashboard/*` |
| `AdminLayout.tsx` → delete (handled by `(org)` layout)               |
| `AdminAuthGuard.tsx` → merge into `(org)/admin/[orgId]/layout.tsx`   |
| `AuthGuard.tsx` → move to `app/_components/AuthGuard.tsx`            |

### 7-B. hooks

| Legacy                   | New                           | Notes                    |
| ------------------------ | ----------------------------- | ------------------------ |
| `hooks/useAuth.ts`       | `app/_hooks/useAuth.ts`       | no change                |
| `hooks/useCurrentOrg.ts` | `app/_hooks/useCurrentOrg.ts` | returns org from context |

### 7-C. libs

| Legacy                   | New                               |
| ------------------------ | --------------------------------- |
| `lib/api.ts`             | `app/_lib/api.ts`                 |
| `lib/api-org.ts`         | `app/_lib/api-org.ts`             |
| `lib/withAuth.tsx`       | remove (replaced by layout guard) |
| `lib/email-templates.ts` | keep as is                        |

---



