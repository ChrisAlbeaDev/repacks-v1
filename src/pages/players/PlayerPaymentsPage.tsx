import type { PlayerMop } from './types'; // Adjusted path
import { usePlayerMops } from './hooks/usePlayerMops'; // Adjusted path
import { AddModeOfPaymentModal } from './components/AddModeOfPaymentModal'; // Adjusted path
import { EditDeleteModeOfPaymentModal } from './components/EditDeleteModeOfPaymentModal'; // Adjusted path
import { Button } from '../../components/Button'; // Adjusted path
import React, { useState } from 'react';

interface PlayerPaymentsPageProps {
  playerId: string; // Changed to string (UUID)
  playerName: string;
  onBack: () => void;
}

export const PlayerPaymentsPage: React.FC<PlayerPaymentsPageProps> = ({
  playerId,
  playerName,
  onBack,
}) => {
  const [showAddMopModal, setShowAddMopModal] = useState(false);
  const [mopToEdit, setMopToEdit] = useState<PlayerMop | null>(null);

  const {
    playerMops,
    loading: mopsLoading,
    error: mopsError,
    addPlayerMop,
    updatePlayerMop,
    deletePlayerMop,
    clearPlayerMopError,
    refetchPlayerMops,
  } = usePlayerMops(playerId); // Pass string playerId

  const handleOpenAddMopModal = () => {
    setShowAddMopModal(true);
    clearPlayerMopError();
  };

  const handleCloseAddMopModal = () => {
    setShowAddMopModal(false);
    clearPlayerMopError();
  };

  const handleOpenEditMopModal = (mop: PlayerMop) => {
    setMopToEdit(mop);
    clearPlayerMopError();
  };

  const handleCloseEditMopModal = () => {
    setMopToEdit(null);
    clearPlayerMopError();
  };

  return (
    <>
      <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to {playerName}'s Profile
      </Button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {playerName}'s Modes of Payment
      </h2>

      <Button onClick={handleOpenAddMopModal} variant="primary" className="mb-4">
        Add Mode of Payment
      </Button>

      {mopsLoading && <p className="text-center text-gray-600">Loading payments...</p>}
      {mopsError && mopsError.includes('Failed to fetch') ? (
        <p className="text-center text-red-500 text-sm italic mt-2">
          Network Error: Could not connect to the database. Please check your internet connection,
          browser extensions, or try again later. Error: {mopsError}
        </p>
      ) : mopsError ? (
        <p className="text-center text-red-500 text-sm italic mt-2">Error: {mopsError}</p>
      ) : null}

      {!mopsLoading && playerMops.length === 0 && !mopsError && (
        <p className="text-center text-gray-600">No payment methods added yet.</p>
      )}

      <ul className="space-y-3">
        {playerMops.map((mop) => (
          <li
            key={mop.id}
            className="flex items-center justify-between p-3 rounded-md transition duration-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => handleOpenEditMopModal(mop)}
          >
            <span className="text-lg text-gray-800">
              {mop.mop.charAt(0).toUpperCase() + mop.mop.slice(1)}: {mop.acc_number}
            </span>
          </li>
        ))}
      </ul>

      {showAddMopModal && (
        <AddModeOfPaymentModal
          playerId={playerId}
          onClose={handleCloseAddMopModal}
          onAddPlayerMop={addPlayerMop}
          onRefetchPlayerMops={refetchPlayerMops}
          loading={mopsLoading}
          error={mopsError}
          clearError={clearPlayerMopError}
        />
      )}

      {mopToEdit && (
        <EditDeleteModeOfPaymentModal
          mopData={mopToEdit}
          onClose={handleCloseEditMopModal}
          onUpdatePlayerMop={updatePlayerMop}
          onDeletePlayerMop={deletePlayerMop}
          loading={mopsLoading}
          error={mopsError}
          clearError={clearPlayerMopError}
        />
      )}
    </>
  );
};