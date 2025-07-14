import { useState } from 'react'
import { TextInput } from '../../../components/TextInput'; 
import { SubmitButton } from '../../../components/SubmitButton'; 
import type { Player } from '../types'; 

interface AddPlayerFormProps {
 
  onAddPlayer: (newItem: Omit<Player, 'id' | 'inserted_at'>) => Promise<Player | undefined>;
  loading: boolean;
  error: string | null; 
  clearError: () => void;
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, loading, error, clearError }) => {
  const [newName, setNewName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      clearError(); 
    }
    
  
    onAddPlayer({ name: newName.trim(), fullName: '', address: '', contactNumber: '' });
    setNewName('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    if (error) { 
      clearError();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col space-y-2"> 
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
      {error && <p className="text-red-500 text-sm italic mt-1">{error}</p>} 
    </form>
  );
};