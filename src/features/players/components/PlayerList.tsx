import { useState, useEffect } from 'react';
import type { Player } from '../types'; // FIX: Use 'import type' for Player interface
import { Button } from '../../../components/Button'; // Adjust path for generic components
import { PlayerProfileModal } from './PlayerProfileModal'; // NEW: Import the modal component

interface PlayerListProps {
  players: Player[];
  loading: boolean;
  error: string | null;
  // FIX: Change onUpdatePlayer to accept Partial<Player> and return Promise
  onUpdatePlayer: (id: number, updatedFields: Partial<Player>) => Promise<Player | undefined>;
  onDeletePlayer: (id: number) => Promise<void>; // Ensure return type matches useCrud
  onBack: () => void; // Added for the back button
  clearError: () => void; // NEW: Added clearError prop
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, loading, error, onUpdatePlayer, onDeletePlayer, onBack, clearError }) => {
  const [editingPlayerId] = useState<number | null>(null); // This state is now only for inline editing (which we're removing)
  const [editedPlayerName] = useState<string>(''); // This state is now only for inline editing (which we're removing)

  const [showProfileModal, setShowProfileModal] = useState(false); // NEW: State for modal visibility
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null); // NEW: State for selected player

  // Handlers for modal
  const openProfileModal = (player: Player) => {
    setSelectedPlayer(player);
    setShowProfileModal(true);
    clearError(); // Clear any errors when opening modal
  };

  const closeProfileModal = () => {
    setSelectedPlayer(null);
    setShowProfileModal(false);
    clearError(); // Clear any errors when closing modal
  };

  // Clear error when starting edit or adding a new player
  useEffect(() => {
    // This useEffect is less relevant now that edit is in modal, but can keep for general error clearing
    if (editingPlayerId !== null || editedPlayerName === '') {
      clearError();
    }
  }, [editingPlayerId, editedPlayerName, clearError]);


  // handleEditClick, handleSaveEdit, handleCancelEdit are now handled within PlayerProfileModal
  // These can be removed from PlayerList if inline editing is no longer desired.
  // For now, I'll comment them out to show the transition.
  /*
  const handleEditClick = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditedPlayerName(player.name);
    clearError(); // Clear error when starting an edit
  };

  const handleSaveEdit = async (id: number) => { // Make async to await onUpdatePlayer
    if (!editedPlayerName.trim()) {
      clearError(); // Clear error if input is empty
      return;
    }
    // FIX: Pass an object { name: ... } instead of just the string
    await onUpdatePlayer(id, { name: editedPlayerName.trim() });
    setEditingPlayerId(null);
    setEditedPlayerName('');
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditedPlayerName('');
    clearError(); // Clear error when canceling edit
  };
  */

  return (
    <>
      <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to Home
      </Button>

      {loading && players.length === 0 && <p className="text-center text-gray-600">Loading players...</p>}
      {error && <p className="text-center text-red-500 text-sm italic mt-2">{error}</p>} {/* Display error here */}

      {!loading && players.length === 0 && !error && (
        <p className="text-center text-gray-600">No players yet. Add one!</p>
      )}

      <ul className="space-y-3">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between p-3 rounded-md transition duration-200 bg-gray-50"
          >
            {/* Make player name clickable */}
            <span
              className="text-lg text-gray-800 cursor-pointer hover:text-blue-600 hover:underline"
              onClick={() => openProfileModal(player)}
            >
              {player.name}
            </span>
            {/* Edit and Delete buttons are now in the modal, so remove them from here */}
            {/*
            <div className="flex space-x-2">
              <Button
                onClick={() => handleEditClick(player)}
                variant="warning"
                size="sm"
              >
                ✏️ Edit
              </Button>
              <Button
                onClick={() => onDeletePlayer(player.id)}
                variant="danger"
                size="sm"
              >
                🗑️ Delete
              </Button>
            </div>
            */}
          </li>
        ))}
      </ul>

      {showProfileModal && selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={closeProfileModal}
          onUpdatePlayer={onUpdatePlayer}
          onDeletePlayer={onDeletePlayer}
          loading={loading} // Pass loading state for modal's internal operations
          error={error} // Pass error state for modal's internal display
          clearError={clearError} // Pass clearError for modal's internal use
        />
      )}
    </>
  );
};
