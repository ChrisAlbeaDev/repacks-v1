// src/pages/PlayersPage.tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PlayerList } from '../pages/players/components/PlayerList';
import { AddPlayerModal } from '../pages/players/components/AddPlayerModal';
import { Player } from '../pages/players/types'; // Import Player type

interface PlayersPageProps {
  onBack: () => void;
  onViewPlayerProfile: (playerId: string) => void;
  isAuthenticated: boolean;
  authError: string | null;
  // Props received from usePlayers hook in App.tsx
  players: Player[];
  loading: boolean;
  error: string | null;
  addPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  deletePlayer: (playerId: string) => Promise<void>;
  clearPlayerError: () => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({
  onBack,
  onViewPlayerProfile,
  isAuthenticated,
  authError,
  players,
  loading,
  error,
  addPlayer,
  deletePlayer,
  clearPlayerError,
}) => {
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  const handleOpenAddPlayerModal = () => {
    setShowAddPlayerModal(true);
    clearPlayerError(); // Clear any previous errors when opening the modal
  };

  const handleCloseAddPlayerModal = () => {
    setShowAddPlayerModal(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Players</h2>

      {/* Display authentication error if present and not authenticated */}
      {!isAuthenticated && authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Authentication Error:</strong>
          <span className="block sm:inline"> {authError}</span>
          <p className="text-xs mt-1">Player management requires an authenticated session.</p>
        </div>
      )}

      {/* Add Player Button - Disabled if not authenticated */}
      <Button
        onClick={handleOpenAddPlayerModal}
        variant="primary"
        className="w-full"
        disabled={!isAuthenticated}
      >
        Add New Player
      </Button>

      {/* Optional: Message if button is disabled */}
      {!isAuthenticated && (
        <p className="text-center text-gray-500 text-sm italic">
          Sign in to add and manage players.
        </p>
      )}

      {loading && players.length === 0 && <p className="text-center text-gray-600">Loading players...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && players.length === 0 && !error && (
        <p className="text-center text-gray-600">No players found. Add one to get started!</p>
      )}

      <PlayerList
        players={players}
        onViewPlayerProfile={onViewPlayerProfile}
        onDeletePlayer={deletePlayer}
        isAuthenticated={isAuthenticated}
      />

      <Button onClick={onBack} variant="secondary" className="w-full">
        Back to Home
      </Button>

      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={handleCloseAddPlayerModal}
          onAddPlayer={addPlayer}
          loading={loading}
          error={error}
          clearError={clearPlayerError}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};
