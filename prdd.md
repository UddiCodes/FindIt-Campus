# Experiment 1: AI-Assisted Requirement Engineering (PRD/SRS)

## PRD: Product Requirement Document

---

**Objective:**
Transform RAW, unstructured user/business requirements into a formal Software Requirement Specification (SRS) / Product Requirement Document (PRD).

**Task:**
Feed a vague business description of any problem into an LLM. Generate structured agile user stories, acceptance criteria, and a system feature list.

**AI Tool Used:** Claude (Anthropic) via Antigravity IDE

---

## Prompt Used

> Convert to a detailed PRD:
>
> **Name:** FindIt Campus
>
> **Problem Overview:**
> A campus-wide Lost & Found web app. Students report lost or found items, browse listings, and claim their belongings through an admin-reviewed workflow. There is currently no central system — reports are scattered across WhatsApp groups, notice boards, and word of mouth. No verification exists to prevent fraudulent claims.
>
> **Objectives:**
> 1. To build a fast and clean UI for a lost and found web application.
> 2. To allow easy reporting of lost or found items with image upload.
> 3. To allow access only with authentication (email + password + username).
> 4. To provide a search and filter system (by type, category, and location).
> 5. To allow users to submit ownership claims on found items.
> 6. To allow admins to approve or reject claims and manage all items.
> 7. To share item details via WhatsApp / clipboard.
> 8. To store all data securely in the cloud with Row Level Security.

---

## Techstead

| Property | Value |
|---|---|
| **Framework** | React 19 (with TypeScript) |
| **Platform** | Web (Browser) |
| **App Type** | Online (Cloud-connected) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Deployment** | Vercel |
| **Build Tool** | Vite 8 |
| **Styling** | TailwindCSS v4 |

---

## Screens

---

### a) Auth Screen (`/`)
*(Redirected here when unauthenticated)*

- App logo / brand name (`FindIt.`)
- Welcome message / tagline
- **Sign In** form:
  - Email input
  - Password input
  - Sign In button
- **Sign Up** form (toggle):
  - Email input
  - Username input
  - Password input
  - Sign Up button
- Toggle link: "Don't have an account? Sign Up" / "Already have an account? Sign In"
- Inline validation errors (empty fields, password < 6 chars, username > 30 chars)
- Redirects to Home Screen on successful login

---

### b) Home Screen (`/`)

- Personalized greeting strip (`Good morning/afternoon/evening, @username`)
- **Hero section:**
  - Headline: *"Lost something? Let's find it."*
  - Subtext about the platform
  - Search bar (navigates to `/search?q=...`)
  - CTA buttons: Browse Items | Report an Item
- **Photo mosaic** (right panel): up to 4 live item images from recent listings
- **Stats strip:** Active Listings · Items Found · Items Returned
- **Latest Listings:** Last 6 active items in an animated grid (staggered Framer Motion)
- **How It Works section** (3 steps):
  - 01 — Report an Item
  - 02 — Browse Listings
  - 03 — Submit a Claim
- Bottom navigation links: Browse All Listings | Report an Item Now

---

### c) Search / Browse Screen (`/search`)

- Page heading: *Browse Items*
- **Search bar:** keyword search across name, description, category
- **Filter toggle button** → reveals filter panel:
  - Type: All / Lost / Found
  - Category: Electronics, Books & Notes, Clothing & Accessories, ID & Cards, Keys, Bags & Wallets, Sports & Fitness, Other
  - Location: Main Library, Science Block, Engineering Block, Arts Block, Cafeteria, Sports Complex, Admin Block, Hostel A, Hostel B, Parking Lot, Auditorium, Campus Gate
- Clear Filters button (shown when any filter is active)
- Live result count (`X items found`)
- **Results grid:** 1 → 2 → 3 → 4 columns (responsive), each item shown as `ItemCard`
- Empty state message + clear filters link

---

### d) Item Detail Screen (`/item/:id`)

- Back button
- Item image (4:3 ratio, or placeholder icon if none)
- Type badge (LOST / FOUND) + Status badge (Active / Returned / Closed)
- Category label, Item name, Description
- Meta row: Location · Date · Reported by @username
- **Contextual action panels (based on item type, status, ownership):**
  - *Found item, not mine, active, no claim:* "Is this yours?" → Submit a Claim button
  - *Lost item, not mine, active:* "Did you find this?" → I Found This Item button (prefills Report form)
  - *Own lost item, active:* Guide user to search for a matching Found report
  - *Own found item:* Info that claims appear in admin queue
  - *Item not active:* Status notice — no claim action shown
  - *Existing claim (own):* Status badge — Pending / Approved / Rejected
- **Share button:** Web Share API / clipboard fallback
- **Claim form (inline, expandable):**
  - Textarea: "Why does this belong to you?" (min 10 characters)
  - Submit Claim / Cancel buttons

---

### e) Report an Item Screen (`/report`)

- Page heading: *Report an Item*
- **Type toggle:** I Lost something | I Found something
- **Form fields:**
  - Item Name * (text input)
  - Category * (dropdown — 8 options)
  - Description * (textarea — colour, brand, markings)
  - Location * (dropdown — 12 campus locations)
  - Date * (date picker, max = today)
  - Photo (optional — drag/click upload; image preview with remove button)
- Client-side validation with inline errors
- Submit Report button (shows "Uploading…" state during image upload)
- On success: success screen → auto-redirects to My Reports after 1.5 s

