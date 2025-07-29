// src/features/repacks/RepackInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Repack, RepackWithPromos } from './types'; // Import RepackWithPromos
import { DeleteConfirmation } from '../../components/DeleteConfirmation';
import { EditRepackModal } from './components/EditRepackModal'; // Assuming you have this modal
import { ManageRepackPromosModal } from '../promos/components/ManageRepackPromosModal'; // Assuming you have this modal
import { Promo } from '../promos/types'; // Import Promo type for allPromos prop

interface RepackInfoPageProps {
  repackId: string;
  onBack: () => void;
  fetchRepackById: (repackId: string) => Promise<RepackWithPromos | null>;
  updateRepack: (repackId: string, updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>>) => Promise<Repack | undefined>;
  deleteRepack: (repackId: string) => Promise<void>;
  addPromosToRepack: (repackId: string, promoIds: string[]) => Promise<void>;
  removePromoFromRepack: (repackId: string, promoId: string) => Promise<void>;
  allPromos: Promo[]; // All available promos for selection
  loading: boolean; // Overall loading state from useRepacks
  error: string | null; // Overall error state from useRepacks
  clearError: () => void;
  isAuthenticated: boolean;
}

export const RepackInfoPage: React.FC<RepackInfoPageProps> = ({
  repackId,
  onBack,
  fetchRepackById,
  updateRepack,
  deleteRepack,
  addPromosToRepack,
  removePromoFromRepack,
  allPromos,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [repack, setRepack] = useState<RepackWithPromos | null>(null);
  const [repackDetailsLoading, setRepackDetailsLoading] = useState(true);
  const [repackDetailsError, setRepackDetailsError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManagePromosModal, setShowManagePromosModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("RepackInfoPage: useEffect triggered for repackId:", repackId);

    const loadRepackDetails = async () => {
      if (!repackId) {
        console.log("RepackInfoPage: No repackId provided, skipping fetch.");
        setRepack(null);
        setRepackDetailsLoading(false);
        setRepackDetailsError("No repack ID provided.");
        return;
      }

      setRepackDetailsLoading(true);
      setRepackDetailsError(null);
      clearError(); // Clear any global errors from useRepacks

      try {
        const fetchedRepack = await fetchRepackById(repackId);
        if (isMounted) {
          if (fetchedRepack) {
            console.log("RepackInfoPage: Fetched repack details:", fetchedRepack);
            setRepack(fetchedRepack);
          } else {
            console.log("RepackInfoPage: Repack not found for ID:", repackId);
            setRepack(null);
            setRepackDetailsError("Repack not found or you don't have permission to view it.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("RepackInfoPage: Error loading repack details:", err.message);
          setRepack(null);
        }
      } finally {
        if (isMounted) {
          console.log("RepackInfoPage: Finished loading repack details.");
          setRepackDetailsLoading(false);
        }
      }
    };

    loadRepackDetails();

    return () => {
      isMounted = false;
      console.log("RepackInfoPage: useEffect cleanup for repackId:", repackId);
    };
  }, [repackId, fetchRepackById, clearError]);

  const handleUpdateRepack = async (updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>>) => {
    if (!repack) return undefined;
    const updated = await updateRepack(repack.repacks_id, updatedFields);
    if (updated) {
      // Re-fetch the full repack details including promos to ensure consistency
      await fetchRepackById(repack.repacks_id).then(setRepack);
      setShowEditModal(false);
    }
    return updated;
  };

  const handleAddPromos = async (promoIds: string[]) => {
    if (!repack) return;
    await addPromosToRepack(repack.repacks_id, promoIds);
    // fetchRepackById is called inside addPromosToRepack to update the state
    setShowManagePromosModal(false);
  };

  const handleRemovePromo = async (promoId: string) => {
    if (!repack) return;
    await removePromoFromRepack(repack.repacks_id, promoId);
    // fetchRepackById is called inside removePromoFromRepack to update the state
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
    setRepackDetailsError(null);
    if (repack) {
      await deleteRepack(repack.repacks_id);
      if (!error) { // Check the global error prop from useRepacks
        onBack();
      } else {
        setRepackDetailsError(error); // If deletePromo resulted in an error, display it locally
      }
    }
  };

  const overallLoading = loading || repackDetailsLoading;
  const overallError = error || repackDetailsError;

  console.log("RepackInfoPage: Rendering. Overall Loading:", overallLoading, "Overall Error:", overallError);

  if (overallLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading repack details...
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="text-center">
        <p className="text-red-500 mt-2">Error: {overallError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Back to Repacks Gallery
        </Button>
      </div>
    );
  }

  if (!repack) {
    return (
      <div className="text-center">
        <p className="text-red-500">Repack not found.</p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Go to Repacks List
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Repack Details</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4 text-center">
        <p className="text-gray-700"><strong>Repack ID:</strong> <span className="font-mono break-all">{repack.repacks_id}</span></p>
        <p className="text-gray-700"><strong>Title:</strong> {repack.title}</p>
        <p className="text-gray-700"><strong>Date:</strong> {repack.date}</p>
        <p className="text-gray-700"><strong>Quantity:</strong> {repack.quantity}</p>
        <p className="text-gray-700"><strong>Price:</strong> ₱{repack.price.toFixed(2)}</p>
        <p className="text-gray-700"><strong>Status:</strong> {repack.status}</p>
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(repack.inserted_at).toLocaleString()}</p>
        <p className="text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{repack.user_id}</span></p>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Associated Promos:</h4>
          {repack.associated_promos && repack.associated_promos.length > 0 ? (
            <ul className="list-disc list-inside text-left mx-auto max-w-xs">
              {repack.associated_promos.map(promo => (
                <li key={promo.promo_id} className="text-gray-700 flex justify-between items-center">
                  <span>{promo.title} (Qty: {promo.qty}, Price: ₱{promo.price.toFixed(2)})</span>
                  <Button
                    onClick={() => handleRemovePromo(promo.promo_id)}
                    variant="danger"
                    className="ml-2 px-2 py-1 text-xs"
                    disabled={!isAuthenticated || overallLoading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No promos associated with this repack.</p>
          )}
          <Button
            onClick={() => setShowManagePromosModal(true)}
            variant="secondary"
            className="mt-4"
            disabled={!isAuthenticated || overallLoading}
          >
            Manage Promos
          </Button>
        </div>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Back to Repacks
        </Button>
        <Button onClick={() => setShowEditModal(true)} variant="primary" className="flex-1" disabled={!isAuthenticated || overallLoading}>
          Edit Repack
        </Button>
        <Button onClick={confirmDelete} variant="danger" className="flex-1" disabled={!isAuthenticated || overallLoading}>
          Delete Repack
        </Button>
      </div>

      {showEditModal && repack && (
        <EditRepackModal
          repack={repack}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateRepack}
          loading={loading}
          error={error}
          clearError={clearError}
        />
      )}

      {showManagePromosModal && repack && (
        <ManageRepackPromosModal
          repackId={repack.repacks_id} // Pass repackId instead of full repack object
          associatedPromos={repack.associated_promos || []} // Changed prop name to associatedPromos
          allPromos={allPromos}
          onClose={() => setShowManagePromosModal(false)}
          onSave={handleAddPromos}
          loading={loading}
          error={error}
          clearError={clearError}
        />
      )}

      {showDeleteConfirm && repack && (
        <DeleteConfirmation
          message={`Are you sure you want to delete repack "${repack.title}"? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
          loading={overallLoading}
        />
      )}
    </div>
  );
};
