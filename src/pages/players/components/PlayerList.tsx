// src/features/players/components/PlayerList.tsx
import React from 'react';
import { Player } from '../types'; // Adjust path as necessary
import { Button } from '../../../components/Button'; // Adjust path if necessary

interface PlayerListProps {
  players: Player[];
  onViewPlayerProfile: (playerId: string) => void;
  onDeletePlayer: (playerId: string) => Promise<void>; // Prop for deleting a player
  isAuthenticated: boolean; // Prop to control delete button visibility/disability
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onViewPlayerProfile,
  onDeletePlayer,
  isAuthenticated,
}) => {
  if (players.length === 0) {
    return null; // Or a message like "No players to display" handled in parent
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Name</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Full Name</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Contact</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.player_id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-800">{player.name}</td>
              <td className="py-3 px-4 text-gray-600">{player.fullName || 'N/A'}</td>
              <td className="py-3 px-4 text-gray-600">{player.contactNumber || 'N/A'}</td>
              <td className="py-3 px-4 flex space-x-2">
                <Button
                  onClick={() => onViewPlayerProfile(player.player_id)}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  View
                </Button>
                <Button
                  onClick={() => onDeletePlayer(player.player_id)}
                  variant="danger"
                  className="text-sm px-3 py-1"
                  disabled={!isAuthenticated} // Disable delete if not authenticated
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
