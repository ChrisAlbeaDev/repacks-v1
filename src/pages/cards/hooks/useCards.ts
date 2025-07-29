// src/features/cards/hooks/useCards.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path if necessary
import { Card, JsonCardInput } from '../types'; // Import Card and JsonCardInput types

interface UseCardsProps {
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export const useCards = ({ isAuthenticated, currentUserId }: UseCardsProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCardError = useCallback(() => setError(null), []);

  const fetchCards = useCallback(async (userIdToFetch: string | null) => {
    console.log("fetchCards called with userId:", userIdToFetch);
    if (!userIdToFetch) {
      console.log("No userIdToFetch, clearing cards and setting loading to false.");
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // RLS policies should handle filtering by user_id
      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .order('inserted_at', { ascending: false }); // Order by creation date

      if (fetchError) {
        throw fetchError;
      }
      console.log("Fetched cards data:", data);
      setCards(data || []);
    } catch (err: any) {
      console.error('Error fetching cards:', err.message);
      setError(err.message);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // New: Function to fetch a single card by its card_id
  const fetchCardById = useCallback(async (cardId: string) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to view card details.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', currentUserId) // Ensure only owner can fetch
        .single(); // Expecting a single result

      if (fetchError) {
        throw fetchError;
      }
      return data as Card;
    } catch (err: any) {
      console.error('Error fetching card by ID:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);


  useEffect(() => {
    console.log("useCards: useEffect [auth state] triggered. isAuthenticated:", isAuthenticated, "currentUserId:", currentUserId);
    if (isAuthenticated && currentUserId) {
      fetchCards(currentUserId);
    } else {
      setCards([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, currentUserId, fetchCards]);

  // Function to upload JSON data and insert cards
  const uploadJsonCards = useCallback(async (jsonData: JsonCardInput[]) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to upload cards.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const cardsToInsert = jsonData.map(item => ({
        card_id: crypto.randomUUID(), // Generate unique UUID for each card
        display_name: item.display_name,
        box_name: item.box_name,
        card_code: item.card_code,
        image_name: item.image_filename || null, // Map filename to image_name
        user_id: currentUserId,
      }));

      console.log("Attempting to insert cards:", cardsToInsert);

      const { data, error: insertError } = await supabase
        .from('cards')
        .insert(cardsToInsert)
        .select(); // Select the newly inserted rows

      if (insertError) {
        throw insertError;
      }

      const addedCards = data || [];
      if (addedCards.length > 0) {
        setCards((prev) => [...addedCards, ...prev]); // Add new cards to the top of the list
      }
      return addedCards;
    } catch (err: any) {
      console.error('Error uploading cards:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // New: Function to update an existing card
  const updateCard = useCallback(async (
    cardId: string,
    updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>
  ) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to update a card.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('cards')
        .update(updatedFields)
        .eq('card_id', cardId)
        .eq('user_id', currentUserId) // Ensure user owns the card for update
        .select();

      if (updateError) {
        throw updateError;
      }
      const updatedCard = data ? data[0] : undefined;
      if (updatedCard) {
        setCards((prev) =>
          prev.map((card) => (card.card_id === cardId ? updatedCard : card))
        );
      }
      return updatedCard;
    } catch (err: any) {
      console.error('Error updating card:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const deleteCard = useCallback(async (cardId: string) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to delete a card.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('card_id', cardId)
        .eq('user_id', currentUserId); // Ensure user owns the card

      if (deleteError) {
        throw deleteError;
      }

      setCards((prev) => prev.filter((card) => card.card_id !== cardId));
    } catch (err: any) {
      console.error('Error deleting card:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  return {
    cards,
    loading,
    error,
    uploadJsonCards,
    deleteCard,
    updateCard, // Export the new updateCard function
    fetchCardById, // Export the new fetchCardById function
    clearCardError,
  };
};
