import type { PlayerMop } from '../types'; // Adjusted path
import { TextInput } from '../../../components/TextInput'; // Adjusted path
import { SubmitButton } from '../../../components/SubmitButton'; // Adjusted path
import { Button } from '../../../components/Button'; // Adjusted path
import { DeleteConfirmation } from '../../../components/DeleteConfirmation'; // Adjusted path
import { useState, useEffect } from 'react';

interface EditDeleteModeOfPaymentModalProps {
  mopData: PlayerMop;
  onClose: () => void;
  onUpdatePlayerMop: (id: number, updatedFields: Partial<PlayerMop>) => Promise<PlayerMop | undefined>;
  onDeletePlayerMop: (id: number) => Promise<void>;
  loading: boolean; // This loading prop comes from the parent (usePlayerMops hook)
  error: string | null; // This error prop comes from the parent (usePlayerMops hook)
  clearError: () => void;
}

export const EditDeleteModeOfPaymentModal: React.FC<EditDeleteModeOfPaymentModalProps> = ({
  mopData,
  onClose,
  onUpdatePlayerMop,
  onDeletePlayerMop,
  loading, // Use the loading prop from parent
  error,   // Use the error prop from parent
  clearError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMop, setEditedMop] = useState<Partial<PlayerMop>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Removed isSaving and isDeleting local states as 'loading' prop from parent can be used

  useEffect(() => {
    if (mopData) {
      setEditedMop({
        mop: mopData.mop,
        acc_number: mopData.acc_number,
      });
      setIsEditing(false);
      clearError(); // Clear parent's error
    }
  }, [mopData, clearError]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedMop((prev) => ({ ...prev, [name]: value }));
    if (error) clearError(); // Clear parent's error if user starts typing after an error
  };

  const handleSave = async () => {
    if (!mopData) return;
    // setIsSaving(true); // No longer needed, use parent's 'loading'
    try {
      const updated = await onUpdatePlayerMop(mopData.id, editedMop);
      if (updated) {
        setIsEditing(false);
        onClose();
      }
    } finally {
      // setIsSaving(false); // No longer needed
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    clearError(); // Clear parent's error
  };

  const handleConfirmDelete = async () => {
    if (!mopData) return;
    // setIsDeleting(true); // No longer needed, use parent's 'loading'
    try {
      await onDeletePlayerMop(mopData.id);
      setShowDeleteConfirm(false);
      onClose(); // Close the modal after successful deletion
    } finally {
      // setIsDeleting(false); // No longer needed
    }
  };

  // Define cancelDelete function
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Combine loading states for buttons
  const isActionLoading = loading; // Use the loading prop from the parent

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
          <Button
            onClick={onClose}
            variant="secondary" // Changed to secondary as 'ghost' might not be defined
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2 rounded-full" // Added padding and rounded-full for better click target
          >
            &times;
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {mopData.mop.toUpperCase()} Details
          </h2>

          {error && <p className="text-red-500 text-sm italic mb-4 text-center">{error}</p>}

          {!isEditing ? (
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong className="block text-sm text-gray-500">Mode of Payment:</strong> {mopData.mop}
              </p>
              <p className="text-gray-700">
                <strong className="block text-sm text-gray-500">Account Number:</strong> {mopData.acc_number}
              </p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={() => setIsEditing(true)} variant="primary"> {/* Changed to primary for edit */}
                  ✏️ Edit
                </Button>
                <Button onClick={handleDeleteClick} variant="danger">
                  🗑️ Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="mopType" className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
                <select
                  id="mopType"
                  name="mop"
                  value={editedMop.mop || ''}
                  onChange={handleEditChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isActionLoading} // Disable while saving
                >
                  <option value="gcash">Gcash</option>
                  <option value="maya">Maya</option>
                  <option value="bank transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="accNumber" className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <TextInput
                  id="accNumber"
                  name="acc_number"
                  value={editedMop.acc_number || ''}
                  onChange={handleEditChange}
                  placeholder="Enter account number"
                  className="w-full"
                  disabled={isActionLoading} // Disable while saving
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <SubmitButton onClick={handleSave} loading={isActionLoading}>
                  {isActionLoading ? 'Saving...' : 'Save Changes'}
                </SubmitButton>
                <Button onClick={() => setIsEditing(false)} variant="secondary" disabled={isActionLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmation
          message={`Are you sure you want to delete this mode of payment: "${mopData.mop} (${mopData.acc_number})"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={cancelDelete} // Correct prop name
          loading={isActionLoading} // Use the combined loading state
        />
      )}
    </>
  );
};
