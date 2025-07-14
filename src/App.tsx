import { PlayersPage, PlayerProfilePage } from './features/players';
import { HomePage } from './components/HomePage';
import { Button } from './components/Button';
import { usePlayers } from './hooks/usePlayers';
import { useState } from 'react'
type AppView = 'home' | 'players' | 'playerProfile';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers();

  const goToPlayersList = () => {
    setCurrentView('players');
    setSelectedPlayerId(null);
  };

  const goToHome = () => {
    setCurrentView('home');
    setSelectedPlayerId(null);
  };

  const goToPlayerProfile = (id: number) => {
    setSelectedPlayerId(id);
    setCurrentView('playerProfile');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {(() => {
          switch (currentView) {
            case 'home':
              return <HomePage onGoToPlayers={goToPlayersList} />;
            case 'players':
              return (
                <PlayersPage
                  onBack={goToHome}
                  onViewPlayerProfile={goToPlayerProfile}
                />
              );
            case 'playerProfile':
              if (selectedPlayerId === null) {
                return (
                  <div className="text-center">
                    <p className="text-red-500">No player selected.</p>
                    <Button onClick={goToPlayersList} variant="primary" className="mt-4">
                      Go to Players List
                    </Button>
                  </div>
                );
              }
              return (
                <PlayerProfilePage
                  playerId={selectedPlayerId}
                  onBack={goToPlayersList}
                  onUpdatePlayer={updatePlayer}
                  onDeletePlayer={deletePlayer}
                  loading={loading}
                  error={error}
                  clearError={clearPlayerError}
                />
              );
            default:
              return <HomePage onGoToPlayers={goToPlayersList} />;
          }
        })()}
      </div>
    </div>
  );
}

export default App;