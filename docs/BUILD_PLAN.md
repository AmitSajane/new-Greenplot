# GreenPlot — Launch Plan (June 10 → 30)

**Target:** Real launched app with real users · Backend: **Supabase** (Postgres + Auth + Storage)
**Reality:** Frontend is 100% built. Remaining work = backend wiring + free-API integration + store launch.

---

## 🔴 DO TODAY (unblocks everything — June 10)
These are **your** tasks. The build cannot ship without them, and the store clock starts now.

- [ ] Create a **Supabase** project (free) → send me the **Project URL** + **anon key** (goes in `.env`)
- [ ] Create **Apple Developer** account ($99/yr) — approval can take 24–48h
- [ ] Create **Google Play Developer** account ($25 once) — **start the 14-day closed test ASAP** (new-account rule)
- [ ] Recruit **20 testers** (friends/farmers) for the Play closed test
- [ ] Register free API keys: **data.gov.in** (mandi prices), **Bhashini** (Indian-language voice/translate)
- [ ] Decide an **OTP provider** for login (Supabase phone auth uses Twilio/MSG91 — small cost) OR use **email OTP** (free) for v1

---

## Two parallel tracks

### 🛠 BUILD TRACK (me-heavy — I write the code, you test on device)
| Phase | Dates | Scope | Priority |
|---|---|---|---|
| **0 · Foundation** | Jun 10–11 | Supabase client, **DB schema** (see `supabase/schema.sql`), storage buckets, `.env` wiring | P0 |
| **1 · Auth** | Jun 12–14 | Real login (phone/email OTP), Profile Setup → DB, farmer/owner role, session persistence | P0 |
| **2 · Marketplace** | Jun 15–17 | Lands in DB, owner adds land + **photo upload**, farmer browses **real** lands, lease requests, My Leases / Tenants from DB | P0 |
| **3 · Community Hub** | Jun 18–19 | Posts + **image/video upload**, real feed, likes/saves persist, comments | P0 |
| **4 · Live APIs** | Jun 20–21 | **Open-Meteo** weather, **data.gov.in** mandi prices (state-wise), soil (already real) | P0 |
| **5 · AI** | Jun 22–24 | **Crop Doctor** + disease API, **Bhashini** for Kisan Mitra voice/translate | P1 |
| **6 · Labor + Notifications** | Jun 25–26 | Labor jobs/applications in DB, push notifications | P1 |
| **7 · Test + Deploy** | Jun 27–30 | End-to-end QA, edge cases, bug-fix, build → TestFlight + Play, rehearse | P0 |

### 📋 STORE / COMPLIANCE TRACK (you-heavy — runs in parallel from Day 1)
| Item | When | Owner |
|---|---|---|
| Dev accounts (Apple + Google) | Jun 10 | You |
| Google Play 14-day closed test (20 testers) | Jun 12 → 26 | You |
| **Privacy Policy** + Terms (required by stores; I'll draft) | Jun 18 | Me + You |
| App icon, screenshots, store listing copy | Jun 24 | You (I help) |
| Data-safety / privacy forms (PII, location, mic) | Jun 26 | You |
| Submit iOS (App Store review) | Jun 28 | You |
| Submit Android (after closed test passes) | Jun 27 | You |

---

## Priority cut-list (if we fall behind)
- **P0 (must launch):** Auth · Leasing · Community Hub · Weather · Mandi prices · Deploy
- **P1 (should):** Crop Doctor · Bhashini voice · Labor real · Notifications
- **P2 (ship as polished mock — already built):** anything else

If June 27 arrives and P1 isn't done → **launch P0, ship P1 as a fast-follow update.** A focused, real, smaller app beats a broken big one.

---

## What each side owns
- **Me:** schema, all backend/service code, API integrations, RLS security, auth, storage, deploy configs, privacy-policy draft, and I explain every piece.
- **You:** accounts/keys, ~2–4 focused hrs/day testing on a real device, product decisions, store admin, recruiting testers.

## Risks & mitigations
1. **Google Play 14-day rule** → start the account + closed test **today**. iOS/TestFlight as the immediate real-user channel.
2. **OTP cost/setup** → use **email OTP (free)** for v1 if SMS provider isn't ready.
3. **Scope creep** → protect P0; everything new goes to the fast-follow list.
4. **Land-records verification** (state-fragmented, no national API) → for v1, owners **upload their land document**; verify manually. Automate later.
