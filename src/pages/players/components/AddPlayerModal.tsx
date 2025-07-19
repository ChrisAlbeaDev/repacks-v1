// src/features/players/components/AddPlayerModal.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Player } from '../types'; // Adjust path if necessary

interface AddPlayerModalProps {
  // Omit player_id, inserted_at, and user_id as these are generated/added by the backend/hook
  onClose: () => void;
  onAddPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean; // New prop: authentication status
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  onClose,
  onAddPlayer,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous errors on new submission attempt

    if (!name.trim()) {
      console.error('Player name cannot be empty.');
      return;
    }

    const newPlayer: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'> = {
      name: name.trim(),
      fullName: fullName.trim() || null,
      address: address.trim() || null,
      contactNumber: contactNumber.trim() || null,
    };

    await onAddPlayer(newPlayer);
    // If addPlayer was successful (no error), close the modal
    if (!error && !loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Add New Player</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
              Name:
            </label>
            <input
              type="text"
              id="playerName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter player's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="playerFullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name (Optional):
            </label>
            <input
              type="text"
              id="playerFullName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter player's full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="playerAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Address (Optional):
            </label>
            <input
              type="text"
              id="playerAddress"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter player's address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="playerContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number (Optional):
            </label>
            <input
              type="text"
              id="playerContactNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter player's contact number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
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
              {loading ? 'Adding...' : 'Add Player'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
