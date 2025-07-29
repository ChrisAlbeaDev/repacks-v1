// src/features/promos/hooks/usePromos.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Promo } from '../types';

interface UsePromosProps {
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export const usePromos = ({ isAuthenticated, currentUserId }: UsePromosProps) => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearPromoError = useCallback(() => setError(null), []);

  const fetchPromos = useCallback(async (userIdToFetch: string | null) => {
    console.log("fetchPromos called with userId:", userIdToFetch);
    if (!userIdToFetch) {
      setPromos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('promo') // Correct table name 'promo'
        .select('*')
        .order('inserted_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setPromos(data || []);
    } catch (err: any) {
      console.error('Error fetching promos:', err.message);
      setError(err.message);
      setPromos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPromoById = useCallback(async (promoId: string): Promise<Promo | null> => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to view promo details.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('promo')
        .select('*')
        .eq('promo_id', promoId)
        .eq('user_id', currentUserId)
        .single();

      if (fetchError) {
        throw fetchError;
      }
      return data as Promo;
    } catch (err: any) {
      console.error('Error fetching promo by ID:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const addPromo = useCallback(async (newPromo: Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to add a promo.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const generatedPromoId = crypto.randomUUID();
      const { data, error: insertError } = await supabase
        .from('promo')
        .insert({
          ...newPromo,
          promo_id: generatedPromoId,
          user_id: currentUserId,
        })
        .select();

      if (insertError) {
        throw insertError;
      }
      const addedPromo = data ? data[0] : undefined;
      if (addedPromo) {
        setPromos((prev) => [addedPromo, ...prev]);
      }
      return addedPromo;
    } catch (err: any) {
      console.error('Error adding promo:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const updatePromo = useCallback(async (
    promoId: string,
    updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>>
  ) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to update a promo.');
      return undefined;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('promo')
        .update(updatedFields)
        .eq('promo_id', promoId)
        .eq('user_id', currentUserId)
        .select();

      if (updateError) {
        throw updateError;
      }
      const updatedPromo = data ? data[0] : undefined;
      if (updatedPromo) {
        setPromos((prev) =>
          prev.map((promo) => (promo.promo_id === promoId ? updatedPromo : promo))
        );
      }
      return updatedPromo;
    } catch (err: any) {
      console.error('Error updating promo:', err.message);
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const deletePromo = useCallback(async (promoId: string) => {
    if (!currentUserId) {
      setError('Not authenticated. Please log in to delete a promo.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('promo')
        .delete()
        .eq('promo_id', promoId)
        .eq('user_id', currentUserId);

      if (deleteError) {
        throw deleteError;
      }
      setPromos((prev) => prev.filter((promo) => promo.promo_id !== promoId));
    } catch (err: any) {
      console.error('Error deleting promo:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      fetchPromos(currentUserId);
    } else {
      setPromos([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, currentUserId, fetchPromos]);

  return {
    promos,
    loading,
    error,
    addPromo,
    updatePromo,
    deletePromo,
    fetchPromoById,
    clearPromoError,
  };
};
