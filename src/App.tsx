// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { usePlayers } from './pages/players/hooks/usePlayers';
import { useCards } from './pages/cards/hooks/useCards';
import { useRepacks } from './pages/repacks/hooks/useRepacks'; // New import
import { usePromos } from './pages/promos/hooks/usePromos';   // New import
import { supabase, subscribeToSupabaseAuth, getSupabaseAuthState } from './lib/supabaseClient';
import { Layout } from './components/Layout';
import { Router } from './components/Router';

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards' | 'repacks' | 'promos' | 'gameView'; // Updated AppView with 'gameView'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [selectedRepackForGameId, setSelectedRepackForGameId] = useState<string | null>(null); // New state for game view

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

  const goToRepacksList = useCallback(() => {
    setCurrentView('repacks');
    setSelectedRepackForGameId(null); // Clear selected repack when going back to list
  }, []);

  const goToPromosList = useCallback(() => {
    setCurrentView('promos');
  }, []);

  const goToGameView = useCallback((repackId: string) => { // New navigation function
    setSelectedRepackForGameId(repackId);
    setCurrentView('gameView');
  }, []);

  const goToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
    setSelectedRepackForGameId(null); // Clear selected repack on going home
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

      setCurrentView(prevView => {
        if (state.session && prevView === 'auth') {
          return 'home';
        } else if (!state.session && prevView !== 'auth') {
          return 'auth';
        }
        return prevView;
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
  }, []);

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
        userId={userId}
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
        addCard={uploadJsonCards}
        updateCard={updateCard}
        deleteCard={deleteCard}
        fetchCardById={fetchCardById}
        clearCardError={clearCardError}
        repacks={repacks}
        repacksLoading={repacksLoading}
        repacksError={repacksError}
        addRepack={addRepack}
        updateRepack={updateRepack}
        deleteRepack={deleteRepack}
        fetchRepackById={fetchRepackById}
        addPromosToRepack={addPromosToRepack}
        removePromoFromRepack={removePromoFromRepack}
        clearRepackError={clearRepackError}
        promos={promos}
        promosLoading={promosLoading}
        promosError={promosError}
        addPromo={addPromo}
        updatePromo={updatePromo}
        deletePromo={deletePromo}
        fetchPromoById={fetchPromoById}
        clearPromoError={clearPromoError}
        onAuthSuccess={handleAuthSuccess}
        goToPlayersList={goToPlayersList}
        goToCardsList={goToCardsList}
        goToRepacksList={goToRepacksList}
        goToPromosList={goToPromosList}
        goToGameView={goToGameView} // Pass new navigation function
        goToHome={goToHome}
        goToPlayerProfile={goToPlayerProfile}
        goToPlayerPayments={goToPlayerPayments}
        selectedPlayerId={selectedPlayerId}
        selectedPlayerName={selectedPlayerName}
        selectedRepackForGameId={selectedRepackForGameId} // Pass new state
      />
    </Layout>
  );
}

export default App;
