// src/features/cards/types.ts

export interface Card {
  id: number; // Corresponds to BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  card_id: string; // Corresponds to UUID UNIQUE NOT NULL DEFAULT gen_random_uuid()
  display_name: string; // Corresponds to TEXT NOT NULL
  box_name: string;     // Corresponds to TEXT NOT NULL
  card_code: string;    // Corresponds to TEXT NOT NULL
  image_name: string | null; // Corresponds to TEXT (nullable)
  inserted_at: string; // Corresponds to TIMESTAMP WITH TIME ZONE NOT NULL
  user_id: string;     // Corresponds to UUID NOT NULL
}

// Type for the input JSON structure
export interface JsonCardInput {
  box_name: string;
  display_name: string;
  card_code: string;
  image_filename: string; // Note: This will map to image_name in the DB
}
