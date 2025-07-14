import type { Player } from '../features/players/types'; 
import { useCrud } from './useCrud';

export const usePlayers = () => {
 
  const { data, loading, error, add, update, remove, refetch, clearError } = useCrud<Player>('players', 'name', true, 'name');

  return {
    players: data,
    loading,
    error,
    addPlayer: add,
    updatePlayer: update,
    deletePlayer: remove,
    refetchPlayers: refetch,
    clearPlayerError: clearError, 
  };
};
