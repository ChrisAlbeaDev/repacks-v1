// src/features/promos/types.ts

export interface Promo {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  promo_id: string; // UUID UNIQUE NOT NULL
  title: string; // TEXT NOT NULL
  qty: number; // INTEGER NOT NULL
  free: string | null; // TEXT (nullable)
  price: number; // NUMERIC(10, 2) NOT NULL
  inserted_at: string; // TIMESTAMP WITH TIME ZONE NOT NULL
  user_id: string; // UUID NOT NULL
}
