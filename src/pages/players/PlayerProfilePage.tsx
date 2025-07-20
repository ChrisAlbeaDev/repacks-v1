// src/features/players/PlayerProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Player } from './types'; // Import Player type
import { supabase } from '../../lib/supabaseClient'; // Import supabase client

interface PlayerProfilePageProps {
  playerId: string;
  onBack: () => void;
  onUpdatePlayer: (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>>) => Promise<Player | undefined>;
  onDeletePlayer: (playerId: string) => Promise<void>;
  loading: boolean; // Loading state from usePlayers
  error: string | null; // Error state from usePlayers
  clearError: () => void; // Function to clear errors from usePlayers
  onManagePayments: (playerId: string, playerName: string) => void;
}

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({
  playerId,
  onBack,
  onUpdatePlayer,
  onDeletePlayer,
  loading,
  error,
  clearError,
  onManagePayments,
}) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editable fields, initialized from player data
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Fetch the specific player's data when playerId changes or players array updates
  // Assuming App.tsx passes the 'players' array to a parent component that then passes a single player here
  // For simplicity, let's assume we fetch the player here if not passed directly.
  // However, the current setup implies `usePlayers` is in App.tsx, and this component
  // receives `playerId` and `onUpdatePlayer` etc. So, we need to fetch the player data here.

  // Re-fetching the player here to ensure we have the most up-to-date details for editing.
  // This might cause a slight delay if `usePlayers` in App.tsx already has the data,
  // but it ensures this component is self-sufficient for the selected player's data.

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      clearError(); // Clear any previous errors
      try {
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('player_id', playerId)
          .single(); // Use .single() to get a single row

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setPlayer(data);
          // Initialize form fields with player's current data
          setName(data.name);
          setFullName(data.fullName || '');
          setAddress(data.address || '');
          setContactNumber(data.contactNumber || '');
        } else {
          setPlayer(null); // Player not found
          // setError("Player not found."); // You might want to set a specific error
        }
      } catch (err: any) {
        console.error("Error fetching player details:", err.message);
        // setError(err.message); // Set error if fetching fails
        setPlayer(null);
      }
    };

    if (playerId) {
      fetchPlayerDetails();
    }
  }, [playerId, clearError]); // Depend on playerId and clearError

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!player) return;

    const updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>> = {
      name: name.trim(), // Include name
      fullName: fullName.trim() || null,
      address: address.trim() || null,
      contactNumber: contactNumber.trim() || null,
    };

    const updated = await onUpdatePlayer(playerId, updatedFields);
    if (updated) {
      setPlayer(updated); // Update local player state with returned data
      setIsEditing(false); // Exit edit mode on success
    }
    // Error handling is managed by usePlayers and propagated via 'error' prop
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${player?.name}? This action cannot be undone.`)) {
      await onDeletePlayer(playerId);
      // If delete is successful, navigate back to the players list
      if (!error) { // Check error state after async operation
        onBack();
      }
    }
  };

  if (loading || !player) { // Use the 'loading' prop from usePlayers for overall loading state
    return (
      <div className="text-center text-gray-600">
        {loading ? 'Loading player details...' : 'Player not found.'}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Player Profile</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-3">
          <p className="text-gray-700"><strong>Player ID:</strong> <span className="font-mono break-all">{player.player_id}</span></p>
          <p className="text-gray-700"><strong>Name:</strong> {player.name}</p> {/* Display Name */}
          <p className="text-gray-700"><strong>Full Name:</strong> {player.fullName || 'N/A'}</p>
          <p className="text-gray-700"><strong>Address:</strong> {player.address || 'N/A'}</p>
          <p className="text-gray-700"><strong>Contact Number:</strong> {player.contactNumber || 'N/A'}</p>
          <p className="text-gray-700"><strong>Created At:</strong> {new Date(player.inserted_at).toLocaleString()}</p>
          <p className="text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{player.user_id}</span></p> {/* Display User ID */}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
              Name:
            </label>
            <input
              type="text"
              id="editName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name:
            </label>
            <input
              type="text"
              id="editFullName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Address:
            </label>
            <input
              type="text"
              id="editAddress"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number:
            </label>
            <input
              type="text"
              id="editContactNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      <div className="flex justify-between space-x-3 mt-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Back to Players
        </Button>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="primary" className="flex-1">
            Edit Player
          </Button>
        )}
        <Button onClick={handleDelete} variant="danger" className="flex-1" disabled={loading}>
          Delete Player
        </Button>
      </div>

      <Button onClick={() => onManagePayments(playerId, player.name)} variant="secondary" className="w-full mt-4">
        Manage Payments
      </Button>
    </div>
  );
};
