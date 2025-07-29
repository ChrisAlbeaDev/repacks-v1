// src/features/promos/components/AddPromoModal.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Promo } from '../types';

interface AddPromoModalProps {
  onClose: () => void;
  onAddPromo: (newPromo: Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>) => Promise<Promo | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

export const AddPromoModal: React.FC<AddPromoModalProps> = ({
  onClose,
  onAddPromo,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [title, setTitle] = useState('');
  const [qty, setQty] = useState('');
  const [free, setFree] = useState('');
  const [price, setPrice] = useState('');

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

    const newPromoData: Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'> = {
      title: title.trim(),
      qty: parseInt(qty),
      free: free.trim() || null,
      price: parseFloat(price),
    };

    const added = await onAddPromo(newPromoData);
    if (added) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Add New Promo</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title:
            </label>
            <input
              type="text"
              id="title"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="qty" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity:
            </label>
            <input
              type="number"
              id="qty"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              min="1"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="free" className="block text-sm font-medium text-gray-700 mb-1">
              Free (Description, Optional):
            </label>
            <input
              type="text"
              id="free"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price:
            </label>
            <input
              type="number"
              id="price"
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
              disabled={!isAuthenticated || loading}
            >
              {loading ? 'Adding...' : 'Add Promo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
