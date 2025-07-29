// src/features/repacks/types.ts

import { Card } from '../cards/types'; // Assuming Card type is defined here or similar path
import { Promo } from '../promos/types'; // NEW: Import Promo type

export interface Repack {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  repacks_id: string; // UUID UNIQUE NOT NULL
  title: string; // TEXT NOT NULL
  date: string; // DATE NOT NULL (store as 'YYYY-MM-DD')
  quantity: number; // INTEGER NOT NULL
  price: number; // NUMERIC(10, 2) NOT NULL
  status: string; // TEXT NOT NULL (e.g., 'available', 'sold', 'draft')
  inserted_at: string; // TIMESTAMP WITH TIME ZONE NOT NULL
  user_id: string; // UUID NOT NULL
}

export interface RepackPromo {
  repack_id: string; // UUID NOT NULL (FK to repacks.repacks_id)
  promo_id: string; // UUID NOT NULL (FK to promo.promo_id)
  inserted_at: string; // TIMESTAMP WITH TIME ZONE NOT NULL
  user_id: string; // UUID NOT NULL
}

// For displaying a repack with its associated promos
export interface RepackWithPromos extends Repack {
  associated_promos?: Promo[]; // Array of Promo objects (fetched via join)
}

// For displaying a repack with its associated hits
export interface RepackWithHits extends Repack {
  hits?: Hit[]; // Array of Hit objects (fetched via join)
}

export interface Hit {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  repacks_id: string; // UUID NOT NULL (FK to repacks.repacks_id)
  type: string; // TEXT NOT NULL (e.g., 'common', 'rare', 'secret rare')
  card_id: string; // UUID NOT NULL (FK to cards.card_id)
  slot: string; // TEXT NOT NULL (e.g., '1st slot', 'pull slot')
  player_id: string; // UUID NOT NULL (FK to players.player_id)
  inserted_at: string; // TIMESTAMP WITH TIME ZONE NOT NULL
  user_id: string; // UUID NOT NULL
  // Optionally, if you want to embed card details directly:
  card?: Card; // The actual card object
}


