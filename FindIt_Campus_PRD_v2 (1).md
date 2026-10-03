**# FindIt Campus — Lost & Found System**

**### Product Requirements Document (PRD)**

\| Field         | Details                              |

\| ------------- | ------------------------------------ |

\| Product Name  | FindIt Campus                        |

\| Version       | 1.0                      |

\| Platform      | Web app                              |

\| Document Date | September 2026                       |

\| Status        | Draft — Ready for Review             |

\| Owner         | Product / Student Council Pilot Team |

**## Table of Contents**

1\. Executive Summary

2\. Problem Statement

3\. Goals & Objectives

4\. Scope

5\. User Roles & Personas

6\. Functional Requirements

7\. Screen Specifications

8\. Key User Flows

9\. Non-Functional Requirements

10\. Technical Architecture

11\. Data Model

12\. Agile User Stories & Acceptance Criteria

13\. Edge Cases & Validation Rules

14\. Risks & Mitigations

15\. Constraints & Assumptions

16\. Out of Scope

17\. Success Metrics

18\. Rollout Plan

19\. Future Roadmap (v2+)

**## 1\\. Executive Summary**

FindIt Campus is a lightweight web application that lets college students report, search, and recover lost and found items on campus. It replaces scattered, informal channels — WhatsApp groups, notice boards, word of mouth — with a single searchable repository of lost and found reports.

The app is designed for **\*\*zero-friction access\*\***: students identify themselves with a username only (no password), submit reports with optional photos, browse and filter existing reports, and file claims on items they believe are theirs. A lightweight admin role reviews claims and manages item lifecycle status. All data lives locally in SQLite, keeping the v1.0 build simple, offline-capable, and infrastructure-free.

**\*\*What's new in this revision:\*\*** clarified validation and edge-case rules, a defined claim-conflict policy, a risk register, a phased rollout plan, and a v2 roadmap so stakeholders know what's intentionally deferred versus what's missing.

**## 2\\. Problem Statement**

**### 2.1 Current Situation**

Campuses generally have no dedicated lost & found system. Students rely on:

\- WhatsApp group messages that get buried within hours.

\- Physical notice boards that are rarely updated.

\- Word of mouth, which is unreliable and has limited reach.

**### 2.2 Challenges**

\| Challenge                                     | Impact                                             |

\| --------------------------------------------- | -------------------------------------------------- |

\| Reports scattered across platforms            | Hard to search or discover                         |

\| No structured data (category, location, date) | Items can't be filtered efficiently                |

\| No formal claim workflow                      | Owners can't formally claim found items            |

\| Reports disappear after being scrolled past   | No persistent, accessible record                   |

\| No admin oversight                            | No authority to verify legitimacy or close reports |

\| No way to detect duplicate/conflicting claims | Items can be mis-returned                          |

**### 2.3 Opportunity**

A simple, centralized web application with a clean UI solves all of the above without requiring backend infrastructure. Since scope is limited to a single campus, a local SQLite database is sufficient for v1.0, and the absence of network dependency makes the app fast and resilient.

**## 3\\. Goals & Objectives**

**\*\*Primary Goal:\*\*** Build a fast, clean, easy-to-use web application for managing campus lost & found items.

\| #           | Objective                                                                                                       |

\| ----------- | --------------------------------------------------------------------------------------------------------------- |

\| O1          | Let students report lost items with full details (name, category, description, location, date, optional image). |

\| O2          | Let students report found items with full details.                                                              |

\| O3          | Let users search and filter items by name, category, location, and type.                                        |

\| O4          | Let users view full item details and submit a claim.                                                            |

\| O5          | Let users track their own reports and claim status.                                                             |

\| O6          | Let users share item information via WhatsApp or other apps.                                                    |

\| O7          | Let an administrator review and manage claims and item statuses.                                                |

\| O8          | Provide username-only access — no password-based authentication.                                                |

