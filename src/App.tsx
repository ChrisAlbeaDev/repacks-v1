// src/App.tsx
import { useState, useEffect } from 'react';
import { HomePage, PlayersPage, CardsPage } from './pages'; // Import CardsPage
import { PlayerProfilePage, PlayerPaymentsPage } from './pages/players';
import { usePlayers } from './pages/players/hooks/usePlayers';
import { Button } from './components/Button';
import { subscribeToSupabaseAuth } from './lib/supabaseClient'; // Only import supabase and subscribeToSupabaseAuth

type AppView = 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards'; // Add 'cards' view

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State for current user ID

  // Pass isAuthenticated and currentUserId to usePlayers
  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers({ isAuthenticated, currentUserId });

  // Use Supabase's own auth state listener
  useEffect(() => {
    const unsubscribe = subscribeToSupabaseAuth((authState) => {
      setIsAuthenticated(!!authState.session); // True if session exists
      setAuthError(authState.error);
      setIsAuthReady(!authState.loading); // Auth is ready when not loading
      setCurrentUserId(authState.user?.id || null);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Run once on component mount

  const goToPlayersList = () => {
    setCurrentView('players');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  };

  const goToHome = () => {
    setCurrentView('home');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  };

  const goToPlayerProfile = (id: string) => {
    setSelectedPlayerId(id);
    setCurrentView('playerProfile');
  };

  const goToPlayerPayments = (id: string, name: string) => {
    setSelectedPlayerId(id);
    setSelectedPlayerName(name);
    setCurrentView('playerPayments');
  };

  const goToCardsPage = () => { // New navigation function for CardsPage
    setCurrentView('cards');
  };

  // Show loading/error state while authentication is in progress
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-gray-700 text-lg">Initializing authentication...</p>
          {authError && <p className="text-red-500 text-sm mt-2">Error: {authError}</p>}
        </div>
      </div>
    );
  }

  // If auth process is complete but not authenticated, show an error and block access
  // This block is now for general Supabase auth errors, not specific to Firebase init.
  if (!isAuthenticated && authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-red-500 text-sm mb-4">
            You are not logged in or an authentication error occurred. Please log in to continue.
          </p>
          <p className="text-red-500 text-sm italic">Error: {authError}</p>
          {/* Optionally provide a way to retry or go home */}
          <Button onClick={goToHome} variant="primary" className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Only show general authError if it exists and we are authenticated, otherwise, the above block handles it */}
        {authError && isAuthenticated && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Authentication Warning:</strong>
            <span className="block sm:inline"> {authError}</span>
          </div>
        )}
        {(() => {
          switch (currentView) {
            case 'home':
              return <HomePage onGoToPlayers={goToPlayersList} onGoToCards={goToCardsPage} />;
            case 'players':
              return (
                <PlayersPage
                  onBack={goToHome}
                  onViewPlayerProfile={goToPlayerProfile}
                  isAuthenticated={isAuthenticated}
                  authError={authError}
                  // Pass players, loading, error, addPlayer, deletePlayer, clearPlayerError from usePlayers hook
                  players={players}
                  loading={loading}
                  error={error}
                  addPlayer={addPlayer}
                  deletePlayer={deletePlayer}
                  clearPlayerError={clearPlayerError}
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
                  onManagePayments={goToPlayerPayments}
                />
              );
            case 'playerPayments':
              if (selectedPlayerId === null || selectedPlayerName === null) {
                return (
                  <div className="text-center">
                    <p className="text-red-500">No player selected for payments.</p>
                    <Button onClick={goToPlayersList} variant="primary" className="mt-4">
                      Go to Players List
                    </Button>
                  </div>
                );
              }
              return (
                <PlayerPaymentsPage
                  playerId={selectedPlayerId}
                  playerName={selectedPlayerName}
                  onBack={() => goToPlayerProfile(selectedPlayerId)}
                />
              );
            case 'cards': // New case for the CardsPage
              return (
                <CardsPage
                  onBack={goToHome}
                  isAuthenticated={isAuthenticated}
                  authError={authError}
                  currentUserId={currentUserId} // Pass currentUserId to CardsPage
                />
              );
            default:
              return <HomePage onGoToPlayers={goToPlayersList} onGoToCards={goToCardsPage} />;
          }
        })()}
      </div>
    </div>
  );
}

export default App;
