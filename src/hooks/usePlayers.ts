import type { Player } from '../features/players/types'; // FIX: Use 'import type' for Player interface
import { useCrud } from './useCrud'; // Import the generic useCrud hook

export const usePlayers = () => {
  // Use the generic useCrud hook for the 'players' table, ordering by 'name'
  // NEW: Pass 'name' as the unique field name for validation
  const { data, loading, error, add, update, remove, refetch, clearError } = useCrud<Player>('players', 'name', true, 'name');

  // Expose the results with player-specific names
  return {
    players: data,
    loading,
    error,
    addPlayer: add,
    updatePlayer: update,
    deletePlayer: remove,
    refetchPlayers: refetch,
    clearPlayerError: clearError, // Expose clearError for specific entity
  };
};
