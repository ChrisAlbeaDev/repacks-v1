// src/features/players/types.ts

// Define the structure for a Player
// Updated to match the provided SQL schema for public.players
export interface Player {
  player_id: string; // Corresponds to 'player_id' (text) in SQL
  name: string; // Corresponds to 'name' (text) in SQL
  fullName: string | null; // Corresponds to 'fullName' (text) in SQL, can be null
  address: string | null; // Corresponds to 'address' (text) in SQL, can be null
  contactNumber: string | null; // Corresponds to 'contactNumber' (text) in SQL, can be null
  inserted_at: string; // Corresponds to 'inserted_at' (timestamp with time zone) in SQL
  user_id: string; // Added: Foreign key linking to the auth.users table
}

// Define the structure for Player MOP (Method of Payment)
// This remains unchanged as you only provided the schema for 'players' this time.
export interface PlayerMop {
  id: number; // Corresponds to 'id' (bigint) in SQL
  player_id: string; // Corresponds to 'player_id' (text) in SQL
  mop: string; // Corresponds to 'mop' (text) in SQL
  acc_number: string; // Corresponds to 'acc_number' (text) in SQL
  inserted_at: string; // Corresponds to 'inserted_at' (timestamp with time zone) in SQL
  // Note: 'amount' and 'payment_date' fields were in the previous TypeScript
  // definition but are not present in the SQL schema you provided.
  // If you intend to use these, you would need to add them to your
  // 'public.player_mop' table in Supabase.
}
