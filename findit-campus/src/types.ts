// Core data types for FindIt Campus

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'returned' | 'closed';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type ItemCategory =
  | 'Electronics'
  | 'Books & Notes'
  | 'Clothing & Accessories'
  | 'ID & Cards'
  | 'Keys'
  | 'Bags & Wallets'
  | 'Sports & Fitness'
  | 'Other';

export const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Books & Notes',
  'Clothing & Accessories',
  'ID & Cards',
  'Keys',
  'Bags & Wallets',
  'Sports & Fitness',
  'Other',
];

export const LOCATIONS = [
  'Main Library',
  'Science Block',
  'Engineering Block',
  'Arts Block',
  'Cafeteria',
  'Sports Complex',
  'Admin Block',
  'Hostel A',
  'Hostel B',
  'Parking Lot',
  'Auditorium',
  'Campus Gate',
];

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  category: ItemCategory;
  description: string;
  location: string;
  date: string; // ISO date string YYYY-MM-DD
  imagePath?: string; // URL or local blob
  reportedBy: string; // uuid
  reporterUsername?: string;
  status: ItemStatus;
  createdAt: string; // ISO timestamp
}

export interface Claim {
  id: string;
  itemId: string;
  claimedBy: string; // uuid
  claimerUsername?: string;
  description: string;
  status: ClaimStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}
