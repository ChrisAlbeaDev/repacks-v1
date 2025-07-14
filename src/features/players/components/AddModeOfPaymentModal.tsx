import type { PlayerMop } from '../types';
import { TextInput } from '../../../components/TextInput';
import { SubmitButton } from '../../../components/SubmitButton';
import { Button } from '../../../components/Button';
import { useState } from 'react' 
interface AddModeOfPaymentModalProps {
  playerId: number;
  onClose: () => void;
  onAddPlayerMop: (newItem: Omit<PlayerMop, 'id' | 'inserted_at'>) => Promise<PlayerMop | undefined>;
  onRefetchPlayerMops: () => Promise<void>;
  loading: boolean; // This 'loading' is from usePlayerMops, for the list.
  error: string | null;
  clearError: () => void;
}

export const AddModeOfPaymentModal: React.FC<AddModeOfPaymentModalProps> = ({
  playerId,
  onClose,
  onAddPlayerMop,
  onRefetchPlayerMops,
  error, // Use this error for display
  clearError,
}) => {
  const [mopType, setMopType] = useState<PlayerMop['mop']>('gcash');
  const [accNumber, setAccNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Local loading state for the add button

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accNumber.trim()) {
      clearError();
      return;
    }

    setIsAdding(true); // Set local loading to true
    try {
      const addedMop = await onAddPlayerMop({
        player_id: playerId,
        mop: mopType,
        acc_number: accNumber.trim(),
      });
      if (addedMop) {
        setAccNumber('');
        onRefetchPlayerMops(); // Trigger refetch of the list on the parent
        onClose();
      }
    } finally {
      setIsAdding(false); // Always set local loading to false
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccNumber(e.target.value);
    if (error) clearError();
  };

  const handleMopTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMopType(e.target.value as PlayerMop['mop']);
    if (error) clearError();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Add Mode of Payment
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input type="hidden" name="player_id" value={playerId} />

          <div>
            <label htmlFor="mopType" className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
            <select
              id="mopType"
              name="mopType"
              value={mopType}
              onChange={handleMopTypeChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Enter account number"
              value={accNumber}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>}
          <SubmitButton loading={isAdding}>
            {isAdding ? 'Adding...' : 'Add Payment'}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};