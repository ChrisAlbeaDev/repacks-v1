import type { PlayerMop } from '../types'; // Adjusted path
import { useCrud } from '../../../hooks/useCrud';
import { useEffect } from 'react';

export const usePlayerMops = (playerId: string | null) => { // playerId is now a string (UUID)
  if (playerId === null) {
    console.log("usePlayerMops: Player ID is null, returning default empty state.");
    return {
      playerMops: [],
      loading: false,
      error: null,
      addPlayerMop: async () => undefined,
      updatePlayerMop: async () => undefined,
      deletePlayerMop: async () => {},
      refetchPlayerMops: async () => {},
      clearPlayerMopError: () => {},
    };
  }

  console.log(`usePlayerMops: Initializing for player ID: ${playerId}`);
  // useCrud for 'player_mop' still uses 'id' (number) as its primary key
  // Explicitly pass 'mop' as the orderByColumn
  const crudResult = useCrud<PlayerMop, number, 'id'>(
    'player_mop',
    'id', // The primary key column for player_mop is 'id' (number)
    'mop', // Explicitly pass 'mop' as orderByColumn
    true,
    undefined,
    { column: 'player_id', value: playerId } // The filter column is player_id (string)
  );

  useEffect(() => {
    console.log(`usePlayerMops: Player Mops data changed for player ${playerId}:`, crudResult.data);
    if (crudResult.error) {
      console.error(`usePlayerMops: Error for player ${playerId}:`, crudResult.error);
    }
  }, [crudResult.data, crudResult.error, playerId]);


  return {
    playerMops: crudResult.data,
    loading: crudResult.loading,
    error: crudResult.error,
    addPlayerMop: crudResult.add,
    updatePlayerMop: crudResult.update,
    deletePlayerMop: crudResult.remove,
    refetchPlayerMops: crudResult.refetch,
    clearPlayerMopError: crudResult.clearError,
  };
};