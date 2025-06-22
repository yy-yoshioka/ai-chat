# Org Admin UI – **Remaining TODO**  
> *Scope: gap-closure items still **not shipped** as of 2025-06-22.*

---

## 0. House-Keeping
- [ ] Re-base branch **`feature/org-admin-upgrade`** with `develop`
- [ ] `yarn test && yarn lint` → baseline ✅
- [ ] Create DB/Firestore backup before running migrations

---

## 1. Role & Permission Expansion
- [ ] Extend schema → **`roles: Role[]`** (`owner | org_admin | editor | viewer`)
- [ ] Data-migration: convert legacy `admin → org_admin`
- [ ] `useAuth` helpers `hasRole('editor')`, `hasPermission('widget:edit')`
- [ ] Update **Invite Modal** & **UsersTable** to select / display new roles
- [ ] `<PermissionGate>` HOC to wrap page components
- [ ] Unit-tests for role helpers

---

## 2. Widget Management – API Integration
- [ ] REST handlers:  
  - `GET /api/org/:orgId/widgets`  
  - `POST /api/org/:orgId/widgets`  
  - `PUT /api/org/:orgId/widgets/:id`  
  - `DELETE /api/org/:orgId/widgets/:id`
- [ ] Connect UI forms to above endpoints (optimistic SWR)
- [ ] Embed-code generator (`<script … data-key>`), copy-to-clipboard
- [ ] “Enabled” toggle → PATCH endpoint + real-time badge update
- [ ] Playwright flow: create → edit → delete widget

---

## 3. Billing & Usage
- [ ] Stripe **customer portal** session → `/billing` “Change Plan” button
- [ ] Usage API `/api/org/:id/usage?range=30d`
- [ ] Charts: messages, MAU, token usage (SWR polling)
- [ ] Invoices table (download PDF)
- [ ] Playwright test: open portal link (mock)

---

## 4. Customisable Dashboard (persist)
- [ ] Persist grid layout JSON → `org.settings.dashboard`
- [ ] “Add KPI” modal – allow KPI type & interval selection
- [ ] SWR polling every **30 s** (abort when tab hidden)
- [ ] Unit-test: layout reducer

---

## 5. Real-Time Streams
- [ ] WebSocket / SSE for:  
  - `liveChats` updates in Chat Monitor  
  - `systemLogs` tail in Log Viewer
- [ ] Fallback to polling when WS fails
- [ ] Visible “LIVE” badge when socket connected

---

## 6. Settings Tabs – Save & Validate
- [ ] Branding: logo upload S3 → return URL
- [ ] Security: enable / disable 2FA, IP allow-list
- [ ] Notifications: email + Slack webhook test button
- [ ] API/Webhooks: regenerate key confirmation modal
- [ ] Form Zod-validation + toast feedback

---

## 7. Navigation & Guard Polish
- [ ] Hide SuperAdmin links when `!isSuperAdmin`
- [ ] Breadcrumb component (`orgName / Settings / Widgets`)
- [ ] Top-bar Org switcher → dropdown searchable list

---

