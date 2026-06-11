# Supabase setup — real-time lease management

The app runs in **two modes** automatically:

| `.env` has Supabase keys? | Mode | Behaviour |
|---|---|---|
| ❌ No | **Mock** | In-memory, single device (great for demos) |
| ✅ Yes | **Live** | Supabase + Realtime → actions sync across all phones instantly |

The switch is automatic (`isSupabaseConfigured` in `src/config/env.ts`). No code change needed.

---

## One-time setup (≈15 min)

### 1. Create the project
- Go to <https://app.supabase.com> → **New project** (free).
- Wait for it to provision.

### 2. Run the schema
- Dashboard → **SQL Editor** → **New query**.
- Paste the entire contents of **`supabase/schema.sql`** → **Run**.
- This creates every table (lands, lease_offers, lease_requests, lease_agreements, leases, …), security rules (RLS), and turns on **Realtime** for the lease tables.

### 3. Add the keys to `.env`
- Dashboard → **Settings → API**. Copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public** key → `SUPABASE_ANON_KEY`
- Paste into `.env`:
  ```
  SUPABASE_URL=https://YOUR-PROJECT.supabase.co
  SUPABASE_ANON_KEY=eyJ...your-anon-key...
  ```
- Restart Metro so it picks up `.env`:
  ```
  yarn start --reset-cache
  ```

That's it — the app is now live & multi-device.

---

## Test real-time on two phones (different places)

> Metro only works on the **same WiFi**. For two phones in different cities you need a **standalone build** that talks to cloud Supabase directly.

**Fastest (Android, free):**
1. Build a release APK:  `cd android && ./gradlew assembleRelease`
   → `android/app/build/outputs/apk/release/app-release.apk`
2. Send the APK to the second phone (WhatsApp/Drive) → install.
3. Install on both phones. Log in as **Owner** on one, **Farmer** on the other.

**iOS:** distribute via **TestFlight** (needs an Apple Developer account).

**Then run the loop across the two phones:**
1. Farmer applies on a land → **owner's phone shows the request appear live**.
2. Owner approves → **farmer's phone flips to "Sign agreement" instantly**.
3. Farmer signs → **owner's Tenants updates live**. ✅

---

## How it works (for reference)
- `src/services/supabase.ts` — the client (null until keys exist).
- `src/services/leaseApi.ts` — DB read/write + `subscribe()` (Postgres → WebSocket).
- `src/context/LeaseContext.tsx` — dual-mode: on Supabase it hydrates once, then **refetches on every realtime change**, so all phones stay in sync.

## Next (optional)
- **Push notifications** (owner buzzed when a farmer applies, even app-closed): needs FCM (Android) + APNs (iOS), via a Supabase Edge Function / DB trigger.
- **Auth**: wire real phone/email OTP login so each phone is a real user (RLS then scopes data per user automatically).
