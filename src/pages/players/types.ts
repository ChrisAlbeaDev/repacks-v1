export interface Player {
  player_id: string; 
  name: string; 
  fullName: string | null; 
  address: string | null; 
  contactNumber: string | null;
  inserted_at: string; 
  user_id: string; 
}

export interface PlayerMop {
  id: number; 
  player_id: string; 
  mop: string; 
  acc_number: string; 
  inserted_at: string; 
}
