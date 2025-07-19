import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjusted path

// Make CrudHookResult generic over the ID type
interface CrudHookResult<T, IdType, IdColumnName extends keyof T> { // Added IdColumnName to generics
  data: T[];
  loading: boolean;
  error: string | null;
  // Simplified: Omit the specific primary key column and 'inserted_at'
  add: (newItem: Omit<T, IdColumnName | 'inserted_at'>) => Promise<T | undefined>;
  update: (id: IdType, updatedFields: Partial<T>) => Promise<T | undefined>;
  remove: (id: IdType) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Helper type to correctly omit the primary key based on IdColumnName
type CreatePayload<T, IdColumnName extends keyof T> = Omit<T, 'inserted_at' | IdColumnName>;


// Update useCrud to accept IdType for the primary key and IdColumnName for the column name
export const useCrud = <T extends { inserted_at: string }, IdType, IdColumnName extends keyof T>(
  tableName: string,
  idColumn: IdColumnName, // The actual column name for the primary key (e.g., 'id' or 'player_id')
  orderByColumn: keyof T, // Column to order results by - REMOVED DEFAULT HERE
  ascending: boolean = true,
  uniqueFieldName?: keyof Omit<T, 'inserted_at' | IdColumnName>, // Unique field excludes the primary key and inserted_at
  initialFilter?: { column: keyof T; value: any }
): CrudHookResult<T, IdType, IdColumnName> => { // Pass all generic types to CrudHookResult
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
        // Log the filter being applied for debugging
        console.log(`useCrud: Applying filter to ${tableName}: ${String(initialFilter.column)} = ${initialFilter.value}`);
        query = query.eq(initialFilter.column as string, initialFilter.value);
      }

      const { data: fetchedData, error: fetchError } = await query
        .order(orderByColumn as string, { ascending: ascending });

      if (fetchError) {
        // Log the specific fetch error details
        console.error(`useCrud: Supabase fetch error for ${tableName}:`, fetchError.message, fetchError.details, fetchError.hint);
        throw fetchError;
      }
      setData(fetchedData || []);
    } catch (err: any) {
      setError(err.message);
      console.error(`useCrud: Error fetching from ${tableName}:`, err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName, orderByColumn, ascending, initialFilter]);

  const add = useCallback(async (newItem: CreatePayload<T, IdColumnName>): Promise<T | undefined> => {
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

  const update = useCallback(async (id: IdType, updatedFields: Partial<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);

      if (uniqueFieldName && updatedFields[uniqueFieldName] !== undefined) {
        const updatedValue = updatedFields[uniqueFieldName];
        const isDuplicate = data.some(item =>
          (item as any)[idColumn] !== id && (item as any)[uniqueFieldName] === updatedValue
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
        .eq(idColumn as string, id) // Use idColumn for update
        .select();

      if (updateError) {
        throw updateError;
      }
      if (updatedItem && updatedItem.length > 0) {
        setData((prevData) =>
          prevData.map((item) => ((item as any)[idColumn] === id ? updatedItem[0] : item))
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
  }, [tableName, data, uniqueFieldName, idColumn]); // Add idColumn to dependencies

  const remove = useCallback(async (id: IdType): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const { error: removeError } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn as string, id); // Use idColumn for remove

      if (removeError) {
        throw removeError;
      }
      setData((prevData) => prevData.filter((item) => (item as any)[idColumn] !== id));
    } catch (err: any) {
      setError(err.message);
      console.error(`Error deleting from ${tableName}:`, err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName, idColumn]); // Add idColumn to dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, add, update, remove, refetch: fetchData, clearError };
};