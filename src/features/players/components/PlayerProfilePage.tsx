import React, { useEffect, useState, useCallback } from 'react';
import type { Player } from '../types';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { DeleteConfirmationModal } from './DeleteConfirmationModal'; 
import { supabase } from '../../../lib/supabaseClient';

interface PlayerProfilePageProps {
  playerId: number; 
  onBack: () => void; 
  onUpdatePlayer: (id: number, updatedFields: Partial<Player>) => Promise<Player | undefined>;
  onDeletePlayer: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void; 
}

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({
  playerId,
  onBack,
  onUpdatePlayer,
  onDeletePlayer,
  loading,
  error,
  clearError,
}) => {
  const [playerData, setPlayerData] = useState<Player | null>(null); 
  const [pageLoading, setPageLoading] = useState(true); 
  const [pageError, setPageError] = useState<string | null>(null); 

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Player>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchPlayer = useCallback(async () => { 
    setPageLoading(true);
    setPageError(null);
    clearError(); 

    const { data, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      setPageError(fetchError.message);
      setPlayerData(null);
      console.error("Error fetching player:", fetchError.message);
    } else if (data) {
      setPlayerData(data);
      setEditedProfile({
        fullName: data.fullName,
        address: data.address,
        contactNumber: data.contactNumber,
      });
      setIsEditing(false); 
    } else {
      setPlayerData(null);
      setPageError("Player not found.");
    }
    setPageLoading(false);
  }, [playerId, clearError]); 

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
    } else {
      setPlayerData(null);
      setPageLoading(false);
      setPageError("Invalid player ID.");
    }
  }, [playerId, fetchPlayer]); 

  if (pageLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Loading player profile...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{pageError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          &larr; Back to Players List
        </Button>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Player data could not be loaded.</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          &larr; Back to Players List
        </Button>
      </div>
    );
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSave = async () => {
   
    const updated = await onUpdatePlayer(playerData.id, editedProfile);
    if (updated) {
      setIsEditing(false); 
      fetchPlayer(); 
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    clearError(); 
  };

  const handleConfirmDelete = async () => {
    await onDeletePlayer(playerData.id);
    setShowDeleteConfirm(false); 
    onBack(); 
  };

  return (
    <>
      <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to Players List
      </Button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {playerData.name}'s Profile
      </h2>

      {(error || pageError) && <p className="text-red-500 text-sm italic mb-4 text-center">{error || pageError}</p>}

      {!isEditing ? (
        // View Mode
        <div className="space-y-3">
          <p className="text-gray-700">
            <strong className="block text-sm text-gray-500">Full Name:</strong> {playerData.fullName || 'N/A'}
          </p>
          <p className="text-gray-700">
            <strong className="block text-sm text-gray-500">Address:</strong> {playerData.address || 'N/A'}
          </p>
          <p className="text-gray-700">
            <strong className="block text-sm text-gray-500">Contact:</strong> {playerData.contactNumber || 'N/A'}
          </p>
          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsEditing(true)} variant="warning">
              ✏️ Edit Profile
            </Button>
            <Button onClick={handleDeleteClick} variant="danger">
              🗑️ Delete Player
            </Button>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <TextInput
              id="fullName"
              name="fullName"
              value={editedProfile.fullName || ''}
              onChange={handleEditChange}
              placeholder="Enter full name"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <TextInput
              id="address"
              name="address"
              value={editedProfile.address || ''}
              onChange={handleEditChange}
              placeholder="Enter address"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <TextInput
              id="contactNumber"
              name="contactNumber"
              value={editedProfile.contactNumber || ''}
              onChange={handleEditChange}
              placeholder="Enter contact number"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={handleSave} variant="primary">
              Save Changes
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          itemName={playerData.name}
          loading={loading} 
          error={error} 
        />
      )}
    </>
  );
};
