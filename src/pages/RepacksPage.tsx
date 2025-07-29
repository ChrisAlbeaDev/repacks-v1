// src/pages/RepacksPage.tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { RepackList } from '../pages/repacks/components/RepackList';
import { AddRepackModal } from '../pages/repacks/components/AddRepackModal';
import { RepackInfoPage } from '../pages/repacks/RepackInfoPage';
import { useRepacks } from '../pages/repacks/hooks/useRepacks';
import { usePromos } from '../pages/promos/hooks/usePromos'; // To get all promos for ManageRepackPromosModal

interface RepacksPageProps {
  onBack: () => void;
  isAuthenticated: boolean;
  authError: string | null;
  currentUserId: string | null;
}

export const RepacksPage: React.FC<RepacksPageProps> = ({ onBack, isAuthenticated, authError, currentUserId }) => {
  const [selectedRepackId, setSelectedRepackId] = useState<string | null>(null);
  const [showAddRepackModal, setShowAddRepackModal] = useState(false);

  const {
    repacks,
    loading: repacksLoading,
    error: repacksError,
    addRepack,
    updateRepack,
    deleteRepack,
    fetchRepackById,
    addPromosToRepack,
    removePromoFromRepack,
    clearRepackError,
  } = useRepacks({ isAuthenticated, currentUserId });

  // Fetch all promos to pass to ManageRepackPromosModal
  const { promos: allPromos, loading: promosLoading, error: promosError, clearPromoError } = usePromos({ isAuthenticated, currentUserId });

  const handleViewRepackDetails = (repackId: string) => {
    setSelectedRepackId(repackId);
  };

  const handleBackToRepacksList = () => {
    setSelectedRepackId(null);
  };

  const overallLoading = repacksLoading || promosLoading;
  const overallError = repacksError || promosError;

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
          disabled={!isAuthenticated || overallLoading}
        >
          Add New Repack
        </Button>
      )}

      {overallLoading && repacks.length === 0 && <p className="text-center text-gray-600">Loading repacks...</p>}
      {overallError && <p className="text-center text-red-500">Error: {overallError}</p>}

      {!overallLoading && repacks.length === 0 && !overallError && !selectedRepackId && (
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
          allPromos={allPromos} // Pass all available promos
          loading={overallLoading}
          error={overallError}
          clearError={() => { clearRepackError(); clearPromoError(); }} // Clear both errors
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <RepackList
          repacks={repacks}
          onViewRepackDetails={handleViewRepackDetails}
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
          loading={repacksLoading}
          error={repacksError}
          clearError={clearRepackError}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};
