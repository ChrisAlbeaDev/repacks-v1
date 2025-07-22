// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { HomePage, PlayersPage, AuthPage } from './pages'; // Added AuthPage
import { PlayerProfilePage, PlayerPaymentsPage } from './pages/players';
import { usePlayers } from './pages/players/hooks/usePlayers'; // Will now accept props
// Removed useCards import as per user's previous request to remove cards functionality
import { Button } from './components/Button';
import { supabase, subscribeToSupabaseAuth, getSupabaseAuthState } from './lib/supabaseClient'; // Import new auth functions
import { Layout } from './components/Layout'; // Import Layout component
import { Router } from './components/Router'; // Import Router component

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments'; // Removed 'cards' view

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

  // Removed useCards hook initialization as per user's request

  // Memoized navigation functions
  const handleAuthSuccess = useCallback(() => {
    setCurrentView('home'); // Redirect to home after successful login/signup
  }, []);

  const goToPlayersList = useCallback(() => {
    setCurrentView('players');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  }, []);

  // Removed goToCardsList as per user's request

  const goToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  }, []);

  const goToPlayerProfile = useCallback((id: string) => {
    setSelectedPlayerId(id);
    setCurrentView('playerProfile');
  }, []);

  const goToPlayerPayments = useCallback((id: string, name: string) => {
    setSelectedPlayerId(id);
    setSelectedPlayerName(name);
    setCurrentView('playerPayments');
  }, []);

  const handleLogout = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log("App.tsx: useEffect [auth setup] triggered."); // Diagnostic log

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
      // This prevents overriding user's navigation to other pages.
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
      // This part should only run once on initial mount to set the starting view
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

  if (authLoading) {
    console.log("App.tsx: Rendering authLoading state."); // Diagnostic log
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-gray-700 text-lg">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  console.log("App.tsx: Rendering currentView:", currentView); // Diagnostic log
  return (
    <Layout
      isAuthenticated={isAuthenticated}
      userId={userId}
      authError={authError}
      onLogout={handleLogout}
    >
      <Router
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        authError={authError}
        players={players}
        playersLoading={loading} // Use 'loading' directly from usePlayers
        playersError={error} // Use 'error' directly from usePlayers
        addPlayer={addPlayer}
        updatePlayer={updatePlayer}
        deletePlayer={deletePlayer}
        clearPlayerError={clearPlayerError}
        // Removed cards related props
        onAuthSuccess={handleAuthSuccess}
        goToPlayersList={goToPlayersList}
        // Removed goToCardsList
        goToHome={goToHome}
        goToPlayerProfile={goToPlayerProfile}
        goToPlayerPayments={goToPlayerPayments}
        selectedPlayerId={selectedPlayerId}
        selectedPlayerName={selectedPlayerName}
      />
    </Layout>
  );
}

export default App;
