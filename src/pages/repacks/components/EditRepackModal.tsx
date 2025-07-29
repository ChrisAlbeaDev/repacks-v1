// src/features/repacks/components/EditRepackModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button';
import { Repack } from '../types';

interface EditRepackModalProps {
  repack: Repack;
  onClose: () => void;
  onSave: (updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>>) => Promise<Repack | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const EditRepackModal: React.FC<EditRepackModalProps> = ({
  repack,
  onClose,
  onSave,
  loading,
  error,
  clearError,
}) => {
  const [title, setTitle] = useState(repack.title);
  const [date, setDate] = useState(repack.date); // Assuming date is already 'YYYY-MM-DD'
  const [quantity, setQuantity] = useState(repack.quantity.toString());
  const [price, setPrice] = useState(repack.price.toFixed(2));
  const [status, setStatus] = useState(repack.status);

  useEffect(() => {
    setTitle(repack.title);
    setDate(repack.date);
    setQuantity(repack.quantity.toString());
    setPrice(repack.price.toFixed(2));
    setStatus(repack.status);
  }, [repack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!title.trim() || !date.trim() || !quantity || !price || !status.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      alert('Quantity must be a positive number.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert('Price must be a positive number.');
      return;
    }

    const updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>> = {
      title: title.trim(),
      date: date.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      status: status.trim(),
    };

    await onSave(updatedFields);
    // Modal will close on successful save via onSave callback in parent
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Edit Repack Details</h3>
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
            <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date:
            </label>
            <input
              type="date"
              id="editDate"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity:
            </label>
            <input
              type="number"
              id="editQuantity"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
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
          <div>
            <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status:
            </label>
            <select
              id="editStatus"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={loading}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
            </select>
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
