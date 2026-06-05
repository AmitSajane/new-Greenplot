# GreenPlot - Backend API Requirements Document

This document outlines the standard RESTful API structure required by the frontend React Native application. Hand this over to your backend developer so they can start building the database schema and API routes.

## 1. Authentication & User Management
**Base Path:** `/api/v1/auth` & `/api/v1/users`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/auth/send-otp` | `POST` | Send OTP to phone number | `{ phone: "+919876543210" }` | `{ success: true, message: "OTP sent" }` |
| `/auth/verify-otp` | `POST` | Verify OTP and login | `{ phone: "...", otp: "123456" }` | `{ token: "jwt_token", isNewUser: false }` |
| `/auth/register` | `POST` | Complete profile setup | `{ name: "", role: "FARMER"\|"OWNER", language: "kn" }` | `{ user: UserObject }` |
| `/users/me` | `GET` | Get logged-in user profile | None (Auth Header) | `{ id, name, role, phone, preferences }` |
| `/users/me` | `PUT` | Update user profile/language | `{ language: "en", location: {...} }` | `{ success: true }` |

---

## 2. Dashboards (Farmer & Owner)
**Base Path:** `/api/v1/dashboard`

| Endpoint | Method | Description | Response Data Structure |
|----------|--------|-------------|-------------------------|
| `/dashboard/farmer` | `GET` | Aggregated data for Farmer Home | `{ metrics: { activeLeases, totalLand }, alerts: [], featuredLands: [], weather: {} }` |
| `/dashboard/owner` | `GET` | Aggregated data for Owner Home | `{ metrics: { totalRevenue, activeLands }, pendingApplications: [], activity: [] }` |

---

## 3. Land & Leasing Module
**Base Path:** `/api/v1/lands` & `/api/v1/leases`

| Endpoint | Method | Description | Request / Query Params |
|----------|--------|-------------|------------------------|
| `/lands` | `GET` | Browse available lands | `?lat=x&lon=y&radius=50&crop=wheat` |
| `/lands/:id` | `GET` | Get specific land details | None |
| `/lands/:id/lease-types` | `GET` | Get allowed lease configurations | None (Returns Fixed, Crop Share, etc.) |
| `/leases/apply` | `POST` | Submit a lease application | `{ landId, leaseTypeId, durationMonths }` |
| `/leases/my-applications`| `GET` | List user's lease statuses | None |
| `/leases/agreements` | `GET` | List active lease agreements | None |
| `/leases/agreements/:id` | `GET` | Specific agreement details | None |

---

## 4. Labor Connect Module
**Base Path:** `/api/v1/labor`

| Endpoint | Method | Description | Request / Query Params |
|----------|--------|-------------|------------------------|
| `/labor/jobs` | `GET` | Find available shifts/jobs | `?lat=x&lon=y&date=YYYY-MM-DD` |
| `/labor/jobs` | `POST` | Create a new job post (Owner) | `{ title, wage, date, location, workersNeeded }` |
| `/labor/jobs/:id/apply`| `POST` | Apply for a shift | None |
| `/labor/my-shifts` | `GET` | List jobs applied/assigned | None |

---

## 5. Agronomy & AI Services
**Base Path:** `/api/v1/services`

| Endpoint | Method | Description | Details |
|----------|--------|-------------|---------|
| `/services/soil` | `GET` | Fetch soil data by location | **Query:** `?lat=x&lon=y`<br>**Response:** `{ pH, nitrogen, organicMatter, texture }` |
| `/services/weather`| `GET` | Fetch weather forecast | **Query:** `?lat=x&lon=y` |
| `/services/satellite`| `GET` | Get NDVI map data | **Query:** `?farmId=123` |
| `/services/ai-chat`| `POST` | AI Agronomy Assistant | **Body:** `{ message: "How to treat yellow leaves?" }` |

---

## 6. Community & News
**Base Path:** `/api/v1/community` & `/api/v1/news`

| Endpoint | Method | Description | Notes |
|----------|--------|-------------|-------|
| `/community/posts` | `GET` | Get farmer community Q&A | Pagination supported |
| `/community/posts` | `POST` | Ask a question | Includes image upload support |
| `/news` | `GET` | Latest agricultural news | Localized based on user language |

## Development Notes for the Backend Dev:
1. **Authentication:** Use **JWT (JSON Web Tokens)** passed in the `Authorization: Bearer <token>` header.
2. **Standard Responses:** Use a standard JSON wrapper for all responses: 
   ```json
   { "status": "success/error", "data": {}, "message": "Optional" }
   ```
3. **Localization:** The backend should read the `Accept-Language` header (e.g., `kn` for Kannada) from the API request to translate error messages or dynamic news content on the server side before sending it back.
4. **Database Suggestions:** PostgreSQL is recommended, especially utilizing **PostGIS** for location/radius-based queries (crucial for finding nearby land and labor).
