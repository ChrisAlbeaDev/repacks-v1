import { AddPlayerForm, PlayerList, AddPlayerModal, PlayerProfilePage } from '../';
import { usePlayers } from '../../../hooks/usePlayers';
import type { Player } from '../types';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import React, {useState, useEffect } from 'react';
interface PlayersPageProps {
  onBack: () => void;
  onViewPlayerProfile: (playerId: number) => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ onBack, onViewPlayerProfile }) => {
  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  const filteredPlayers = players.filter(player =>
    (player.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const nameA = (a.name ?? '').toLowerCase();
    const nameB = (b.name ?? '').toLowerCase();

    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleOpenAddPlayerModal = () => {
    setShowAddPlayerModal(true);
    clearPlayerError();
  };

  const handleCloseAddPlayerModal = () => {
    setShowAddPlayerModal(false);
    clearPlayerError();
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        What IF OPTCG Players
      </h1>

      <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
        <TextInput
          placeholder="Search players by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={toggleSortOrder} variant="secondary">
          Sort {sortOrder === 'asc' ? 'A-Z ↓' : 'Z-A ↑'}
        </Button>
        <Button onClick={handleOpenAddPlayerModal} variant="primary">
          Add Player
        </Button>
      </div>

      <PlayerList
        players={sortedPlayers}
        loading={loading}
        error={error}
        onUpdatePlayer={updatePlayer}
        onDeletePlayer={deletePlayer}
        onBack={onBack}
        clearError={clearPlayerError}
        onViewPlayer={onViewPlayerProfile}
      />

      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={handleCloseAddPlayerModal}
          onAddPlayer={addPlayer}
          loading={loading}
          error={error}
          clearError={clearPlayerError}
        />
      )}
    </>
  );
};