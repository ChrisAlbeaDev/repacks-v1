// src/features/players/components/AddPlayerForm.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Player } from '../types'; // Adjust path if necessary

interface AddPlayerFormProps {
  // Omit player_id, inserted_at, and user_id as these are generated/added by the backend/hook
  onAddPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean; // New prop: authentication status
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, loading, error, clearError, isAuthenticated }) => {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name.trim()) {
      console.error('Player name cannot be empty.');
      return;
    }

    const newPlayer: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'> = {
      name: name.trim(),
      fullName: fullName.trim() || null, // Allow null
      address: address.trim() || null,   // Allow null
      contactNumber: contactNumber.trim() || null, // Allow null
    };

    await onAddPlayer(newPlayer);
    if (!error && !loading) {
      setName('');
      setFullName('');
      setAddress('');
      setContactNumber('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col space-y-2 p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Quick Add Player</h3>
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
          Name:
        </label>
        <input
          type="text"
          id="playerName"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter player's contact number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={!isAuthenticated || loading}
        className="w-full mt-4"
      >
        {loading ? 'Adding...' : 'Add Player'}
      </Button>
      {!isAuthenticated && (
        <p className="text-center text-gray-500 text-xs mt-2">
          Authentication required to add players.
        </p>
      )}
    </form>
  );
};
