import { AddPlayerForm, PlayerList } from './features/players'; // Corrected import path
import { usePlayers } from './hooks/usePlayers';
import { Button } from './components/Button';
import { useState } from 'react';

type AppView = 'home' | 'players';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Use the custom hook to manage player data and CRUD operations
  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers();

  const goToPlayersList = () => {
    setCurrentView('players');
  };

  const goToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {currentView === 'home' ? (
          // Homepage View
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Welcome to OPTCG App
            </h1>
            <Button
              onClick={goToPlayersList}
              variant="primary" // Using the new Button component
              size="lg"
            >
              Go to Players List
            </Button>
          </div>
        ) : (
          // Players List Page View
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
              onBack={goToHome} // Pass the back function to PlayerList
              clearError={clearPlayerError} // Pass clearError to PlayerList
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;