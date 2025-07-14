import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CrudHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  add: (newItem: Omit<T, 'id' | 'inserted_at'>) => Promise<T | undefined>;
  update: (id: number, updatedFields: Partial<T>) => Promise<T | undefined>;
  remove: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

type CreatePayload<T> = Omit<T, 'id' | 'inserted_at'>;

export const useCrud = <T extends { id: number; inserted_at: string }>(
  tableName: string,
  orderByColumn: keyof T = 'id' as keyof T,
  ascending: boolean = true,
  uniqueFieldName?: keyof Omit<T, 'id' | 'inserted_at'>,
  initialFilter?: { column: keyof T; value: any } // Added optional filter
): CrudHookResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from(tableName).select('*');

      if (initialFilter) {
        query = query.eq(initialFilter.column as string, initialFilter.value);
      }

      const { data: fetchedData, error: fetchError } = await query
        .order(orderByColumn as string, { ascending: ascending });

      if (fetchError) {
        throw fetchError;
      }
      setData(fetchedData || []);
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching from ${tableName}:`, err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName, orderByColumn, ascending, initialFilter]); // Added initialFilter to dependencies

  const add = useCallback(async (newItem: CreatePayload<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);

      if (uniqueFieldName) {
        const itemValue = newItem[uniqueFieldName];
        const isDuplicate = data.some(item => (item as any)[uniqueFieldName] === itemValue);
        if (isDuplicate) {
          setError(`A record with the same ${String(uniqueFieldName)} already exists.`);
          setLoading(false);
          return undefined;
        }
      }

      const { data: addedItem, error: addError } = await supabase
        .from(tableName)
        .insert(newItem as any)
        .select();

      if (addError) {
        throw addError;
      }
      if (addedItem && addedItem.length > 0) {
        setData((prevData) => [...prevData, addedItem[0]]);
        return addedItem[0];
      }
      return undefined;
    } catch (err: any) {
      setError(err.message);
      console.error(`Error adding to ${tableName}:`, err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [tableName, data, uniqueFieldName]);

  const update = useCallback(async (id: number, updatedFields: Partial<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);

      if (uniqueFieldName && updatedFields[uniqueFieldName] !== undefined) {
        const updatedValue = updatedFields[uniqueFieldName];
        const isDuplicate = data.some(item =>
          item.id !== id && (item as any)[uniqueFieldName] === updatedValue
        );
        if (isDuplicate) {
          setError(`Another record with the same ${String(uniqueFieldName)} already exists.`);
          setLoading(false);
          return undefined;
        }
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from(tableName)
        .update(updatedFields as any)
        .eq('id', id)
        .select();

      if (updateError) {
        throw updateError;
      }
      if (updatedItem && updatedItem.length > 0) {
        setData((prevData) =>
          prevData.map((item) => (item.id === id ? updatedItem[0] : item))
        );
        return updatedItem[0];
      }
      return undefined;
    } catch (err: any) {
      setError(err.message);
      console.error(`Error updating ${tableName}:`, err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [tableName, data, uniqueFieldName]);

  const remove = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const { error: removeError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (removeError) {
        throw removeError;
      }
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error(`Error deleting from ${tableName}:`, err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, add, update, remove, refetch: fetchData, clearError };
};
