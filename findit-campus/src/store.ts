import { supabase } from './lib/supabase';
import type { Item, Claim, User } from './types';

// ─── User & Auth ─────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<User | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, is_admin')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error fetching profile:', error);
    return null;
  }
  return {
    id: data.id,
    email: session.user.email || '',
    username: data.username,
    isAdmin: !!data.is_admin,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('items')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('items').getPublicUrl(filePath);
  return data.publicUrl;
}

// ─── Items ───────────────────────────────────────────────────────────────────

function mapItem(row: any): Item {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    category: row.category,
    description: row.description,
    location: row.location,
    date: row.date,
    imagePath: row.image_path,
    reportedBy: row.reported_by,
    reporterUsername: row.profiles?.username,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return (data || []).map(mapItem);
}

export async function addItem(item: Omit<Item, 'id' | 'createdAt' | 'reporterUsername'>): Promise<void> {
  const { error } = await supabase.from('items').insert({
    type: item.type,
    name: item.name,
    category: item.category,
    description: item.description,
    location: item.location,
    date: item.date,
    image_path: item.imagePath,
    reported_by: item.reportedBy,
    status: item.status,
  });
  if (error) console.error('Error adding item:', error);
}

export async function updateItemStatus(id: string, status: Item['status']): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ status })
    .eq('id', id);
  if (error) console.error('Error updating item status:', error);
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const { data, error } = await supabase
    .from('items')
    .select('*, profiles(username)')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching item by id:', error);
    return undefined;
  }
  return mapItem(data);
}

// ─── Claims ──────────────────────────────────────────────────────────────────

function mapClaim(row: any): Claim {
  return {
    id: row.id,
    itemId: row.item_id,
    claimedBy: row.claimed_by,
    claimerUsername: row.profiles?.username,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export async function getClaims(): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching claims:', error);
    return [];
  }
  return (data || []).map(mapClaim);
}

export async function addClaim(claim: Omit<Claim, 'id' | 'createdAt' | 'claimerUsername'>): Promise<void> {
  const { error } = await supabase.from('claims').insert({
    item_id: claim.itemId,
    claimed_by: claim.claimedBy,
    description: claim.description,
    status: claim.status,
  });
  if (error) console.error('Error adding claim:', error);
}

export async function getClaimsForItem(itemId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*, profiles(username)')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching claims for item:', error);
    return [];
  }
  return (data || []).map(mapClaim);
}

export async function getClaimsByUser(userId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*, profiles(username)')
    .eq('claimed_by', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching claims by user:', error);
    return [];
  }
  return (data || []).map(mapClaim);
}

export async function approveClaim(claimId: string): Promise<void> {
  const { data: claimData, error: claimError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (claimError || !claimData) {
    console.error('Error finding claim to approve:', claimError);
    return;
  }

  const now = new Date().toISOString();

  await supabase
    .from('claims')
    .update({ status: 'approved', resolved_at: now })
    .eq('id', claimId);

  await supabase
    .from('claims')
    .update({ status: 'rejected', resolved_at: now })
    .eq('item_id', claimData.item_id)
    .eq('status', 'pending')
    .neq('id', claimId);

  await updateItemStatus(claimData.item_id, 'returned');
}

export async function rejectClaim(claimId: string): Promise<void> {
  const { error } = await supabase
    .from('claims')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', claimId);
  if (error) console.error('Error rejecting claim:', error);
}

// ─── Utility ─────────────────────────────────────────────────────────────────
export function seedDataIfEmpty(): void {
  // Use SQL script to seed
}
