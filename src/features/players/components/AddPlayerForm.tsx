import { TextInput } from '../../../components/TextInput'; // Adjust path for generic components
import { SubmitButton } from '../../../components/SubmitButton'; // Adjust path for generic components
import type { Player } from '../types'; // Import Player type
import { useState } from 'react'

interface AddPlayerFormProps {
  // FIX: Change onAddPlayer to accept CreatePayload<Player> and return Promise<Player | undefined>
  onAddPlayer: (newItem: Omit<Player, 'id' | 'inserted_at'>) => Promise<Player | undefined>;
  loading: boolean;
  error: string | null; // NEW: Prop to display error
  clearError: () => void; // NEW: Prop to clear error
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, loading, error, clearError }) => {
  const [newName, setNewName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      clearError(); // Clear error if input is empty
      return;
    }
    // FIX: Pass an object { name: ... } instead of just the string
    // For adding, we only need 'name'. Other fields can be empty strings or default values in DB.
    onAddPlayer({ name: newName.trim(), fullName: '', address: '', contactNumber: '' });
    setNewName('');
  };

  // Clear error when typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    if (error) { // Only clear if there's an active error
      clearError();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col space-y-2"> {/* Changed to flex-col for error display */}
      <div className="flex space-x-2">
        <TextInput
          placeholder="Add a new player name..."
          value={newName}
          onChange={handleInputChange}
        />
        <SubmitButton loading={loading}>
          {loading ? 'Adding...' : 'Add'}
        </SubmitButton>
      </div>
      {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>} {/* Display error here */}
    </form>
  );
};