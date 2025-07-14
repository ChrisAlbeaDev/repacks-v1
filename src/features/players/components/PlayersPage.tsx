import { AddPlayerForm, PlayerList } from '../'; // FIX: Corrected import path from '.' to '..'
import { usePlayers } from '../../../hooks/usePlayers'; // Adjust path to usePlayers hook

interface PlayersPageProps {
  onBack: () => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ onBack }) => {
  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers();

  return (
    <>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        What IF OPTCG Players
      </h1>
      <AddPlayerForm onAddPlayer={addPlayer} loading={loading} error={error} clearError={clearPlayerError} />
      <PlayerList
        players={players}
        loading={loading}
        error={error}
        onUpdatePlayer={updatePlayer}
        onDeletePlayer={deletePlayer}
        onBack={onBack}
        clearError={clearPlayerError}
      />
    </>
  );
};
