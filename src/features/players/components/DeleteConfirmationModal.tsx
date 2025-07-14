import { Button } from "../../../components/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
  error?: string | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Deletion</h2>
        {error && <p className="text-red-500 text-sm italic mb-4 text-center">{error}</p>}
        <p className="text-gray-700 text-center mb-6">
          Are you sure you want to delete <strong className="font-semibold">{itemName}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};