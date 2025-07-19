// src/features/players/hooks/usePlayers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Player } from '../types';

interface UsePlayersProps {
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export const usePlayers = ({ isAuthenticated, currentUserId }: UsePlayersProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearPlayerError = useCallback(() => setError(null), []);

  // Memoize fetchPlayers to prevent unnecessary re-creations
  const fetchPlayers = useCallback(async (userIdToFetch: string | null) => {
    console.log("fetchPlayers called with userId:", userIdToFetch); // Diagnostic log
    if (!userIdToFetch) {
      console.log("No userIdToFetch, clearing players and setting loading to false."); // Diagnostic log
      setPlayers([]); // Clear players if no user is logged in
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // RLS policies should handle filtering by user_id, so we just select all
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .order('inserted_at', { ascending: false }); // Order by creation date

      if (fetchError) {
        throw fetchError;
      }
      console.log("Fetched players data:", data); // Diagnostic log
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Error fetching players:', err.message);
      setError(err.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as it takes userIdToFetch as argument

  // Effect to handle initial session and subscribe to auth changes
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    console.log("usePlayers: useEffect [initial] mounted."); // Diagnostic log

    // Initial session fetch
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession(); // Corrected: use getSession()
        if (isMounted) {
          console.log("Initial session fetched:", session?.user?.id); // Diagnostic log
          // setUserId(session?.user?.id || null); // This line is no longer needed here as userId is a prop
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching initial Supabase session:", err.message);
          setError(err.message);
          setLoading(false); // Stop loading if initial session fetch fails
        }
      }
    };

    getInitialSession();

    // Subscribe to ongoing auth state changes
    // This part is now handled by App.tsx passing down isAuthenticated and currentUserId
    // so this specific subscription within usePlayers is redundant if App.tsx is the source of truth for auth state.
    // However, if you want usePlayers to be more self-contained for auth state, keep it.
    // For now, let's rely on props from App.tsx as per the last fix.
    // Removing the subscription from here to simplify and avoid potential race conditions
    // as App.tsx is already handling auth state and passing it down.

    return () => {
      isMounted = false;
      console.log("usePlayers: useEffect [initial] unmounted."); // Diagnostic log
    };
  }, []); // Run once on mount

  // Effect to re-fetch players whenever isAuthenticated or currentUserId changes
  useEffect(() => {
    console.log("usePlayers: useEffect [auth state] triggered. isAuthenticated:", isAuthenticated, "currentUserId:", currentUserId); // Diagnostic log
    if (isAuthenticated && currentUserId) {
      fetchPlayers(currentUserId);
    } else {
      // If not authenticated or no user ID, clear players and stop loading
      setPlayers([]);
      setLoading(false);
      setError(null); // Clear any previous errors when logging out
    }
  }, [isAuthenticated, currentUserId, fetchPlayers]); // Depend on auth state and memoized fetchPlayers

  // Function to add a new player
  const addPlayer = useCallback(async (newPlayer: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to add a player.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      // Generate a new UUID for player_id on the client side
      const generatedPlayerId = crypto.randomUUID();
      console.log("Generated player_id:", generatedPlayerId); // Diagnostic log

      const { data, error: insertError } = await supabase
        .from('players')
        .insert({
          ...newPlayer,
          player_id: generatedPlayerId, // Include the generated player_id
          user_id: currentUserId
        })
        .select();

      if (insertError) {
        throw insertError;
      }
      const addedPlayer = data ? data[0] : undefined;
      if (addedPlayer) {
        setPlayers((prev) => [addedPlayer, ...prev]); // Add to the beginning of the list
      }
      return addedPlayer;
    } catch (err: any) {
      console.error('Error adding player:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]); // Depend on currentUserId

  // Function to update an existing player
  const updatePlayer = useCallback(async (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>>) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to update a player.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      // RLS should ensure only the owner can update
      const { data, error: updateError } = await supabase
        .from('players')
        .update(updatedFields)
        .eq('player_id', playerId)
        .eq('user_id', currentUserId) // Explicitly filter by user_id for safety with RLS
        .select();

      if (updateError) {
        throw updateError;
      }
      const updatedPlayer = data ? data[0] : undefined;
      if (updatedPlayer) {
        setPlayers((prev) =>
          prev.map((player) => (player.player_id === playerId ? updatedPlayer : player))
        );
      }
      return updatedPlayer;
    } catch (err: any) {
      console.error('Error updating player:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]); // Depend on currentUserId

  // Function to delete a player
  const deletePlayer = useCallback(async (playerId: string) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to delete a player.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // RLS should ensure only the owner can delete
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('player_id', playerId)
        .eq('user_id', currentUserId); // Explicitly filter by user_id for safety with RLS

      if (deleteError) {
        throw deleteError;
      }
      setPlayers((prev) => prev.filter((player) => player.player_id !== playerId));
    } catch (err: any) {
      console.error('Error deleting player:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]); // Depend on currentUserId

  return {
    players,
    loading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    clearPlayerError,
  };
};
