// src/features/repacks/hooks/useRepacks.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Repack, RepackPromo, RepackWithPromos, Hit } from '../types'; // Import necessary types
import { Promo } from '../../promos/types'; // Corrected: Import Promo from promos/types

interface UseRepacksProps {
  isAuthenticated: boolean;
  currentUserId: string | null;
}

// Define the expected structure of the joined data from Supabase
// This interface is still useful for clarity, though the direct mapping might change slightly
// with a single join query.
interface RepackPromoJoinResult {
  promo_id: string; // This is the promo_id from the repack_promo join table
  promo: Promo; // This is the actual Promo object, fully typed
}

export const useRepacks = ({ isAuthenticated, currentUserId }: UseRepacksProps) => {
  const [repacks, setRepacks] = useState<Repack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearRepackError = useCallback(() => setError(null), []);

  const fetchRepacks = useCallback(async (userIdToFetch: string | null) => {
    console.log("useRepacks: fetchRepacks called with userId:", userIdToFetch);
    if (!userIdToFetch) {
      setRepacks([]);
      setLoading(false);
      console.log("useRepacks: fetchRepacks - No userIdToFetch, setting loading false.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("useRepacks: fetchRepacks - Starting Supabase query for repacks list.");
      const { data, error: fetchError } = await supabase
        .from('repacks')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (fetchError) {
        console.error("useRepacks: fetchRepacks - Supabase fetch error:", fetchError.message);
        throw fetchError;
      }
      console.log("useRepacks: fetchRepacks - Successfully fetched repacks:", data ? data.length : 0, "items.");
      setRepacks(data || []);
    } catch (err: any) {
      console.error('useRepacks: fetchRepacks - Error fetching repacks:', err.message);
      setError(err.message);
      setRepacks([]);
    } finally {
      setLoading(false);
      console.log("useRepacks: fetchRepacks - Finished, setting loading false.");
    }
  }, []);

  const fetchRepackById = useCallback(async (repackId: string): Promise<RepackWithPromos | null> => {
    console.log("useRepacks: fetchRepackById called for repackId:", repackId);
    if (!currentUserId) {
      setError('Not authenticated. Please log in to view repack details.');
      console.error("useRepacks: fetchRepackById - No currentUserId, returning null.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("useRepacks: fetchRepackById - Starting Supabase query for single repack with joined promos.");
      // Combine queries using dot notation for joins
      const { data, error: fetchError } = await supabase
        .from('repacks')
        .select(`
          *,
          repack_promo!left(
            promo(id, promo_id, title, qty, free, price, inserted_at, user_id)
          )
        `)
        .eq('repacks_id', repackId)
        .eq('user_id', currentUserId)
        .single();

      if (fetchError) {
        console.error("useRepacks: fetchRepackById - Supabase combined fetch error:", fetchError.message);
        throw fetchError;
      }

      if (!data) {
        console.log("useRepacks: fetchRepackById - Repack data not found for ID:", repackId);
        return null;
      }
      console.log("useRepacks: fetchRepackById - Successfully fetched repack and joined data:", data);

      // Extract associated promos from the joined data
      const associatedPromos = data.repack_promo
        ? data.repack_promo.map((rp: any) => rp.promo as Promo).filter((promo: Promo | null) => promo !== null) // Filter out nulls if any
        : [];

      return {
        ...data as Repack, // Cast the main repack data
        associated_promos: associatedPromos,
      };

    } catch (err: any) {
      console.error('useRepacks: fetchRepackById - Caught an error:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
      console.log("useRepacks: fetchRepackById - Finished, setting loading false.");
    }
  }, [currentUserId]);

  const addRepack = useCallback(async (newRepack: Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>) => {
    console.log("useRepacks: addRepack called.");
    if (!currentUserId) {
      setError('Not authenticated. Please log in to add a repack.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const generatedRepackId = crypto.randomUUID();
      console.log("useRepacks: addRepack - Generated repack_id:", generatedRepackId);
      const { data, error: insertError } = await supabase
        .from('repacks')
        .insert({
          ...newRepack,
          repacks_id: generatedRepackId,
          user_id: currentUserId,
        })
        .select();

      if (insertError) {
        throw insertError;
      }
      const addedRepack = data ? data[0] : undefined;
      if (addedRepack) {
        setRepacks((prev) => [addedRepack, ...prev]);
        console.log("useRepacks: addRepack - Successfully added repack:", addedRepack);
      }
      return addedRepack;
    } catch (err: any) {
      console.error('useRepacks: addRepack - Error adding repack:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
      console.log("useRepacks: addRepack - Finished, setting loading false.");
    }
  }, [currentUserId]);

  const updateRepack = useCallback(async (
    repackId: string,
    updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>>
  ) => {
    console.log("useRepacks: updateRepack called for repackId:", repackId);
    if (!currentUserId) {
      setError('Not authenticated. Please log in to update a repack.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('repacks')
        .update(updatedFields)
        .eq('repacks_id', repackId)
        .eq('user_id', currentUserId)
        .select();

      if (updateError) {
        throw updateError;
      }
      const updatedRepack = data ? data[0] : undefined;
      if (updatedRepack) {
        setRepacks((prev) =>
          prev.map((repack) => (repack.repacks_id === repackId ? updatedRepack : repack))
        );
        console.log("useRepacks: updateRepack - Successfully updated repack:", updatedRepack);
      }
      return updatedRepack;
    } catch (err: any) {
      console.error('useRepacks: updateRepack - Error updating repack:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
      console.log("useRepacks: updateRepack - Finished, setting loading false.");
    }
  }, [currentUserId]);

  const deleteRepack = useCallback(async (repackId: string) => {
    console.log("useRepacks: deleteRepack called for repackId:", repackId);
    if (!currentUserId) {
      setError('Not authenticated. Please log in to delete a repack.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('repacks')
        .delete()
        .eq('repacks_id', repackId)
        .eq('user_id', currentUserId);

      if (deleteError) {
        throw deleteError;
      }
      setRepacks((prev) => prev.filter((repack) => repack.repacks_id !== repackId));
      console.log("useRepacks: deleteRepack - Successfully deleted repack:", repackId);
    } catch (err: any) {
      console.error('useRepacks: deleteRepack - Error deleting repack:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("useRepacks: deleteRepack - Finished, setting loading false.");
    }
  }, [currentUserId]);

  // --- Repack-Promo Link Management ---

  const addPromosToRepack = useCallback(async (repackId: string, promoIds: string[]) => {
    console.log("useRepacks: addPromosToRepack called for repackId:", repackId, "and promoIds:", promoIds);
    if (!currentUserId) {
      setError('Not authenticated. Please log in to add promos to a repack.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const linksToInsert = promoIds.map(promoId => ({
        repack_id: repackId,
        promo_id: promoId,
        user_id: currentUserId,
      }));

      const { error: insertError } = await supabase
        .from('repack_promo')
        .upsert(linksToInsert, { onConflict: 'repack_id, promo_id' });

      if (insertError) {
        throw insertError;
      }
      console.log("useRepacks: addPromosToRepack - Successfully added/upserted promo links.");
      fetchRepackById(repackId); // This will update the state for the detailed view
    } catch (err: any) {
      console.error('useRepacks: addPromosToRepack - Error adding promos to repack:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("useRepacks: addPromosToRepack - Finished, setting loading false.");
    }
  }, [currentUserId, fetchRepackById]);

  const removePromoFromRepack = useCallback(async (repackId: string, promoId: string) => {
    console.log("useRepacks: removePromoFromRepack called for repackId:", repackId, "and promoId:", promoId);
    if (!currentUserId) {
      setError('Not authenticated. Please log in to remove a promo from a repack.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('repack_promo')
        .delete()
        .eq('repack_id', repackId)
        .eq('promo_id', promoId)
        .eq('user_id', currentUserId);

      if (deleteError) {
        throw deleteError;
      }
      console.log("useRepacks: removePromoFromRepack - Successfully removed promo link.");
      fetchRepackById(repackId); // This will update the state for the detailed view
    } catch (err: any) {
      console.error('useRepacks: removePromoFromRepack - Error removing promo from repack:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("useRepacks: removePromoFromRepack - Finished, setting loading false.");
    }
  }, [currentUserId, fetchRepackById]);


  useEffect(() => {
    console.log("useRepacks: useEffect [auth state] triggered. isAuthenticated:", isAuthenticated, "currentUserId:", currentUserId);
    if (isAuthenticated && currentUserId) {
      fetchRepacks(currentUserId);
    } else {
      setRepacks([]);
      setLoading(false);
      setError(null);
      console.log("useRepacks: useEffect [auth state] - Not authenticated or no userId, clearing state.");
    }
  }, [isAuthenticated, currentUserId, fetchRepacks]);

  return {
    repacks,
    loading,
    error,
    addRepack,
    updateRepack,
    deleteRepack,
    fetchRepackById,
    addPromosToRepack,
    removePromoFromRepack,
    clearRepackError,
  };
};
