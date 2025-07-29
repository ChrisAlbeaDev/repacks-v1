// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { usePlayers } from './pages/players/hooks/usePlayers';
import { useCards } from './pages/cards/hooks/useCards';
import { useRepacks } from './pages/repacks/hooks/useRepacks'; // New import
import { usePromos } from './pages/promos/hooks/usePromos';   // New import
import { supabase, subscribeToSupabaseAuth, getSupabaseAuthState } from './lib/supabaseClient';
import { Layout } from './components/Layout';
import { Router } from './components/Router';

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards' | 'repacks' | 'promos'; // Updated AppView

function App() {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize usePlayers hook
  const {
    players,
    loading: playersLoading,
    error: playersError,
    addPlayer,
    updatePlayer,
    deletePlayer,
    clearPlayerError,
  } = usePlayers({ isAuthenticated, currentUserId: userId });

  // Initialize useCards hook
  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
    uploadJsonCards, // Renamed from addCard for JSON upload
    updateCard,
    deleteCard,
    fetchCardById,
    clearCardError,
  } = useCards({ isAuthenticated, currentUserId: userId });

  // Initialize useRepacks hook
  const {
    repacks,
    loading: repacksLoading,
    error: repacksError,
    addRepack,
    updateRepack,
    deleteRepack,
    fetchRepackById,
    addPromosToRepack,
    removePromoFromRepack,
    clearRepackError,
  } = useRepacks({ isAuthenticated, currentUserId: userId });

  // Initialize usePromos hook
  const {
    promos,
    loading: promosLoading,
    error: promosError,
    addPromo,
    updatePromo,
    deletePromo,
    fetchPromoById,
    clearPromoError,
  } = usePromos({ isAuthenticated, currentUserId: userId });


  // Memoized navigation functions
  const handleAuthSuccess = useCallback(() => {
    setCurrentView('home');
  }, []);

  const goToPlayersList = useCallback(() => {
    setCurrentView('players');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
  }, []);

  const goToCardsList = useCallback(() => {
    setCurrentView('cards');
  }, []);

  const goToRepacksList = useCallback(() => { // New navigation
    setCurrentView('repacks');
  }, []);

  const goToPromosList = useCallback(() => { // New navigation
    setCurrentView('promos');
  }, []);

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
      setCurrentView('auth');
    } catch (err: any) {
      console.error("Logout error:", err.message);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToSupabaseAuth((state) => {
      if (!isMounted) return;

      setAuthLoading(state.loading);
      setIsAuthenticated(!!state.session);
      setAuthError(state.error);
      setUserId(state.user?.id || null);

      // We use a functional update for currentView to ensure we have the latest state
      // without making currentView a dependency of this useEffect.
      setCurrentView(prevView => {
        if (state.session && prevView === 'auth') {
          return 'home';
        } else if (!state.session && prevView !== 'auth') {
          return 'auth';
        }
        return prevView; // Keep current view if no navigation change is needed
      });
    });

    const initialState = getSupabaseAuthState();
    if (isMounted) {
      setAuthLoading(initialState.loading);
      setIsAuthenticated(!!initialState.session);
      setAuthError(initialState.error);
      setUserId(initialState.user?.id || null);

      if (!initialState.session) {
        setCurrentView('auth');
      } else {
        setCurrentView('home');
      }
    }

    return () => {
      isMounted = false;
      unsubscribe();
    }
  }, []); // Changed dependency array to empty: runs only once on mount

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-gray-700 text-lg">Loading authentication state...</p>
        </div>
      </div>
    );
  }

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
        userId={userId} // Pass userId to Router
        players={players}
        playersLoading={playersLoading}
        playersError={playersError}
        addPlayer={addPlayer}
        updatePlayer={updatePlayer}
        deletePlayer={deletePlayer}
        clearPlayerError={clearPlayerError}
        cards={cards}
        cardsLoading={cardsLoading}
        cardsError={cardsError}
        addCard={uploadJsonCards} // Pass uploadJsonCards here
        updateCard={updateCard}
        deleteCard={deleteCard}
        fetchCardById={fetchCardById} // Pass fetchCardById
        clearCardError={clearCardError}
        repacks={repacks} // New: Pass repacks data
        repacksLoading={repacksLoading} // New: Pass repacks loading state
        repacksError={repacksError} // New: Pass repacks error state
        addRepack={addRepack} // New: Pass addRepack function
        updateRepack={updateRepack} // New: Pass updateRepack function
        deleteRepack={deleteRepack} // New: Pass deleteRepack function
        fetchRepackById={fetchRepackById} // New: Pass fetchRepackById function
        addPromosToRepack={addPromosToRepack} // New: Pass addPromosToRepack
        removePromoFromRepack={removePromoFromRepack} // New: Pass removePromoFromRepack
        clearRepackError={clearRepackError} // New: Pass clearRepackError
        promos={promos} // New: Pass promos data
        promosLoading={promosLoading} // New: Pass promos loading state
        promosError={promosError} // New: Pass promos error state
        addPromo={addPromo} // New: Pass addPromo function
        updatePromo={updatePromo} // New: Pass updatePromo function
        deletePromo={deletePromo} // New: Pass deletePromo function
        fetchPromoById={fetchPromoById} // New: Pass fetchPromoById function
        clearPromoError={clearPromoError} // New: Pass clearPromoError
        onAuthSuccess={handleAuthSuccess}
        goToPlayersList={goToPlayersList}
        goToCardsList={goToCardsList}
        goToRepacksList={goToRepacksList} // New navigation
        goToPromosList={goToPromosList}   // New navigation
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
