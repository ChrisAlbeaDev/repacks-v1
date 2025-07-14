export interface Player {
  id: number;
  name: string; // Display name
  fullName: string; // Full name for profile
  address: string;
  contactNumber: string;
  inserted_at: string; // Supabase often adds this column automatically
}