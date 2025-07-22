// src/features/players/PlayerProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/Button';
import { Player } from './types';
import { supabase } from '../../lib/supabaseClient';
import { DeleteConfirmation } from '../../components/DeleteConfirmation';

interface PlayerProfilePageProps {
  playerId: string;
  onBack: () => void;
  // onUpdatePlayer now accepts an optional File for profile picture AND a boolean to clear
  onUpdatePlayer: (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>>, profilePicFile: File | null, shouldClearProfilePic: boolean) => Promise<Player | undefined>;
  onDeletePlayer: (playerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
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
  const [playerDetailsLoading, setPlayerDetailsLoading] = useState(true);
  const [playerDetailsError, setPlayerDetailsError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Local state for editable fields
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null); // State for the selected file
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null); // State for image preview
  const [hasRemovedPicExplicitly, setHasRemovedPicExplicitly] = useState(false); // New state to track explicit removal
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  useEffect(() => {
    let isMounted = true;
    console.log("PlayerProfilePage: useEffect triggered for playerId:", playerId);

    const fetchPlayerDetails = async () => {
      if (!playerId) {
        console.log("PlayerProfilePage: No playerId provided, skipping fetch.");
        setPlayer(null);
        setPlayerDetailsLoading(false);
        setPlayerDetailsError("No player ID provided.");
        return;
      }

      setPlayerDetailsLoading(true);
      setPlayerDetailsError(null);
      clearError();

      try {
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('player_id', playerId)
          .single();

        if (!isMounted) return;

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          console.log("PlayerProfilePage: Fetched player data:", data);
          setPlayer(data);
          setName(data.name);
          setFullName(data.fullName || '');
          setAddress(data.address || '');
          setContactNumber(data.contactNumber || '');
          setProfilePicPreview(data.profile_pic_url || null); // Set initial preview from existing URL
          setProfilePicFile(null); // Clear any previously selected file
          setHasRemovedPicExplicitly(false); // Reset this flag on new player fetch
        } else {
          console.log("PlayerProfilePage: Player not found for ID:", playerId);
          setPlayer(null);
          setPlayerDetailsError("Player not found.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("PlayerProfilePage: Error fetching player details:", err.message);
        setPlayerDetailsError(err.message);
        setPlayer(null);
      } finally {
        if (isMounted) {
          setPlayerDetailsLoading(false);
        }
      }
    };

    fetchPlayerDetails();

    return () => {
      isMounted = false;
      console.log("PlayerProfilePage: useEffect cleanup for playerId:", playerId);
    };
  }, [playerId, clearError]);

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file)); // Create a local URL for preview
      clearError();
      setHasRemovedPicExplicitly(false); // If a new file is selected, user is not clearing
    }
  };

  // Function to remove the selected/existing profile picture
  const handleRemoveProfilePic = () => {
    setProfilePicFile(null); // Clear the selected file
    setProfilePicPreview(null); // Clear the preview
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    setHasRemovedPicExplicitly(true); // Set flag indicating explicit removal
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPlayerDetailsError(null);

    if (!player) {
      setPlayerDetailsError("No player data to update.");
      return;
    }

    const updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>> = {
      name: name.trim(),
      fullName: fullName.trim() || null,
      address: address.trim() || null,
      contactNumber: contactNumber.trim() || null,
    };

    // Determine if the profile picture should be cleared in the database
    // This is true if the user explicitly clicked "Remove" AND no new file was selected.
    const shouldClear = hasRemovedPicExplicitly && profilePicFile === null;

    // Pass the profilePicFile and shouldClear flag to onUpdatePlayer
    const updated = await onUpdatePlayer(playerId, updatedFields, profilePicFile, shouldClear);
    if (updated) {
      setPlayer(updated);
      setIsEditing(false);
      setProfilePicFile(null); // Clear file input state after successful upload/update
      setHasRemovedPicExplicitly(false); // Reset this flag after successful update
      // The profilePicPreview will be updated by the useEffect if 'updated' contains new URL
    }
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
    setPlayerDetailsError(null);
    await onDeletePlayer(playerId);
    if (!error) {
      onBack();
    } else {
      setPlayerDetailsError(error);
    }
  };

  const overallLoading = loading || playerDetailsLoading;
  const overallError = error || playerDetailsError;

  // Function to get the cache-busted URL
  const getCacheBustedImageUrl = (url: string | null) => {
    if (!url) return null;
    // Append a timestamp to the URL to bust the cache
    // Use player.inserted_at or Date.now() if player has an 'updated_at' field,
    // otherwise, Date.now() is a good general purpose cache buster for images
    return `${url}?t=${Date.now()}`;
  };


  if (overallLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading player details...
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="text-center">
        <p className="text-red-500 mt-2">Error: {overallError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Back to Players
        </Button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center">
        <p className="text-red-500">Player not found.</p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Go to Players List
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Player Profile</h2>

      {!isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-3">
          {player.profile_pic_url && (
            <div className="flex justify-center mb-4">
              <img
                src={getCacheBustedImageUrl(player.profile_pic_url) || ''} // Use cache-busted URL
                alt={`${player.name}'s profile`}
                className="w-32 h-32 rounded-full object-cover border-2 border-blue-400"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/aabbcc/ffffff?text=No+Image'; }} // Fallback
              />
            </div>
          )}
          <p className="text-gray-700"><strong>Player ID:</strong> <span className="font-mono break-all">{player.player_id}</span></p>
          <p className="text-gray-700"><strong>Name:</strong> {player.name}</p>
          <p className="text-gray-700"><strong>Full Name:</strong> {player.fullName || 'N/A'}</p>
          <p className="text-gray-700"><strong>Address:</strong> {player.address || 'N/A'}</p>
          <p className="text-gray-700"><strong>Contact Number:</strong> {player.contactNumber || 'N/A'}</p>
          <p className="text-gray-700"><strong>Created At:</strong> {new Date(player.inserted_at).toLocaleString()}</p>
          <p className="text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{player.user_id}</span></p>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
          <div className="flex flex-col items-center mb-4">
            {profilePicPreview ? (
              <div className="relative">
                <img
                  src={profilePicPreview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-blue-400"
                />
                <Button
                  onClick={handleRemoveProfilePic}
                  variant="danger"
                  className="absolute bottom-0 right-0 p-1 rounded-full text-xs"
                >
                  &times;
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-4 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={overallLoading}
            />
          </div>

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
              disabled={overallLoading}
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
              disabled={overallLoading}
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
              disabled={overallLoading}
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
              disabled={overallLoading}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={overallLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={overallLoading} disabled={overallLoading}>
              {overallLoading ? 'Saving...' : 'Save Changes'}
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
        <Button onClick={confirmDelete} variant="danger" className="flex-1" disabled={overallLoading}>
          Delete Player
        </Button>
      </div>

      <Button onClick={() => onManagePayments(playerId, player.name)} variant="secondary" className="w-full mt-4">
        Manage Payments
      </Button>

      {showDeleteConfirm && (
        <DeleteConfirmation
          message={`Are you sure you want to delete player "${player.name}"? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
          loading={overallLoading}
        />
      )}
    </div>
  );
};
