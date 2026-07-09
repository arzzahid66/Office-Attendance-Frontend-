# Office Attendance — Frontend (Phase 1)

Mobile-first React + Vite **PWA**. Employees check in; admins approve signups, manage shifts
and offices, and review attendance.

The **server decides every attendance outcome** — this app renders the returned `state` and
never computes late/off-day/shift-window itself.

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173, proxies /api -> http://127.0.0.1:8000
```

Leave `VITE_API_BASE_URL` unset in dev (the Vite proxy handles `/api`). In production set it
to the full backend URL **including `/api`** — see [.env.example](.env.example).

```bash
npm run build          # production bundle
npm run lint
```

## Employee flow

- **Today** calls `POST /attendance/checkin-attempt` on app open, on regaining visibility,
  and on network reconnect. It renders whatever `state` comes back:
  `off_day` · `before_shift` · `after_shift` · `checked_in` · `already_checked_in` ·
  `need_location` · `outside_radius` · `low_accuracy` · `no_roster`.
- **`need_location`** shows a dismissible popup with **Share location** / **Not now**.
  Sharing calls `getCurrentPosition({ enableHighAccuracy: true })` → `POST
  /attendance/verify-location`. Dismissing costs nothing and **re-prompts at most once per
  hour** (localStorage). No popup is ever a modal trap — each has a visible close.
- **Heartbeat** (`useHeartbeat`) runs every **5 minutes while the tab is visible**. On a GPS
  day the server replies `requires_location: true`, and the hook re-sends coordinates every
  `reverify_minutes`. That is the client half of the check-out rule: `last_seen` only
  advances while the user is provably in radius.
- **History** — last 30 days: date, status, in/out, method.

> **GPS needs HTTPS.** `navigator.geolocation` is blocked outside a secure context, so the
> **backend must also be HTTPS** or the browser blocks the call as mixed content.

> A closed PWA cannot detect a WiFi change or wake itself — there is deliberately **no**
> Background Sync / Periodic Background Sync here. True background check-in needs a native
> shell (see the `// TODO: Capacitor foreground service` marker in `useHeartbeat.js`).

## Admin flow

Bottom nav is capped at 5 items; secondary destinations live under **More**.

| Screen | What it does |
|---|---|
| **Dashboard** | Today's live view. `gps_pending` rows are highlighted with **Approve / Query** — GPS is never auto-trusted. |
| **Approvals** | Pending signups with the shift they requested; approve **with a roster override** + feedback, or reject with feedback. Approving always assigns a roster. |
| **Employees** | Status, devices (revoke), disable/enable. |
| **Flagged** | Resolve to present / **leave** / **absent** + note — the only path to absent or leave. |
| **More → Rosters** | Shift CRUD: times, grace, working-day checkboxes, default toggle. Delete is refused (409) while employees are assigned. |
| **More → Offices** | Public IPs (add/remove, **Add my current public IP**), coordinates, radius. Delete refused (409) while rosters belong to it. |
| **More → Reports** | Monthly counters + CSV export. |

## Notes

- PWA (`vite-plugin-pwa`): app shell is precached, **API responses are never cached**
  (`navigateFallbackDenylist: [/^\/api\//]`, empty `runtimeCaching`).
- Light/dark theme via `data-theme` on `<html>`; all colors come from CSS variables in
  `index.css`. Icons are inline SVG — no emoji.
- `api.js` attaches `Authorization` + `X-Device-Token`, refreshes once on 401, and exposes
  `apiDownload()` so file downloads (CSV) also respect `VITE_API_BASE_URL`.
