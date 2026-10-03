-- ==============================================================================
-- FINDIT CAMPUS: Clean Fresh Supabase Database Setup & Schema
-- Drops and recreates application tables (profiles, items, claims), RLS policies,
-- security triggers, and Storage configuration for a fresh deployment.
-- ==============================================================================

-- 1. EXTENSIONS & DROP EXISTING APP TABLES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.claims CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PUBLIC PROFILES TABLE
-- Stores public profile data linked to auth.users.
-- Email is omitted to protect user privacy.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. ITEMS TABLE
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    image_path TEXT,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 4. CLAIMS TABLE
CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    claimed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- HELPER & SECURITY FUNCTIONS
-- ==============================================================================

-- Helper function to check if the caller is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Secure procedure to grant admin privileges (executable only by existing admins or service_role)
CREATE OR REPLACE FUNCTION public.grant_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_admin() OR current_setting('role', true) = 'service_role' THEN
    UPDATE public.profiles
    SET is_admin = true
    WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Access denied. Only system administrators can grant admin status.';
  END IF;
END;
$$;

-- Trigger: Block unauthorized modification of `is_admin` column
CREATE OR REPLACE FUNCTION public.prevent_profile_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT public.is_admin() AND current_setting('role', true) <> 'service_role' THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_profile_admin_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_profile_admin_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_admin_escalation();

-- Trigger: Prevent unauthorized alteration of reporter_id on items
CREATE OR REPLACE FUNCTION public.enforce_item_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.reported_by IS DISTINCT FROM OLD.reported_by THEN
    IF NOT public.is_admin() AND current_setting('role', true) <> 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter the reporter ID of an item.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_item_update_rules ON public.items;
CREATE TRIGGER tr_enforce_item_update_rules
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_item_update_rules();

-- Trigger: Prevent unauthorized alteration of claimed_by, item_id, and claim status
CREATE OR REPLACE FUNCTION public.enforce_claim_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() AND current_setting('role', true) <> 'service_role' THEN
    IF NEW.claimed_by IS DISTINCT FROM OLD.claimed_by THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter the claimant ID of a claim.';
    END IF;
    IF NEW.item_id IS DISTINCT FROM OLD.item_id THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter the item ID of a claim.';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators can update claim statuses.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_claim_update_rules ON public.claims;
CREATE TRIGGER tr_enforce_claim_update_rules
BEFORE UPDATE ON public.claims
FOR EACH ROW
EXECUTE FUNCTION public.enforce_claim_update_rules();

-- Trigger: Automatic creation of profile on signup with username collision handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  raw_username text;
  clean_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Extract raw username or default to email prefix
  raw_username := NEW.raw_user_meta_data->>'username';
  IF raw_username IS NULL OR trim(raw_username) = '' THEN
    raw_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Clean username: lower case, strip non-alphanumeric except underscores
  clean_username := lower(regexp_replace(trim(raw_username), '[^a-zA-Z0-9_]', '', 'g'));
  IF clean_username = '' THEN
    clean_username := 'user';
  END IF;

  final_username := clean_username;

  -- Handle collisions by suffixing incrementing numbers
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := clean_username || counter::text;
  END LOOP;

  -- Always force is_admin to FALSE during signup
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (NEW.id, final_username, false)
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Safeguard fallback
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (NEW.id, 'user_' || substr(NEW.id::text, 1, 8), false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- --- Profiles Policies ---
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
CREATE POLICY "Public Profiles Access" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Users Update Own Profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users Insert Own Profile" ON public.profiles;
CREATE POLICY "Users Insert Own Profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- --- Items Policies ---
DROP POLICY IF EXISTS "Anyone Can View Items" ON public.items;
CREATE POLICY "Anyone Can View Items" ON public.items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated Users Can Create Items" ON public.items;
CREATE POLICY "Authenticated Users Can Create Items" ON public.items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reported_by);

DROP POLICY IF EXISTS "Reporters and Admins Can Update Items" ON public.items;
CREATE POLICY "Reporters and Admins Can Update Items" ON public.items
  FOR UPDATE USING (auth.uid() = reported_by OR public.is_admin());

DROP POLICY IF EXISTS "Reporters and Admins Can Delete Items" ON public.items;
CREATE POLICY "Reporters and Admins Can Delete Items" ON public.items
  FOR DELETE USING (auth.uid() = reported_by OR public.is_admin());

-- --- Claims Policies ---
DROP POLICY IF EXISTS "Claimants, Reporters, and Admins Can View Claims" ON public.claims;
CREATE POLICY "Claimants, Reporters, and Admins Can View Claims" ON public.claims
  FOR SELECT USING (
    auth.uid() = claimed_by
    OR EXISTS (SELECT 1 FROM public.items WHERE id = claims.item_id AND reported_by = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Authenticated Users Can Create Pending Claims" ON public.claims;
CREATE POLICY "Authenticated Users Can Create Pending Claims" ON public.claims
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = claimed_by 
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Claimants and Admins Can Update Claims" ON public.claims;
CREATE POLICY "Claimants and Admins Can Update Claims" ON public.claims
  FOR UPDATE USING (auth.uid() = claimed_by OR public.is_admin());

DROP POLICY IF EXISTS "Claimants and Admins Can Delete Claims" ON public.claims;
CREATE POLICY "Claimants and Admins Can Delete Claims" ON public.claims
  FOR DELETE USING (auth.uid() = claimed_by OR public.is_admin());

-- ==============================================================================
-- STORAGE BUCKET & SECURITY POLICIES FOR IMAGE UPLOADS
-- ==============================================================================

-- Ensure 'items' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('items', 'items', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage object policies
DROP POLICY IF EXISTS "Public Read Access for Items Bucket" ON storage.objects;
CREATE POLICY "Public Read Access for Items Bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'items');

DROP POLICY IF EXISTS "Authenticated Upload Access for Items Bucket" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for Items Bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'items' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner or Admin Update Items Bucket" ON storage.objects;
CREATE POLICY "Owner or Admin Update Items Bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'items' AND (owner = auth.uid() OR public.is_admin()));

DROP POLICY IF EXISTS "Owner or Admin Delete Items Bucket" ON storage.objects;
CREATE POLICY "Owner or Admin Delete Items Bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'items' AND (owner = auth.uid() OR public.is_admin()));
