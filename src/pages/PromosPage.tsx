// src/pages/PromosPage.tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PromoList } from '../pages/promos/components/PromoList';
import { AddPromoModal } from '../pages/promos/components/AddPromoModal';
import { PromoInfoPage } from '../pages/promos/PromoInfoPage';
import { usePromos } from '../pages/promos/hooks/usePromos';

interface PromosPageProps {
  onBack: () => void;
  isAuthenticated: boolean;
  authError: string | null;
  currentUserId: string | null;
}

export const PromosPage: React.FC<PromosPageProps> = ({ onBack, isAuthenticated, authError, currentUserId }) => {
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);

  const {
    promos,
    loading,
    error,
    addPromo,
    updatePromo,
    deletePromo,
    fetchPromoById,
    clearPromoError,
  } = usePromos({ isAuthenticated, currentUserId });

  const handleViewPromoDetails = (promoId: string) => {
    setSelectedPromoId(promoId);
  };

  const handleBackToPromosList = () => {
    setSelectedPromoId(null);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Promos Management</h2>

      {!isAuthenticated && authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Authentication Error:</strong>
          <span className="block sm:inline"> {authError}</span>
          <p className="text-xs mt-1">Promo management requires an authenticated session.</p>
        </div>
      )}

      {!selectedPromoId && ( // Only show Add Promo button on the list view
        <Button
          onClick={() => { setShowAddPromoModal(true); clearPromoError(); }}
          variant="primary"
          className="w-full"
          disabled={!isAuthenticated || loading}
        >
          Add New Promo
        </Button>
      )}

      {loading && promos.length === 0 && <p className="text-center text-gray-600">Loading promos...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && promos.length === 0 && !error && !selectedPromoId && (
        <p className="text-center text-gray-600">No promos found. Add one to get started!</p>
      )}

      {selectedPromoId ? (
        <PromoInfoPage
          promoId={selectedPromoId}
          onBack={handleBackToPromosList}
          fetchPromoById={fetchPromoById}
          updatePromo={updatePromo}
          deletePromo={deletePromo}
          loading={loading}
          error={error}
          clearError={clearPromoError}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <PromoList
          promos={promos}
          onViewPromoDetails={handleViewPromoDetails}
          isAuthenticated={isAuthenticated}
        />
      )}

      {!selectedPromoId && (
        <Button onClick={onBack} variant="secondary" className="w-full">
          Back to Home
        </Button>
      )}

      {showAddPromoModal && (
        <AddPromoModal
          onClose={() => setShowAddPromoModal(false)}
          onAddPromo={addPromo}
          loading={loading}
          error={error}
          clearError={clearPromoError}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};
