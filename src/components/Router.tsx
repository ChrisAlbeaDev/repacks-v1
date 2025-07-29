// src/components/Router.tsx
import React from 'react';
import { HomePage, PlayersPage, AuthPage, CardsPage, RepacksPage, PromosPage, GameViewPage } from '../pages'; // New import: GameViewPage
import { PlayerProfilePage, PlayerPaymentsPage } from '../pages/players';
import { Button } from './Button';
import { Player } from '../pages/players/types';
import { Card } from '../pages/cards/types';
import { Repack, RepackWithPromos } from '../pages/repacks/types';
import { Promo } from '../pages/promos/types';
import { supabase } from '../lib/supabaseClient';

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards' | 'cardInfo' | 'repacks' | 'promos' | 'repackInfo' | 'promoInfo' | 'gameView'; // Updated AppView

interface RouterProps {
  currentView: AppView;
  isAuthenticated: boolean;
  authError: string | null;
  userId: string | null;
  // Player-related props
  players: Player[];
  playersLoading: boolean;
  playersError: string | null;
  addPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  updatePlayer: (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>>, profilePicFile: File | null, shouldClearProfilePic: boolean) => Promise<Player | undefined>;
  deletePlayer: (playerId: string) => Promise<void>;
  clearPlayerError: () => void;
  // Card-related props
  cards: Card[];
  cardsLoading: boolean;
  cardsError: string | null;
  addCard: (jsonData: any[]) => Promise<Card[] | undefined>;
  updateCard: (cardId: string, updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>) => Promise<Card | undefined>;
  deleteCard: (cardId: string) => Promise<void>;
  fetchCardById: (cardId: string) => Promise<Card | null>;
  clearCardError: () => void;
  // Repack-related props (Router still needs to know about Repack functions to pass them to GameViewPage)
  repacks: Repack[];
  repacksLoading: boolean;
  repacksError: string | null;
  addRepack: (newRepack: Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>) => Promise<Repack | undefined>;
  updateRepack: (repackId: string, updatedFields: Partial<Omit<Repack, 'id' | 'repacks_id' | 'inserted_at' | 'user_id'>>) => Promise<Repack | undefined>;
  deleteRepack: (repackId: string) => Promise<void>;
  fetchRepackById: (repackId: string) => Promise<RepackWithPromos | null>;
  addPromosToRepack: (repackId: string, promoIds: string[]) => Promise<void>;
  removePromoFromRepack: (repackId: string, promoId: string) => Promise<void>;
  clearRepackError: () => void;
  // Promo-related props
  promos: Promo[];
  promosLoading: boolean;
  promosError: string | null;
  addPromo: (newPromo: Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>) => Promise<Promo | undefined>;
  updatePromo: (promoId: string, updatedFields: Partial<Omit<Promo, 'id' | 'promo_id' | 'inserted_at' | 'user_id'>>) => Promise<Promo | undefined>;
  deletePromo: (promoId: string) => Promise<void>;
  fetchPromoById: (promoId: string) => Promise<Promo | null>;
  clearPromoError: () => void;
  // Navigation functions
  onAuthSuccess: () => void;
  goToPlayersList: () => void;
  goToCardsList: () => void;
  goToRepacksList: () => void;
  goToPromosList: () => void;
  goToGameView: (repackId: string) => void; // New navigation function
  goToHome: () => void;
  goToPlayerProfile: (id: string) => void;
  goToPlayerPayments: (id: string, name: string) => void;
  // Selected item states
  selectedPlayerId: string | null;
  selectedPlayerName: string | null;
  selectedRepackForGameId: string | null; // New state
}

export const Router: React.FC<RouterProps> = ({
  currentView,
  isAuthenticated,
  authError,
  userId,
  players,
  playersLoading,
  playersError,
  addPlayer,
  updatePlayer,
  deletePlayer,
  clearPlayerError,
  cards,
  cardsLoading,
  cardsError,
  addCard,
  updateCard,
  deleteCard,
  fetchCardById,
  clearCardError,
  repacks,
  repacksLoading,
  repacksError,
  addRepack,
  updateRepack,
  deleteRepack,
  fetchRepackById,
  addPromosToRepack,
  removePromoFromRepack,
  clearRepackError,
  promos,
  promosLoading,
  promosError,
  addPromo,
  updatePromo,
  deletePromo,
  fetchPromoById,
  clearPromoError,
  onAuthSuccess,
  goToPlayersList,
  goToCardsList,
  goToRepacksList,
  goToPromosList,
  goToGameView, // Destructure new navigation function
  goToHome,
  goToPlayerProfile,
  goToPlayerPayments,
  selectedPlayerId,
  selectedPlayerName,
  selectedRepackForGameId, // Destructure new state
}) => {
  // Get currentUserId for pages that need it for their hooks
  const currentUserId = userId;

  // Diagnostic log: Check if goToGameView is received correctly from App.tsx
  console.log("Router: goToGameView prop received from App:", goToGameView);


  switch (currentView) {
    case 'auth':
      return <AuthPage onAuthSuccess={onAuthSuccess} />;
    case 'home':
      return <HomePage onGoToPlayers={goToPlayersList} onGoToCards={goToCardsList} onGoToRepacks={goToRepacksList} onGoToPromos={goToPromosList} />;
    case 'players':
      return (
        <PlayersPage
          onBack={goToHome}
          onViewPlayerProfile={goToPlayerProfile}
          isAuthenticated={isAuthenticated}
          authError={authError}
          players={players}
          loading={playersLoading}
          error={playersError}
          addPlayer={addPlayer}
          deletePlayer={deletePlayer}
          clearPlayerError={clearPlayerError}
        />
      );
    case 'cards':
      return (
        <CardsPage
          onBack={goToHome}
          isAuthenticated={isAuthenticated}
          authError={authError}
          currentUserId={currentUserId}
        />
      );
    case 'repacks':
      // Diagnostic log: Check if onViewGame is passed to RepacksPage
      console.log("Router: Passing onViewGame to RepacksPage:", goToGameView);
      return (
        <RepacksPage
          onBack={goToHome}
          onViewGame={goToGameView} // Pass goToGameView to RepacksPage
          isAuthenticated={isAuthenticated}
          authError={authError}
          currentUserId={currentUserId}
          allPromos={promos} // Pass allPromos for ManageRepackPromosModal
          promosLoading={promosLoading}
          promosError={promosError}
          clearPromoError={clearPromoError}
        />
      );
    case 'promos':
      return (
        <PromosPage
          onBack={goToHome}
          isAuthenticated={isAuthenticated}
          authError={authError}
          currentUserId={currentUserId}
        />
      );
    case 'gameView': // New case for GameViewPage
      if (!selectedRepackForGameId) {
        return (
          <div className="text-center">
            <p className="text-red-500">No repack selected for game view.</p>
            <Button onClick={goToRepacksList} variant="primary" className="mt-4">
              Go to Repacks List
            </Button>
          </div>
        );
      }
      return (
        <GameViewPage
          repackId={selectedRepackForGameId}
          onBack={goToRepacksList}
          fetchRepackById={fetchRepackById} // Pass the fetch function from useRepacks
          loading={repacksLoading} // Pass overall loading from useRepacks
          error={repacksError} // Pass overall error from useRepacks
          clearError={clearRepackError} // Pass clear error from useRepacks
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
          loading={playersLoading}
          error={playersError}
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
    default:
      return <AuthPage onAuthSuccess={onAuthSuccess} />;
  }
};
