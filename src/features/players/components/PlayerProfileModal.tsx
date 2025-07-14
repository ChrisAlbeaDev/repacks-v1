import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { DeleteConfirmationModal } from './DeleteConfirmationModal'; 

interface PlayerProfileModalProps {
  player: Player | null;
  onClose: () => void;
  onUpdatePlayer: (id: number, updatedFields: Partial<Player>) => Promise<Player | undefined>;
  onDeletePlayer: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  onClose,
  onUpdatePlayer,
  onDeletePlayer,
  loading,
  error,
  clearError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Player>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 

  useEffect(() => {
    if (player) {
      setEditedProfile({
        fullName: player.fullName,
        address: player.address,
        contactNumber: player.contactNumber,
      });
      setIsEditing(false); 
      clearError(); 
    }
  }, [player, clearError]);

  if (!player) {
    return null; 
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
    if (error) clearError(); 
  };

  const handleSave = async () => {
    if (!player) return;

    const updated = await onUpdatePlayer(player.id, editedProfile);
    if (updated) {
      setIsEditing(false); 
      onClose(); 
    }
  };

  const handleDeleteClick = () => { 
    setShowDeleteConfirm(true);
    clearError(); 
  };

  const handleConfirmDelete = async () => { 
    if (!player) return;
    await onDeletePlayer(player.id);
    setShowDeleteConfirm(false); 
    onClose(); 
  };

  const handleCloseModal = () => {
    setIsEditing(false); 
    clearError(); 
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
          <Button
            onClick={handleCloseModal}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            &times;
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {player.name}'s Profile
          </h2>

          {error && <p className="text-red-500 text-sm italic mb-4 text-center">{error}</p>}

          {!isEditing ? (
            // View Mode
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong className="block text-sm text-gray-500">Full Name:</strong> {player.fullName || 'N/A'}
              </p>
              <p className="text-gray-700">
                <strong className="block text-sm text-gray-500">Address:</strong> {player.address || 'N/A'}
              </p>
              <p className="text-gray-700">
                <strong className="block text-sm text-gray-500">Contact:</strong> {player.contactNumber || 'N/A'}
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
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          itemName={player.name}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
};