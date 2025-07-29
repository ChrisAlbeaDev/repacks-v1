// src/features/promos/PromoInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Promo } from './types';
import { DeleteConfirmation } from '../../components/DeleteConfirmation';
import { EditPromoModal } from './components/EditPromoModal';

interface PromoInfoPageProps {
  promoId: string;
  onBack: () => void;
  fetchPromoById: (promoId: string) => Promise<Promo | null>;
  updatePromo: (promoId: string, updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>>) => Promise<Promo | undefined>;
  deletePromo: (promoId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

export const PromoInfoPage: React.FC<PromoInfoPageProps> = ({
  promoId,
  onBack,
  fetchPromoById,
  updatePromo,
  deletePromo,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoDetailsLoading, setPromoDetailsLoading] = useState(true);
  const [promoDetailsError, setPromoDetailsError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPromoDetails = async () => {
      if (!promoId) {
        setPromo(null);
        setPromoDetailsLoading(false);
        setPromoDetailsError("No promo ID provided.");
        return;
      }

      setPromoDetailsLoading(true);
      setPromoDetailsError(null);
      clearError();

      try {
        const fetchedPromo = await fetchPromoById(promoId);
        if (isMounted) {
          if (fetchedPromo) {
            setPromo(fetchedPromo);
          } else {
            setPromo(null);
            setPromoDetailsError("Promo not found or you don't have permission to view it.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading promo details:", err.message);
          setPromoDetailsError(err.message);
          setPromo(null);
        }
      } finally {
        if (isMounted) {
          setPromoDetailsLoading(false);
        }
      }
    };

    loadPromoDetails();

    return () => {
      isMounted = false;
    };
  }, [promoId, fetchPromoById, clearError]);

  const handleUpdatePromo = async (updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>>) => {
    if (!promo) return undefined;
    const updated = await updatePromo(promo.promo_id, updatedFields);
    if (updated) {
      setPromo(updated);
      setShowEditModal(false);
    }
    return updated;
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    clearError();
    setPromoDetailsError(null);
    if (promo) {
      await deletePromo(promo.promo_id);
      if (!error) {
        onBack();
      } else {
        setPromoDetailsError(error);
      }
    }
  };

  const overallLoading = loading || promoDetailsLoading;
  const overallError = error || promoDetailsError;

  if (overallLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading promo details...
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="text-center">
        <p className="text-red-500 mt-2">Error: {overallError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Back to Promos Gallery
        </Button>
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="text-center">
        <p className="text-red-500">Promo not found.</p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Go to Promos List
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Promo Details</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4 text-center">
        <p className="text-gray-700"><strong>Promo ID:</strong> <span className="font-mono break-all">{promo.promo_id}</span></p>
        <p className="text-gray-700"><strong>Title:</strong> {promo.title}</p>
        <p className="text-gray-700"><strong>Quantity:</strong> {promo.qty}</p>
        <p className="text-gray-700"><strong>Free:</strong> {promo.free || 'N/A'}</p>
        <p className="text-gray-700"><strong>Price:</strong> ₱{promo.price.toFixed(2)}</p>
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(promo.inserted_at).toLocaleString()}</p>
        <p className="text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{promo.user_id}</span></p>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Back to Promos
        </Button>
        <Button onClick={() => setShowEditModal(true)} variant="primary" className="flex-1" disabled={!isAuthenticated || overallLoading}>
          Edit Promo
        </Button>
        <Button onClick={confirmDelete} variant="danger" className="flex-1" disabled={!isAuthenticated || overallLoading}>
          Delete Promo
        </Button>
      </div>

      {showEditModal && promo && (
        <EditPromoModal
          promo={promo}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdatePromo}
          loading={loading}
          error={error}
          clearError={clearError}
        />
      )}

      {showDeleteConfirm && promo && (
        <DeleteConfirmation
          message={`Are you sure you want to delete promo "${promo.title}"? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
          loading={overallLoading}
        />
      )}
    </div>
  );
};
