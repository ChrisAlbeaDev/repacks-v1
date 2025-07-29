// src/pages/RepacksPage.tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { RepackList } from '../pages/repacks/components/RepackList';
import { AddRepackModal } from '../pages/repacks/components/AddRepackModal';
import { RepackInfoPage } from '../pages/repacks/RepackInfoPage';
import { useRepacks } from '../pages/repacks/hooks/useRepacks';
import { usePromos } from '../pages/promos/hooks/usePromos'; // Import usePromos to get allPromos
import { Promo } from '../pages/promos/types'; // Import Promo type

interface RepacksPageProps {
  onBack: () => void;
  onViewGame: (repackId: string) => void; // New prop for game view
  isAuthenticated: boolean;
  authError: string | null;
  currentUserId: string | null;
  allPromos: Promo[]; // All promos from App.tsx (for ManageRepackPromosModal)
  promosLoading: boolean; // Loading state for allPromos
  promosError: string | null; // Error state for allPromos
  clearPromoError: () => void; // Clear error for allPromos
}

export const RepacksPage: React.FC<RepacksPageProps> = ({
  onBack,
  onViewGame, // Destructure new prop
  isAuthenticated,
  authError,
  currentUserId,
  allPromos,
  promosLoading,
  promosError,
  clearPromoError,
}) => {
  const [selectedRepackId, setSelectedRepackId] = useState<string | null>(null);
  const [showAddRepackModal, setShowAddRepackModal] = useState(false);

  // Diagnostic log: Check if onViewGame is received correctly
  console.log("RepacksPage: onViewGame prop received:", onViewGame);

  const {
    repacks,
    loading,
    error,
    addRepack,
    updateRepack,
    deleteRepack,
    fetchRepackById,
    addPromosToRepack,
    removePromoFromRepack,
    clearRepackError,
  } = useRepacks({ isAuthenticated, currentUserId });

  const handleViewRepackDetails = (repackId: string) => {
    setSelectedRepackId(repackId);
  };

  const handleBackToRepacksList = () => {
    setSelectedRepackId(null);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Repacks Management</h2>

      {!isAuthenticated && authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Authentication Error:</strong>
          <span className="block sm:inline"> {authError}</span>
          <p className="text-xs mt-1">Repack management requires an authenticated session.</p>
        </div>
      )}

      {!selectedRepackId && ( // Only show Add Repack button on the list view
        <Button
          onClick={() => { setShowAddRepackModal(true); clearRepackError(); }}
          variant="primary"
          className="w-full"
          disabled={!isAuthenticated || loading}
        >
          Add New Repack
        </Button>
      )}

      {loading && repacks.length === 0 && <p className="text-center text-gray-600">Loading repacks...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && repacks.length === 0 && !error && !selectedRepackId && (
        <p className="text-center text-gray-600">No repacks found. Add one to get started!</p>
      )}

      {selectedRepackId ? (
        <RepackInfoPage
          repackId={selectedRepackId}
          onBack={handleBackToRepacksList}
          fetchRepackById={fetchRepackById}
          updateRepack={updateRepack}
          deleteRepack={deleteRepack}
          addPromosToRepack={addPromosToRepack}
          removePromoFromRepack={removePromoFromRepack}
          allPromos={allPromos} // Pass allPromos to RepackInfoPage
          loading={loading}
          error={error}
          clearError={clearRepackError}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <RepackList
          repacks={repacks}
          onViewRepackDetails={handleViewRepackDetails}
          onViewGame={onViewGame} // Pass onViewGame to RepackList
          isAuthenticated={isAuthenticated}
        />
      )}

      {!selectedRepackId && (
        <Button onClick={onBack} variant="secondary" className="w-full">
          Back to Home
        </Button>
      )}

      {showAddRepackModal && (
        <AddRepackModal
          onClose={() => setShowAddRepackModal(false)}
          onAddRepack={addRepack}
          loading={loading}
          error={error}
          clearError={clearRepackError}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};
