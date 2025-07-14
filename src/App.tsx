import { useState } from 'react';
import { PlayersPage } from './features/players'; // NEW: Import PlayersPage from its barrel file
import { HomePage } from './components/HomePage'; // NEW: Import HomePage
import { Button } from './components/Button'; // Keep Button import if needed elsewhere in App.tsx directly

type AppView = 'home' | 'players';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');

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
          <HomePage onGoToPlayers={goToPlayersList} />
        ) : (
          <PlayersPage onBack={goToHome} />
        )}
      </div>
    </div>
  );
}

export default App;