export interface Player {
  id: number;
  name: string;
  fullName: string | null;
  address: string | null;
  contactNumber: string | null;
  inserted_at: string;
}

export interface PlayerMop {
  id: number;
  player_id: number;
  mop: 'gcash' | 'maya' | 'bank transfer';
  acc_number: string;
  inserted_at: string;
}