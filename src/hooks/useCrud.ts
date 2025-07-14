import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust path if needed

// --- Generic useCrud Hook ---
// src/hooks/useCrud.ts
// This hook provides generic CRUD operations for any Supabase table.
// T represents the type of the entity (e.g., Player, Card, Event)
// K represents the type of the data sent for creation/update (often a subset of T)
interface CrudHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  add: (newItem: Omit<T, 'id' | 'inserted_at'>) => Promise<T | undefined>; // Omit auto-generated fields
  update: (id: number, updatedFields: Partial<T>) => Promise<T | undefined>;
  remove: (id: number) => Promise<void>;
  refetch: () => Promise<void>; // Added refetch capability
  clearError: () => void; // Added function to clear error manually
}

// Omit 'id' and 'inserted_at' from the type for creation payloads
type CreatePayload<T> = Omit<T, 'id' | 'inserted_at'>;

export const useCrud = <T extends { id: number; inserted_at: string }>(
  tableName: string,
  orderByColumn: keyof T = 'id' as keyof T, // Default order by 'id'
  ascending: boolean = true,
  uniqueFieldName?: keyof Omit<T, 'id' | 'inserted_at'> // NEW: Optional field name for uniqueness check
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
      setError(null); // Clear previous errors on new fetch
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order(orderByColumn as string, { ascending: ascending }); // Type assertion for order

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
  }, [tableName, orderByColumn, ascending]); // Dependencies for useCallback

  const add = useCallback(async (newItem: CreatePayload<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors on new add attempt

      // NEW: Duplicate name validation
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
        .insert(newItem as any) // Type assertion for insert payload
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
  }, [tableName, data, uniqueFieldName]); // Added 'data' and 'uniqueFieldName' to dependencies

  const update = useCallback(async (id: number, updatedFields: Partial<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors on new update attempt

      // NEW: Duplicate name validation for update (if unique field is being updated)
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
        .update(updatedFields as any) // Type assertion for update payload
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
  }, [tableName, data, uniqueFieldName]); // Added 'data' and 'uniqueFieldName' to dependencies

  const remove = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors on new remove attempt
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
  }, [fetchData]); // Initial data fetch

  return { data, loading, error, add, update, remove, refetch: fetchData, clearError };
};
