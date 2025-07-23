// src/features/players/components/PlayerList.tsx
import React from 'react';
import { Player } from '../types'; // Adjust path as necessary
import { Button } from '../../../components/Button'; // Adjust path if necessary

// Define valid sort keys for Player
type PlayerSortKey = 'name' | 'fullName' | 'inserted_at' | '';

interface PlayerListProps {
  players: Player[]; // This is now the paginated subset of players
  onViewPlayerProfile: (playerId: string) => void;
  onDeletePlayer: (playerId: string) => Promise<void>;
  isAuthenticated: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortKey: PlayerSortKey;
  onSortChange: (key: PlayerSortKey) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  // New pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  totalPlayersCount: number; // Total count of players after filtering/sorting
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onViewPlayerProfile,
  onDeletePlayer,
  isAuthenticated,
  searchTerm,
  onSearchChange,
  sortKey,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  // Pagination props
  currentPage,
  totalPages,
  onPageChange,
  totalPlayersCount,
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as PlayerSortKey);
  };

  const toggleSortDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Display message if no players found after filtering/searching
  if (totalPlayersCount === 0 && searchTerm) {
    return (
      <div className="text-center text-gray-600 mt-4">
        <p>No players found matching "{searchTerm}".</p>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mt-4">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Sort controls still visible even if no results, in case user wants to change sort */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sortKey" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sortKey"
              value={sortKey}
              onChange={handleSortChange}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inserted_at">Date Added</option>
              <option value="name">Name</option>
              <option value="fullName">Full Name</option>
            </select>
            <Button
              onClick={toggleSortDirection}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              {sortDirection === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If there are players, display the list and pagination controls
  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sortKey" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={handleSortChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="inserted_at">Date Added</option>
            <option value="name">Name</option>
            <option value="fullName">Full Name</option>
          </select>
          <Button
            onClick={toggleSortDirection}
            variant="secondary"
            className="px-3 py-2 text-sm"
          >
            {sortDirection === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
          </Button>
        </div>
      </div>

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
                  disabled={!isAuthenticated}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2 mt-4">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="secondary"
            className="px-4 py-2"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              onClick={() => onPageChange(page)}
              variant={currentPage === page ? 'primary' : 'secondary'}
              className={`px-4 py-2 ${currentPage === page ? 'font-bold' : ''}`}
            >
              {page}
            </Button>
          ))}
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="secondary"
            className="px-4 py-2"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
};
