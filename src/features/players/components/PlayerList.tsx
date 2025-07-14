import { useState, useEffect } from 'react';
import type { Player } from '../types'; 
import { Button } from '../../../components/Button'; 

interface PlayerListProps {
  players: Player[];
  loading: boolean;
  error: string | null;
  onUpdatePlayer: (id: number, updatedFields: Partial<Player>) => Promise<Player | undefined>;
  onDeletePlayer: (id: number) => Promise<void>;
  onBack: () => void;
  clearError: () => void;
  onViewPlayer: (playerId: number) => void; 
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, loading, error, onUpdatePlayer, onDeletePlayer, onBack, clearError, onViewPlayer }) => {
  

  useEffect(() => {
    
    clearError(); 
  }, [clearError]);

  return (
    <>
      <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to Home
      </Button>

      {loading && players.length === 0 && <p className="text-center text-gray-600">Loading players...</p>}
      {error && <p className="text-center text-red-500 text-sm italic mt-2">{error}</p>}

      {!loading && players.length === 0 && !error && (
        <p className="text-center text-gray-600">No players yet. Add one!</p>
      )}

      <ul className="space-y-3">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between p-3 rounded-md transition duration-200 bg-gray-50"
          >
           
            <span
              className="text-lg text-gray-800 cursor-pointer hover:text-blue-600 hover:underline"
              onClick={() => onViewPlayer(player.id)} 
            >
              {player.name}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};
