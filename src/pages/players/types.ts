// src/features/players/types.ts

// Define the structure for a Player
export interface Player {
  player_id: string; // Corresponds to 'player_id' (text) in SQL
  name: string; // Corresponds to 'name' (text) in SQL
  fullName: string | null; // Corresponds to 'fullName' (text) in SQL, can be null
  address: string | null; // Corresponds to 'address' (text) in SQL, can be null
  contactNumber: string | null; // Corresponds to 'contactNumber' (text) in SQL, can be null
  inserted_at: string; // Corresponds to 'inserted_at' (timestamp with time zone) in SQL
  user_id: string; // Foreign key linking to the auth.users table
  profile_pic_url: string | null; // New: URL for the player's profile picture
}

// Define the structure for Player MOP (Method of Payment)
export interface PlayerMop {
  id: number; // Corresponds to 'id' (bigint) in SQL
  player_id: string; // Corresponds to 'player_id' (text) in SQL
  mop: string; // Corresponds to 'mop' (text) in SQL
  acc_number: string; // Corresponds to 'acc_number' (text) in SQL
  inserted_at: string; // Corresponds to 'inserted_at' (timestamp with time zone) in SQL
}
