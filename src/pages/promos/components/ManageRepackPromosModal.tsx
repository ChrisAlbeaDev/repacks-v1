// src/features/repacks/components/ManageRepackPromosModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button';
import { Promo } from '../../promos/types'; // Assuming Promo type is here

interface ManageRepackPromosModalProps {
  repackId: string;
  associatedPromos: Promo[]; // Promos currently linked to this repack
  allPromos: Promo[]; // All available promos
  onClose: () => void;
  onSave: (promoIds: string[]) => Promise<void>; // Added: Function to save selected promo IDs
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const ManageRepackPromosModal: React.FC<ManageRepackPromosModalProps> = ({
  repackId,
  associatedPromos,
  allPromos,
  onClose,
  onSave,
  loading,
  error,
  clearError,
}) => {
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>([]);

  useEffect(() => {
    // Initialize selectedPromoIds with the IDs of currently associated promos
    setSelectedPromoIds(associatedPromos.map(p => p.promo_id));
  }, [associatedPromos]);

  const handleCheckboxChange = (promoId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPromoIds(prev => [...prev, promoId]);
    } else {
      setSelectedPromoIds(prev => prev.filter(id => id !== promoId));
    }
    clearError(); // Clear any error when user interacts
  };

  const handleSubmit = async () => {
    await onSave(selectedPromoIds);
    // onClose will be called by parent if onSave is successful
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Manage Promos for Repack</h3>
        <p className="text-sm text-gray-600 mb-4 text-center">Repack ID: <span className="font-mono break-all">{repackId}</span></p>

        {error && <p className="text-red-500 text-sm italic mt-1 text-center">{error}</p>}

        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 mb-4">
          {allPromos.length === 0 && !loading ? (
            <p className="text-gray-600 text-center">No promos available to add.</p>
          ) : (
            <ul className="space-y-2">
              {allPromos.map(promo => (
                <li key={promo.promo_id} className="flex items-center justify-between">
                  <label htmlFor={`promo-${promo.promo_id}`} className="flex items-center cursor-pointer text-gray-800 flex-grow">
                    <input
                      type="checkbox"
                      id={`promo-${promo.promo_id}`}
                      checked={selectedPromoIds.includes(promo.promo_id)}
                      onChange={(e) => handleCheckboxChange(promo.promo_id, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded mr-2"
                      disabled={loading}
                    />
                    <span>{promo.title} (Qty: {promo.qty}, Price: ₱{promo.price.toFixed(2)})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
