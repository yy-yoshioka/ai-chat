# Org Admin UI – **Gap-Closure TODO**

> **Goal** – Bring the current codebase up to the "ideal" Org-Admin feature set  
> (Widget management, granular roles, custom dashboard, billing usage, clean Super vs Org split).

---

## 0. Preparation
- [x] Create branch **`feature/org-admin-upgrade`**
- [x] `yarn test && yarn lint` ⇒ baseline green
- [ ] Snapshot production DB / Firestore (`orgs`, `users`, `widgets`, `plans`)
- [ ] Enable ESLint **boundaries** zones (`(org)` ↔ `(super)` import guarding)

---

## 1. Route / Guard Separation
- [x] Move any **SuperAdmin** pages still inside `(org)/admin` ➜ `(super)/superadmin`
- [x] Replace `AdminAuthGuard` with `<OrgAdminGuard>` everywhere under `(org)/admin`
- [x] Middleware:  
  - `/admin` ➜ org-resolve redirect  
  - `/superadmin` ➜ role = `super_admin` or 302 `/login`

---

## 2. **Widget Management** Module
- [x] Pages  
  - `app/(org)/admin/[orgId]/widgets/page.tsx` (list)  
  - `.../widgets/create/page.tsx`  
  - `.../widgets/[widgetId]/page.tsx` (design / script tab)
- [ ] API handlers  
  - `GET /api/org/{orgId}/widgets`  
  - `POST`, `PUT`, `DELETE` endpoints
- [x] Form components: color picker, logo upload, preview iframe
- [x] Issue embed snippet `<script src="...widget.js" data-key="…">`

---

## 3. Settings Restructure
- [x] Convert current `SettingsPage` into **tabbed layout** with routes:  
  - **Branding** `/settings/branding`  
  - **Members** `/settings/members` (reuse Users UI)  
  - **Widgets** `/settings/widgets` (link to module)  
  - **API / Webhooks** `/settings/api`  
  - **Notifications** `/settings/notifications`  
  - **Security** `/settings/security`
- [x] Sidebar links update
- [x] Move duplicate logic out of old SettingsCard component

---

## 4. Role & Permission Expansion
- [x] Extend `User.role` enum ➜ `roles: Role[]`  
  ```ts
  export type Role = 'owner' | 'org_admin' | 'editor' | 'viewer';
  ```
- [ ] Migration script: `admin` ⇒ `org_admin`
- [x] `useAuth` – add helpers `hasRole('editor')` etc.
- [ ] Update Users UI invite modal to pick role
- [x] Page-level guards:  
  - Widgets edit → `editor | org_admin | owner`  
  - Members → `org_admin | owner`

---

## 5. Billing & Usage UI
- [x] New route `billing/page.tsx` under `(org)/admin/[orgId]`
- [x] Tabs: **Plan**, **Usage**, **Invoices**
- [x] Stripe portal link (if plan = paid)
- [x] Usage chart (API calls, messages, MAU) via `/api/org/{id}/usage?range=30d`

---

## 6. Customisable Dashboard
- [x] Replace static 4 StatCards with **widget grid** (react-grid-layout)
- [x] "Add KPI" modal (pick: Users, Chats, CSAT, Token usage…)
- [x] Persist layout JSON in `org.settings.dashboard`
- [x] Real-time data via SWR polling (≥30 s)

---

## 7. Navigation & UX
- [x] `Navigation.tsx` – render menu items based on `permissions`
- [x] Breadcrumbs with org name
- [x] Org switcher dropdown in top bar → uses `useCurrentOrg.switchOrg`

---

## 8. Back-end / API Adjustments
- [ ] `widgets` table / collection (id, orgId, name, theme, script, createdAt)
- [x] Add `role` claims to JWT on login
- [x] `/api/me` returns `roles`, `orgPermissions`
- [x] Ensure all org-scoped endpoints validate `orgId === jwt.org_id`

---

