import type { Player } from '../types';
import { TextInput } from '../../../components/TextInput';
import { SubmitButton } from '../../../components/SubmitButton';
import { Button } from '../../../components/Button';
import { useState } from 'react'
interface AddPlayerModalProps {
  onClose: () => void;
  onAddPlayer: (newItem: Omit<Player, 'id' | 'inserted_at'>) => Promise<Player | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  onClose,
  onAddPlayer,
  loading,
  error,
  clearError,
}) => {
  const [newName, setNewName] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      clearError();
      return;
    }
    const addedPlayer = await onAddPlayer({ name: newName.trim(), fullName: '', address: '', contactNumber: '' });
    if (addedPlayer) {
      setNewName(''); // Clear input on successful add
      onClose(); // Close modal on successful add
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
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
          Add New Player
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
            <TextInput
              id="playerName"
              placeholder="Enter player name"
              value={newName}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>}
          <SubmitButton loading={loading}>
            {loading ? 'Adding...' : 'Add Player'}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};