---

### f) My Reports Screen (`/my-reports`)

- Page heading: *My Reports*
- Lists all items reported by the logged-in user
- Each item card shows: image, name, type badge, status, claim count summary
- **Delete button** per item (removes item + storage image)
- Links to full Item Detail page per card
- Empty state: prompt to report the first item

---

### g) Admin Dashboard Screen (`/admin`)
*(Accessible only to admin users — others redirected to `/`)*

- Page heading: *Admin Dashboard*
- **Stats panel (top):**
  - Total Items
  - Pending Claims
  - Resolved (approved + rejected)
- **Tabs:**
  - **Pending Claims tab:**
    - Lists all claims with `status = pending`
    - Each claim card shows: item name (linked), category, location, claimant @username, date, claim description (quoted)
    - **Approve & Return Item** button → claim approved, other pending claims auto-rejected, item marked `returned`
    - **Reject** button → claim marked `rejected`
  - **All Items tab:**
    - Full list of every item in the system
    - Per item: image thumbnail, name (linked), reporter @username, type badge, location
    - **Inline status dropdown** per item: Active / Returned / Closed

---

### h) Settings Screen (`/settings`)

- Page heading: *Settings*
- **Username section:**
  - Current username displayed
  - Input to update username (≤ 30 chars, lowercase, underscores)
  - Save button (inline success/error feedback)
- **About section:**
  - Version: 1.0.0
  - Platform: Web (Supabase)
  - Data: Stored securely in the cloud
- **Session section:**
  - Logout button (clears session; reports remain saved)

---

## Objectives (Detailed)

1. **To build a fast and clean UI** — React 19 + TailwindCSS v4 with Framer Motion animations; sub-second interactions.
2. **To allow easy item reporting** — < 2 minutes to submit a report including optional image upload to Supabase Storage.
3. **To enforce authentication** — All routes protected; unauthenticated users land on Auth Screen.
4. **To provide powerful search and filtering** — Keyword search + Type / Category / Location filters; URL-param synced.
5. **To allow ownership claim submission** — Inline claim form with minimum description requirement, one claim per user per item.
6. **To allow admin claim management** — Approve auto-resolves item + rejects all competing claims; manual status override available.
7. **To allow item sharing** — Web Share API with clipboard fallback; item details formatted for WhatsApp sharing.
8. **To store all data securely** — Supabase RLS on all tables; DB triggers block privilege escalation; Storage policies restrict upload/delete.

---

## User Stories & Acceptance Criteria

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-01 | As a student, I want to sign up with my email and a username so I can start reporting items. | Account is created; profile row inserted with chosen username; redirected to Home. |
| US-02 | As a student, I want to report a lost item with a photo and location so others can help me find it. | Item appears in Browse and Home listings; image stored in Supabase Storage. |
| US-03 | As a student, I want to search for a found item matching what I lost so I can claim it. | Keyword + filter search returns relevant results in real time. |
| US-04 | As a student, I want to submit a claim on a found item so an admin can verify it's mine. | Claim created with `status: pending`; claimant cannot alter claim status. |
| US-05 | As a student, I want to see the status of my submitted claims so I know if my item is coming back. | My Reports shows pending/approved/rejected status per claim. |
| US-06 | As an admin, I want to review all pending claims so I can approve the legitimate owner. | Admin Dashboard lists all pending claims; Approve/Reject buttons functional. |
| US-07 | As an admin, I want approving one claim to auto-reject all others for the same item. | On approve: item status → `returned`; competing claims → `rejected` atomically. |
| US-08 | As an admin, I want to manually close an item that was never claimed. | Status dropdown in All Items tab allows setting `closed`. |
| US-09 | As a student, I want to share an item listing so I can spread the word via WhatsApp. | Share button copies/shares formatted item text with name, category, location, date. |
| US-10 | As a student, I want to update my display username from Settings. | Username updated in `profiles` table; reflected immediately in UI. |

---

## System Feature List

| # | Feature | Priority | Status |
|---|---|---|---|
| F-01 | Email/password authentication with username | High | ✅ Done |
| F-02 | Lost & Found item reporting with image upload | High | ✅ Done |
| F-03 | Public search with keyword + multi-filter | High | ✅ Done |
| F-04 | Item detail page with contextual actions | High | ✅ Done |
| F-05 | Claim submission workflow | High | ✅ Done |
| F-06 | Admin claim approval / rejection | High | ✅ Done |
| F-07 | Auto-reject competing claims on approval | High | ✅ Done |
| F-08 | Admin item status management | Medium | ✅ Done |
| F-09 | My Reports dashboard with delete | Medium | ✅ Done |
| F-10 | Web Share API / clipboard share | Medium | ✅ Done |
| F-11 | Username update in Settings | Low | ✅ Done |
| F-12 | Row Level Security on all DB tables | High | ✅ Done |
| F-13 | Server-side search & pagination | Medium | 🔲 Future |
| F-14 | Email notifications on claim events | Medium | 🔲 Future |
| F-15 | Real-time updates (Supabase Realtime) | Medium | 🔲 Future |
| F-16 | In-app admin role management UI | Low | 🔲 Future |
| F-17 | Dark mode toggle | Low | 🔲 Future |
| F-18 | Auto-expiry of old inactive items | Low | 🔲 Future |
