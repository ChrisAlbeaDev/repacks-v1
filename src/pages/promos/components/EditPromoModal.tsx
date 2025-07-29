// src/features/promos/components/EditPromoModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button';
import { Promo } from '../types';

interface EditPromoModalProps {
  promo: Promo;
  onClose: () => void;
  onSave: (updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>>) => Promise<Promo | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const EditPromoModal: React.FC<EditPromoModalProps> = ({
  promo,
  onClose,
  onSave,
  loading,
  error,
  clearError,
}) => {
  const [title, setTitle] = useState(promo.title);
  const [qty, setQty] = useState(promo.qty.toString());
  const [free, setFree] = useState(promo.free || '');
  const [price, setPrice] = useState(promo.price.toFixed(2));

  useEffect(() => {
    setTitle(promo.title);
    setQty(promo.qty.toString());
    setFree(promo.free || '');
    setPrice(promo.price.toFixed(2));
  }, [promo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!title.trim() || !qty || !price) {
      alert('Title, Quantity, and Price are required.');
      return;
    }
    if (isNaN(parseInt(qty)) || parseInt(qty) <= 0) {
      alert('Quantity must be a positive number.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert('Price must be a positive number.');
      return;
    }

    const updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>> = {
      title: title.trim(),
      qty: parseInt(qty),
      free: free.trim() || null,
      price: parseFloat(price),
    };

    await onSave(updatedFields);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Edit Promo Details</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Title:
            </label>
            <input
              type="text"
              id="editTitle"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editQty" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity:
            </label>
            <input
              type="number"
              id="editQty"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              min="1"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editFree" className="block text-sm font-medium text-gray-700 mb-1">
              Free (Description, Optional):
            </label>
            <input
              type="text"
              id="editFree"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Price:
            </label>
            <input
              type="number"
              id="editPrice"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0.01"
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>}

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
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
