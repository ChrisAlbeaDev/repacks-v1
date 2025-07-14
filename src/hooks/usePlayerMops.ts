import type { PlayerMop } from '../features/players/types';
import { useCrud } from './useCrud';

export const usePlayerMops = (playerId: number | null) => {
  // Conditionally initialize useCrud based on playerId
  // If playerId is null, useCrud will not perform any fetches,
  // and we return default empty/non-loading states.
  if (playerId === null) {
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

  const crudResult = useCrud<PlayerMop>(
    'player_mop',
    'mop',
    true,
    undefined,
    { column: 'player_id', value: playerId }
  );

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