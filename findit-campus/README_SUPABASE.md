# FindIt Campus - Supabase Setup Guide

This guide explains how to set up and deploy the database schema, security policies, and storage bucket for FindIt Campus.

---

## 1. Executive Security & Migration Overview

- **Safe Non-Destructive Migration**: Does NOT drop existing `profiles`, `items`, or `claims` tables. All existing records are preserved.
- **Privilege Escalation Protection**: Users cannot modify their `is_admin` column. Triggers automatically revert unauthorized `is_admin` changes.
- **Privacy Protection**: Profile email addresses are NOT stored in `public.profiles`. Auth handles credentials securely, preventing email leakage via public table queries.
- **RLS & Immutability**:
  - `items`: Reporter ID cannot be modified after creation by standard users.
  - `claims`: Claimant ID, Item ID, and Claim Status cannot be modified by standard users. Only Admins can approve or reject claims.
- **Idempotency**: All triggers, functions, policies, and buckets use `DROP IF EXISTS` and `ON CONFLICT` clauses, allowing safe re-execution at any time.

---

## 2. Running the SQL Schema

1. Log into your [Supabase Dashboard](https://database.supabase.com).
2. Select your project and navigate to the **SQL Editor** tab.
3. Open [`supabase/schema.sql`](file:///c:/Users/asus/Desktop/AI%20LAB%20PROJECT/findit-campus/supabase/schema.sql) from this repository, copy all SQL text, and paste it into the SQL Editor.
4. Click **Run**.

---

## 3. Creating Your First Administrator Account

Because self-service admin assignment is blocked by SQL triggers, follow one of these options to grant your user account admin rights:

### Option A: Using the SQL Procedure (Recommended)
1. Sign up on the FindIt Campus website with your email and password.
2. In the Supabase SQL Editor, run:
```sql
SELECT public.grant_admin_role('YOUR_USER_UUID_HERE');
```
*(Replace `YOUR_USER_UUID_HERE` with the UUID from `auth.users` or `public.profiles`)*

### Option B: Direct SQL Update
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = 'YOUR_USER_UUID_HERE';
```

---

## 4. Environment Configuration

Ensure `.env.local` is present in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

---

## 5. Verification & Testing

Run `npm run build` locally to verify TypeScript compilation:
```bash
npm run build
```
Start the development server:
```bash
npm run dev
```
