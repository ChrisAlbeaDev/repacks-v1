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
  }, []);

  useEffect(() => {
    console.log("usePlayers: useEffect [auth state] triggered. isAuthenticated:", isAuthenticated, "currentUserId:", currentUserId);
    if (isAuthenticated && currentUserId) {
      fetchPlayers(currentUserId);
    } else {
      setPlayers([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, currentUserId, fetchPlayers]);

  const addPlayer = useCallback(async (newPlayer: Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to add a player.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      // Generate a new UUID for player_id on the client side
      const generatedPlayerId = crypto.randomUUID();
      console.log("Generated player_id:", generatedPlayerId);
      console.log("addPlayer: Attempting to insert with currentUserId:", currentUserId); // NEW DIAGNOSTIC LOG

      const { data, error: insertError } = await supabase
        .from('players')
        .insert({
          ...newPlayer,
          player_id: generatedPlayerId, // Include the generated player_id
          user_id: currentUserId // Ensure this is the correct user ID
        })
        .select();

      if (insertError) {
        throw insertError;
      }
      const addedPlayer = data ? data[0] : undefined;
      if (addedPlayer) {
        setPlayers((prev) => [addedPlayer, ...prev]);
      }
      return addedPlayer;
    } catch (err: any) {
      console.error('Error adding player:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Function to update an existing player, now accepting an optional profilePicFile
  const updatePlayer = useCallback(async (
    playerId: string,
    updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>>,
    profilePicFile: File | null, // New parameter for profile picture file
    shouldClearProfilePic: boolean // New parameter to explicitly signal clearing
  ) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to update a player.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    let newProfilePicUrl: string | null = null; // Changed to null to align with type 'string | null'

    try {
      if (profilePicFile) {
        const fileExtension = profilePicFile.name.split('.').pop();
        const filePath = `${currentUserId}/${playerId}.${fileExtension}`; // Unique path per player per user
        const bucketName = 'profile-pics'; // Define your Supabase Storage bucket name

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, profilePicFile, {
            cacheControl: '3600',
            upsert: true, // Overwrite if file with same name exists
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData) {
          newProfilePicUrl = publicUrlData.publicUrl;
          console.log("Profile picture uploaded. Public URL:", newProfilePicUrl);
        }
      } else if (shouldClearProfilePic) {
        // If profilePicFile is null AND shouldClearProfilePic is true,
        // it means the user explicitly cleared the profile picture in the UI.
        newProfilePicUrl = null;
      }
      // If profilePicFile is null AND shouldClearProfilePic is false,
      // newProfilePicUrl remains null (its initial value), meaning no change to the URL in DB.


      // Prepare fields for database update
      const fieldsToUpdate: Partial<Player> = { ...updatedFields };
      // Only add profile_pic_url to update if it was changed or explicitly cleared
      // The condition `newProfilePicUrl !== null` is now sufficient because
      // it's either the new URL, or explicitly null if cleared, or still null if no change.
      // If it's still null and there was no explicit clear, we don't include it in update.
      if (profilePicFile || shouldClearProfilePic) { // If a file was selected OR explicit clear was requested
        fieldsToUpdate.profile_pic_url = newProfilePicUrl;
      }


      // Update the player record in the database
      const { data, error: updateError } = await supabase
        .from('players')
        .update(fieldsToUpdate)
        .eq('player_id', playerId)
        .eq('user_id', currentUserId) // This is the crucial part for RLS
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
      console.error('Error updating player or uploading profile pic:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const deletePlayer = useCallback(async (playerId: string) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to delete a player.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch player to get profile_pic_url before deleting record
      const { data: playerToDelete, error: fetchPlayerError } = await supabase
        .from('players')
        .select('profile_pic_url')
        .eq('player_id', playerId)
        .eq('user_id', currentUserId)
        .single();

      if (fetchPlayerError && fetchPlayerError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchPlayerError;
      }

      // Delete the player record
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('player_id', playerId)
        .eq('user_id', currentUserId);

      if (deleteError) {
        throw deleteError;
      }

      // If there was a profile picture, delete it from storage
      if (playerToDelete?.profile_pic_url) {
        const urlParts = playerToDelete.profile_pic_url.split('/');
        const fileName = urlParts.pop(); // Get the file name (e.g., player_id.jpg)
        const userIdSegment = urlParts.pop(); // Get the user ID segment
        const bucketName = 'profile-pics'; // Your bucket name

        if (fileName && userIdSegment) {
          const filePath = `${userIdSegment}/${fileName}`;
          console.log("Attempting to delete profile pic from storage:", filePath);
          const { error: deleteStorageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (deleteStorageError) {
            console.warn('Warning: Could not delete profile picture from storage:', deleteStorageError.message);
            // Don't throw, as the player record itself was deleted successfully
          }
        }
      }

      setPlayers((prev) => prev.filter((player) => player.player_id !== playerId));
    } catch (err: any) {
      console.error('Error deleting player or profile pic:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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
