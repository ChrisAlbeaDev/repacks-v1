// src/App.tsx
import { useState, useEffect } from 'react';
import { HomePage, PlayersPage, AuthPage } from './pages'; // Added AuthPage
import { PlayerProfilePage, PlayerPaymentsPage } from './pages/players';
import { usePlayers } from './pages/players/hooks/usePlayers'; // Will now accept props
import { Button } from './components/Button';
import { supabase, subscribeToSupabaseAuth, getSupabaseAuthState } from './lib/supabaseClient'; // Import new auth functions

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('auth'); // Start at auth page
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // To display userId

  // Pass isAuthenticated and userId to usePlayers
  const { players, loading, error, addPlayer, updatePlayer, deletePlayer, clearPlayerError } = usePlayers({ isAuthenticated, currentUserId: userId });

  useEffect(() => {
    // This effect runs once on mount to set initial auth state and subscribe.
    // It should NOT have currentView in its dependency array to prevent re-running
    // and overriding navigation when currentView changes.

    let isMounted = true; // Flag to prevent state updates on unmounted component

    // Subscribe to Supabase auth state changes
    const unsubscribe = subscribeToSupabaseAuth((state) => {
      if (!isMounted) return; // Prevent updates if component unmounted

      console.log("App.tsx: Auth state changed via subscription. User ID:", state.user?.id, "Loading:", state.loading, "Authenticated:", !!state.session); // Diagnostic log
      setAuthLoading(state.loading);
      setIsAuthenticated(!!state.session);
      setAuthError(state.error);
      setUserId(state.user?.id || null);

      // Redirect logic: Only redirect if the current view is 'auth' AND a session exists,
      // OR if no session exists AND the current view is NOT 'auth'.
      if (state.session && currentView === 'auth') {
        console.log("App.tsx: Redirecting from auth to home due to session (from subscription)."); // Diagnostic log
        setCurrentView('home');
      } else if (!state.session && currentView !== 'auth') {
        console.log("App.tsx: Redirecting to auth due to no session (from subscription)."); // Diagnostic log
        setCurrentView('auth');
      }
    });

    // Initial check on mount (before subscription might fire)
    const initialState = getSupabaseAuthState();
    if (isMounted) {
      console.log("App.tsx: Initial auth state check. User ID:", initialState.user?.id, "Loading:", initialState.loading, "Authenticated:", !!initialState.session); // Diagnostic log
      setAuthLoading(initialState.loading);
      setIsAuthenticated(!!initialState.session);
      setAuthError(initialState.error);
      setUserId(initialState.user?.id || null);

      // Initial view setting based on session
      if (!initialState.session) {
        console.log("App.tsx: Initial state - no session, setting view to auth."); // Diagnostic log
        setCurrentView('auth');
      } else {
        console.log("App.tsx: Initial state - session exists, setting view to home."); // Diagnostic log
        setCurrentView('home');
      }
    }

    return () => {
      isMounted = false; // Set flag to false on unmount
      unsubscribe(); // Cleanup subscription on unmount
      console.log("App.tsx: useEffect [auth setup] unmounted."); // Diagnostic log
    }
  }, []); // Empty dependency array: runs only once on component mount

  const handleAuthSuccess = () => {
    console.log("App.tsx: handleAuthSuccess called, setting view to home."); // Diagnostic log
    setCurrentView('home'); // Redirect to home after successful login/signup
  };

  const goToPlayersList = () => {
    console.log("App.tsx: goToPlayersList called, setting view to players."); // Diagnostic log
    setCurrentView('players');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  };

  const goToHome = () => {
    console.log("App.tsx: goToHome called, setting view to home."); // Diagnostic log
    setCurrentView('home');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  };

  const goToPlayerProfile = (id: string) => {
    console.log("App.tsx: goToPlayerProfile called for ID:", id); // Diagnostic log
    setSelectedPlayerId(id);
    setCurrentView('playerProfile');
  };

  const goToPlayerPayments = (id: string, name: string) => {
    console.log("App.tsx: goToPlayerPayments called for ID:", id, "Name:", name); // Diagnostic log
    setSelectedPlayerId(id);
    setSelectedPlayerName(name);
    setCurrentView('playerPayments');
  };

  const handleLogout = async () => {
    console.log("App.tsx: handleLogout called."); // Diagnostic log
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Logged out successfully.");
      setCurrentView('auth'); // Redirect to auth page after logout
    } catch (err: any) {
      console.error("Logout error:", err.message);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (authLoading) {
    console.log("App.tsx: Rendering authLoading state."); // Diagnostic log
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-700 text-lg">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  console.log("App.tsx: Rendering currentView:", currentView); // Diagnostic log
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Authentication Error:</strong>
            <span className="block sm:inline"> {authError}</span>
          </div>
        )}

        {isAuthenticated && userId && (
          <div className="text-sm text-gray-600 mb-4 text-center">
            Logged in as: <span className="font-mono text-blue-700 break-all">{userId}</span>
            <Button onClick={handleLogout} variant="secondary" className="ml-4 px-3 py-1 text-sm">
              Logout
            </Button>
          </div>
        )}

        {(() => {
          switch (currentView) {
            case 'auth':
              return <AuthPage onAuthSuccess={handleAuthSuccess} />;
            case 'home':
              return <HomePage onGoToPlayers={goToPlayersList} />;
            case 'players':
              console.log("App.tsx: Switching to PlayersPage. isAuthenticated:", isAuthenticated, "loading:", loading, "error:", error, "players count:", players.length); // Diagnostic log
              return (
                <PlayersPage
                  onBack={goToHome}
                  onViewPlayerProfile={goToPlayerProfile}
                  isAuthenticated={isAuthenticated}
                  authError={authError}
                  players={players} // Pass players from usePlayers
                  loading={loading} // Pass loading from usePlayers
                  error={error} // Pass error from usePlayers
                  addPlayer={addPlayer} // Pass addPlayer from usePlayers
                  deletePlayer={deletePlayer} // Pass deletePlayer from usePlayers
                  clearPlayerError={clearPlayerError} // Pass clearPlayerError from usePlayers
                />
              );
            case 'playerProfile':
              console.log("App.tsx: Switching to PlayerProfilePage. Selected Player ID:", selectedPlayerId); // Diagnostic log
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
              console.log("App.tsx: Switching to PlayerPaymentsPage. Selected Player ID:", selectedPlayerId); // Diagnostic log
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
            default:
              console.log("App.tsx: Default case, returning AuthPage."); // Diagnostic log
              return <AuthPage onAuthSuccess={handleAuthSuccess} />; // Default to auth page
          }
        })()}
      </div>
    </div>
  );
}

export default App;
