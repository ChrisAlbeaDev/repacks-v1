// src/features/cards/components/EditCardModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Card } from '../types'; // Adjust path if necessary

interface EditCardModalProps {
  card: Card; // The card object to be edited
  onClose: () => void;
  onSave: (updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>) => Promise<Card | undefined>;
  loading: boolean; // Loading state from the parent (useCards hook)
  error: string | null; // Error state from the parent (useCards hook)
  clearError: () => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  onClose,
  onSave,
  loading,
  error,
  clearError,
}) => {
  const [displayName, setDisplayName] = useState(card.display_name);
  const [boxName, setBoxName] = useState(card.box_name);
  const [cardCode, setCardCode] = useState(card.card_code);
  const [imageName, setImageName] = useState(card.image_name || ''); // Initialize with empty string if null

  // Reset form fields if the card prop changes (e.g., if a different card is selected for edit)
  useEffect(() => {
    setDisplayName(card.display_name);
    setBoxName(card.box_name);
    setCardCode(card.card_code);
    setImageName(card.image_name || '');
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors

    // Basic client-side validation
    if (!displayName.trim() || !boxName.trim() || !cardCode.trim()) {
      alert('Display Name, Box Name, and Card Code are required.'); // Use a custom modal in a real app
      return;
    }

    const updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>> = {
      display_name: displayName.trim(),
      box_name: boxName.trim(),
      card_code: cardCode.trim(),
      image_name: imageName.trim() || null, // Set to null if empty string
    };

    await onSave(updatedFields);
    // The modal will be closed by onSave's success callback in CardInfoPage
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Edit Card Details</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="editDisplayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name:
            </label>
            <input
              type="text"
              id="editDisplayName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editBoxName" className="block text-sm font-medium text-gray-700 mb-1">
              Box Name:
            </label>
            <input
              type="text"
              id="editBoxName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editCardCode" className="block text-sm font-medium text-gray-700 mb-1">
              Card Code:
            </label>
            <input
              type="text"
              id="editCardCode"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editImageName" className="block text-sm font-medium text-gray-700 mb-1">
              Image File Name (e.g., EB02-061_10077.jpg):
            </label>
            <input
              type="text"
              id="editImageName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
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