\| O9 *\_(new)\_*  | Prevent duplicate or conflicting claims on the same item.                                                       |

\| O10 *\_(new)\_* | Give admins a clear, low-friction moderation queue so claims are resolved within days, not weeks.               |

**## 4\\. Scope**

**### 4.1 In Scope (v1.0)**

\- Username-based onboarding (stored locally).

\- Reporting lost and found items.

\- Search and filter functionality.

\- Item detail view with share and claim actions.

\- "My Reports" dashboard (lost items, found items, claims).

\- Admin panel for claim management and item status updates.

\- App settings: theme toggle, text size, username management.

\- Basic input validation and duplicate-claim prevention.

**### 4.2 Out of Scope (v1.0)**

See [Section 16]\(#16-out-of-scope) for the full list.

**## 5\\. User Roles & Personas**

**### 5.1 Roles**

\| Role                   | Description                                                                   |

\| ---------------------- | ----------------------------------------------------------------------------- |

\| Student (Regular User) | Reports lost/found items, searches items, submits claims, tracks own reports. |

\| Administrator          | Reviews reported items and claims; approves, rejects, or closes them.         |

**### 5.2 Personas**

**\*\*Persona 1 — Priya (Student)\*\*** A 2nd-year student who lost her ID card near the library. She wants a quick way to report it and check if someone has turned it in — ideally in under two minutes, between classes.

**\*\*Persona 2 — Rajan (Admin / Student Council)\*\*** Manages the campus lost & found desk. Needs a dashboard to review incoming claims quickly and mark items as returned or closed without digging through spreadsheets.

**## 6\\. Functional Requirements**

**### 6.1 Authentication & User Identity**

\| ID            | Requirement                                                                                      |

\| ------------- | ------------------------------------------------------------------------------------------------ |

\| FR-01         | The app shall allow a user to enter a username on first launch.                                  |

\| FR-02         | The username shall be stored locally and reused on subsequent launches.                          |

\| FR-03         | No password or email shall be required for regular users.                                        |

\| FR-04         | The admin panel shall be accessible via a reserved admin username (e.g., admin).                 |

\| FR-05 *\_(new)\_* | The app shall reject usernames that are blank, contain only whitespace, or exceed 30 characters. |

**### 6.2 Reporting**

\| ID            | Requirement                                                                                                      |

\| ------------- | ---------------------------------------------------------------------------------------------------------------- |

\| FR-06         | Users shall report a lost item with: name, category, description, last known location, date, and optional image. |

\| FR-07         | Users shall report a found item with: name, category, description, location found, date, and optional image.     |

\| FR-08         | All submitted reports shall be stored in the local SQLite database.                                              |

\| FR-09         | A unique ID shall be auto-generated for each report.                                                             |

\| FR-10 *\_(new)\_* | The date field shall not allow a future date.                                                                    |

\| FR-11 *\_(new)\_* | If an image is attached, it shall be compressed before local storage to control app size.                        |

**### 6.3 Search & Discovery**

\| ID            | Requirement                                                                     |

\| ------------- | ------------------------------------------------------------------------------- |

\| FR-12         | Users shall search items by name or keyword.                                    |

\| FR-13         | Users shall filter items by type (Lost / Found).                                |

\| FR-14         | Users shall filter items by category.                                           |

\| FR-15         | Users shall filter items by campus location.                                    |

\| FR-16         | Search results shall display item cards with key info (name, category, status). |

\| FR-17 *\_(new)\_* | Filters shall be combinable (e.g., Type = Found AND Category = Electronics).    |

**### 6.4 Item Detail & Claim**

\| ID            | Requirement                                                                                |

\| ------------- | ------------------------------------------------------------------------------------------ |

\| FR-18         | Users shall view full item details, including image if available.                          |

\| FR-19         | Users shall submit a claim with a written description of why the item belongs to them.     |

\| FR-20         | Users shall share item details via the system share sheet (WhatsApp, etc.).                |

\| FR-21         | Claim status (Pending / Approved / Rejected) shall be visible to the claimant.             |

\| FR-22 *\_(new)\_* | A user shall not submit more than one active claim on the same item.                       |

\| FR-23 *\_(new)\_* | Once an item's status is set to Returned or Closed, no new claims shall be accepted on it. |

**### 6.5 My Reports**

\| ID    | Requirement                                                       |

\| ----- | ----------------------------------------------------------------- |

\| FR-24 | Users shall view all lost items they've reported.                 |

\| FR-25 | Users shall view all found items they've reported.                |

\| FR-26 | Users shall view all claims they've submitted and current status. |

**### 6.6 Admin Panel**

\| ID            | Requirement                                                                                                    |

\| ------------- | -------------------------------------------------------------------------------------------------------------- |

\| FR-27         | Admin shall view all reported lost and found items.                                                            |

\| FR-28         | Admin shall view all pending claims.                                                                           |

\| FR-29         | Admin shall approve or reject a claim.                                                                         |

\| FR-30         | Admin shall update item status: Active, Returned, Closed.                                                      |

\| FR-31 *\_(new)\_* | When a claim is approved, any other pending claims on the same item shall be auto-rejected with a status note. |

**### 6.7 Settings**

\| ID    | Requirement                                         |

\| ----- | --------------------------------------------------- |

\| FR-32 | Users shall toggle Light / Dark mode.               |

\| FR-33 | Users shall adjust text size.                       |

\| FR-34 | Users shall view or update their stored username.   |

\| FR-35 | Users shall view app version and About information. |

**## 7\\. Screen Specifications**

\| Screen                   | Key Elements                                                                                                                                             |

\| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |

\| **\*\*A. Splash\*\***            | Logo, app name, welcome message; auto-routes to Username or Home screen.                                                                                 |

\| **\*\*B. Username\*\***          | Single input, validation (FR-05), Continue button; shown once on first launch.                                                                           |

\| **\*\*C. Home\*\***              | Personalized greeting, global search bar, "Report Lost / Report Found" quick actions, recent items feed, bottom nav (Home / Search / My Reports / More). |

\| **\*\*D. Search / Items\*\***    | Keyword input, filter chips (Type, Category, Location), paginated item cards, tap-through to detail.                                                     |

\| **\*\*E. Report Lost Item\*\***  | Form: name, category (dropdown), description, last known location, date lost, optional image; Submit → SQLite → back to Home.                            |

\| **\*\*F. Report Found Item\*\*** | Same as E, relabeled for "found" context.                                                                                                                |

\| **\*\*G. Item Details\*\***      | Full-width image or placeholder, metadata, status badge, claim button (Found items only, and only if status = Active), share button.                     |

\| **\*\*H. Claim\*\***             | Item summary, claim reason text field, Submit; shows existing claim status if already submitted.                                                         |

\| **\*\*I. My Reports\*\***        | Tabs: My Lost Items / My Found Items / My Claims.                                                                                                        |

\| **\*\*J. Admin\*\***             | Visible only to admin username. Sections: All Items (filterable), Pending Claims; per-claim Approve/Reject, per-item status update.                      |

\| **\*\*K. Settings\*\***          | Theme toggle, text size selector, editable username, app version/About.                                                                                  |

**## 8\\. Key User Flows**

**\*\*Report → Discover → Claim → Resolve\*\***

1\. Priya loses her ID card → opens app → taps "Report Lost Item" → fills form → submits.

2\. Someone finds the card → reports it as "Found" with location + optional photo.

3\. Priya searches "ID card" → filters by Location: Library → finds the matching found-item report.

4\. Priya taps the item → submits a claim with a description proving ownership.

5\. Rajan (admin) reviews the claim in the Pending Claims queue → approves it.

6\. Item status auto-updates to **\*\*Returned\*\***; any other pending claims on the same item are auto-rejected (FR-31); Priya sees her claim marked **\*\*Approved\*\***.

**## 9\\. Non-Functional Requirements**

\| ID             | Category        | Requirement                                                                                 |

\| -------------- | --------------- | ------------------------------------------------------------------------------------------- |

\| NFR-01         | Performance     | The initial page load completes within 2 seconds on typical desktop and mobile browsers.                         |

\| NFR-02         | Performance     | Search results load within 1 second for up to 500 records.                                  |

\| NFR-03         | Usability       | UI is beginner-friendly and requires no onboarding/training.                                |

\| NFR-04         | Usability       | App supports Light and Dark themes.                                                         |

\| NFR-05         | Usability       | Text size is adjustable for accessibility.                                                  |

\| NFR-06         | Reliability     | All data persists across app restarts via SQLite.                                           |

\| NFR-07         | Compatibility   | The web application supports current versions of major desktop and mobile browsers.                                                |

\| NFR-08         | Storage         | Local DB stays under 100 MB under normal usage.                                             |

\| NFR-09         | Maintainability | Code follows clean Flutter/Dart conventions with clear comments.                            |

\| NFR-10         | Simplicity      | No unnecessary third-party services, cloud APIs, or heavy dependencies.                     |

\| NFR-11 *\_(new)\_* | Data Integrity  | Deleting the app clears all local data; this shall be disclosed to users in Settings/About. |

\| NFR-12 *\_(new)\_* | Resilience      | The application shall support offline use after it has been loaded, within the limits of its local data storage.                              |

**## 10\\. Technical Architecture**

**### 10.1 Technology Stack**

\<div class="joplin-table-wrapper">\<table>\<thead>\<tr>\<th>\<p>Layer\</p>\</th>\<th>\<p>Technology\</p>\</th>\</tr>\</thead>\<tbody>\<tr>\<td>\<p>UI Framework\</p>\</td>\<td>\<p>Flutter (Dart)\</p>\</td>\</tr>\<tr>\<td>\<p>Platform\</p>\</td>\<td>\<p>Web browser\</p>\</td>\</tr>\<tr>\<td>\<p>Local Database\</p>\</td>\<td>\<p>SQLite via sqflite\</p>\</td>\</tr>\<tr>\<td>\<p>Image Handling\</p>\</td>\<td>\<p>image_picker (camera/gallery)\</p>\</td>\</tr>\<tr>\<td>\<p>State Management\</p>\</td>\<td>\<p>Provider (lightweight)\</p>\</td>\</tr>\<tr>\<td>\<p>Sharing\</p>\</td>\<td>\<pre>\<code>share_plus\</code>\</pre>\</td>\</tr>\</tbody>\</table>\</div>

**### 10.2 Application Flow**

\`\`\`

App Launch

 ├── First Launch → Username Screen → Home Screen

 └── Returning User → Home Screen

      ├── Report Lost / Found → Report Screen → SQLite

      ├── Search / Filter → Items Screen → Item Detail → Claim Screen

      ├── My Reports → My Lost / Found / Claims

      └── More → Admin (if admin) / Settings

\`\`\`

**## 11\\. Data Model (SQLite)**

**\*\*Table: users\*\***

\| Column   | Type       | Notes          |

\| -------- | ---------- | -------------- |

\| id       | INTEGER PK | Auto-increment |

\| username | TEXT       | Unique         |

**\*\*Table: items\*\***

\| Column      | Type       | Notes                      |

\| ----------- | ---------- | -------------------------- |

\| id          | INTEGER PK | Auto-increment             |

\| type        | TEXT       | lost or found              |

\| name        | TEXT       | Item name                  |

\| category    | TEXT       | Category label             |

\| description | TEXT       | Free text                  |

\| location    | TEXT       | Campus location            |

\| date        | TEXT       | ISO date string            |

\| image_path  | TEXT       | Local file path (nullable) |

\| reported_by | TEXT       | Username                   |

\| status      | TEXT       | active, returned, closed   |

\| created_at  | TEXT       | Timestamp                  |

**\*\*Table: claims\*\***

\| Column      | Type         | Notes                            |

\| ----------- | ------------ | -------------------------------- |

\| id          | INTEGER PK   | Auto-increment                   |

\| item_id     | INTEGER FK   | References items.id              |

\| claimed_by  | TEXT         | Username                         |

\| description | TEXT         | Claim reason                     |

\| status      | TEXT         | pending, approved, rejected      |

\| created_at  | TEXT         | Timestamp                        |

\| resolved_at | TEXT *\_(new)\_* | Timestamp when approved/rejected |

**## 12\\. Agile User Stories & Acceptance Criteria**

**### Epic 1 — User Onboarding**

**\*\*US-01: Username Setup\*\*** As a new user, I want to enter my username so the app can identify me without a password.

\- Username input shown on first launch.

\- Username persists locally across sessions.

\- Blank/whitespace-only username is rejected with a validation message.

\- Returning users skip this screen.

**### Epic 2 — Item Reporting**

**\*\*US-02: Report Lost Item\*\*** As a student, I want to report a lost item so others can help me find it.

\- Form captures name, category, description, location, date, optional image.

\- Mandatory fields validated before submission; date can't be in the future.

\- On submit, item is saved and appears in Home feed and My Reports.

**\*\*US-03: Report Found Item\*\*** As a student, I want to report a found item so the rightful owner can claim it.

\- Same fields as Lost, relabeled ("Location Found", "Date Found").

\- On submit, item is saved and visible in Search results.

**### Epic 3 — Search & Discovery**

**\*\*US-04: Search Items\*\*** As a student, I want to search by name so I can quickly find relevant reports.

\- Filters the list in real time or on submit; case-insensitive partial match.

**\*\*US-05: Filter Items\*\*** As a student, I want to filter by type, category, and location to narrow results.

\- Filters are combinable; "Clear Filters" resets all.

**### Epic 4 — Claim & Share**

**\*\*US-06: Claim a Found Item\*\*** As a student, I want to claim a found item so I can get my belonging back.

\- Claim button visible only on Active, Found items.

\- Claim requires a written description.

\- Submitted claim shows status: Pending.

\- A user cannot submit more than one active claim on the same item (FR-22).

**\*\*US-07: Share Item\*\*** As a student, I want to share item details via WhatsApp so I can spread the word.

\- Tapping Share opens the system share sheet.

\- Shared text includes item name, category, location, and date.

**### Epic 5 — Admin Management**

**\*\*US-08: Admin Reviews Claims\*\*** As an admin, I want to review and act on claims so I can manage the process.

\- Admin panel accessible only to the admin username.

\- Admin sees all pending claims with item and claimant details.

\- Admin can approve or reject each claim.

\- Approving a claim sets item status to Returned and auto-rejects competing claims (FR-31).

**## 13\\. Edge Cases & Validation Rules** *\_(new section)\_*

\| Scenario                                        | Expected Behavior                                                                         |

\| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |

\| User submits a report with no image             | Allowed — image is optional; UI shows a placeholder icon.                                 |

\| User tries to claim their own reported item     | Blocked with a message ("You can't claim an item you reported").                          |

\| Two users submit claims on the same item        | Both appear in the admin queue; approving one auto-rejects the other (FR-31).             |

\| User enters a future date for "Date Lost/Found" | Rejected with inline validation error (FR-10).                                            |

\| Admin tries to approve a claim on a Closed item | Action blocked; item must be reopened first (edge case for admin workflow).               |

\| App is deleted/reinstalled                      | All local data is lost; disclosed to users per NFR-11.                                    |

\| Username "admin" is taken by a regular student  | Reserved at the app level — admin cannot be chosen as a regular username (extends FR-04). |

**## 14\\. Risks & Mitigations** *\_(new section)\_*

\| Risk                                                               | Likelihood | Impact | Mitigation                                                                             |

\| ------------------------------------------------------------------ | ---------- | ------ | -------------------------------------------------------------------------------------- |

\| Local-only storage means data loss on uninstall/device change      | Medium     | High   | Disclose clearly in Settings/About; consider optional export/backup in v2.             |

\| No password means anyone can impersonate a username                | Medium     | Medium | Acceptable for pilot scope; document as a known trade-off, not a security guarantee.   |

\| Single-device admin model doesn't scale if desk has multiple staff | Low (v1.0) | Medium | Flag as a v2 candidate (multi-admin support).                                          |

\| Users abandon claims process if too slow                           | Medium     | Medium | NFR targets (<1s search, <2min report) and a simple claim form mitigate friction.      |

\| Fake/duplicate reports for the same item                           | Medium     | Low    | Admin has status controls (Closed) to suppress noise; true dedup logic deferred to v2. |

**## 15\\. Constraints & Assumptions**

\| #   | Constraint / Assumption                                                              |

\| --- | ------------------------------------------------------------------------------------ |

\| C1  | No internet connection required — all data stored locally.                           |

\| C2  | User identity is based solely on username — no password or email.                    |

\| C3  | Admin is identified by the reserved username admin.                                  |

\| C4  | A single device serves as the shared campus hub, or each user uses their own device. |

\| C5  | SQLite is the only persistence layer in v1.0.                                        |

\| C6  | Images are stored as local file paths — no cloud upload.                             |

\| C7  | The application targets desktop and mobile web browsers for v1.0.                                         |

\| C8  | No push notifications or background services required.                               |

\| C9  | App is designed for a single campus/institution.                                     |

**## 16\\. Out of Scope**

Explicitly not part of v1.0:

\- Password-based or email/OTP authentication.

\- Cloud backend, Firebase, or any remote database.

\- Real-time notifications or background sync.

\- In-app chat or messaging between users.

\- AI/ML image recognition or automatic item matching.

\- Native Android or iOS applications.

\- Multi-campus support.

\- Analytics dashboard or reporting exports.

\- Multi-admin accounts (single reserved admin username only).

**## 17\\. Success Metrics**

\| Metric                               | Target (End of Pilot)                      |

\| ------------------------------------ | ------------------------------------------ |

\| Items reported via app               | ≥ 50 items in the first month              |

\| Successful claims approved           | ≥ 30% of reported found items              |

\| Average search time to find an item  | < 30 seconds                               |

\| User-reported satisfaction           | ≥ 4/5 in post-pilot survey                 |

\| App crash rate                       | < 1% of sessions                           |

\| Time to submit a report              | < 2 minutes                                |

\| *\_(new)\_* Claim resolution time        | < 5 days from submission to admin decision |

\| *\_(new)\_* Duplicate/invalid claim rate | < 10% of total claims                      |

**## 18\\. Rollout Plan** *\_(new section)\_*

\| Phase                    | Duration  | Focus                                                                  |

\| ------------------------ | --------- | ---------------------------------------------------------------------- |

\| Phase 0 — Build          | 3–4 weeks | Core reporting, search, claim, and admin flows.                        |

\| Phase 1 — Internal Pilot | 1 week    | Student council + small test group (\~20 users) on one campus building. |

\| Phase 2 — Campus Pilot   | 4 weeks   | Full campus rollout; track success metrics in Section 17.              |

\| Phase 3 — Review         | 1 week    | Evaluate metrics, collect feedback, decide on v2 scope.                |

**## 19\\. Future Roadmap (v2+)** *\_(new section)\_*

Candidates for a future version, contingent on pilot results:

\- Optional cloud sync/backup so reports survive reinstall or device change.

\- Multi-admin support for larger campuses or multiple lost & found desks.

\- Push notifications when a matching item is reported.

\- Basic image-similarity matching to suggest possible matches automatically.

\- Data export (CSV) for admin reporting/analytics.

\- iOS version.