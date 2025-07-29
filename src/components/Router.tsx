// src/components/Router.tsx
import React from 'react';
import { HomePage, PlayersPage, AuthPage, CardsPage, RepacksPage, PromosPage } from '../pages'; // New imports
import { PlayerProfilePage, PlayerPaymentsPage } from '../pages/players';
import { Button } from './Button';
import { Player } from '../pages/players/types';
import { Card } from '../pages/cards/types'; // Correct Card import
import { Repack, RepackWithPromos } from '../pages/repacks/types'; // New imports for Repack types
import { Promo } from '../pages/promos/types'; // Corrected: Import Promo from promos/types
// Removed: import { supabase } from '../lib/supabaseClient'; // No longer needed for currentUserId here

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards' | 'cardInfo' | 'repacks' | 'promos' | 'repackInfo' | 'promoInfo'; // Updated AppView

interface RouterProps {
  currentView: AppView;
  isAuthenticated: boolean;
  authError: string | null;
  userId: string | null; // Added userId prop to RouterProps
  // Player-related props
  players: Player[];
  playersLoading: boolean;
  playersError: string | null;
  addPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  updatePlayer: (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id' | 'profile_pic_url'>>, profilePicFile: File | null, shouldClearProfilePic: boolean) => Promise<Player | undefined>;
  deletePlayer: (playerId: string) => Promise<void>;
  clearPlayerError: () => void;
  // Card-related props (These are now passed to CardsPage via its own useCards hook)
  // The Router itself does not need to pass them directly to CardsPage
  // CardsPage will use its own useCards hook.
  // We keep the types here for the Router's overall knowledge of the app's state/functions.
  cards: Card[];
  cardsLoading: boolean;
  cardsError: string | null;
  addCard: (jsonData: any[]) => Promise<Card[] | undefined>; // Changed to match uploadJsonCards
  updateCard: (cardId: string, updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>) => Promise<Card | undefined>;
  deleteCard: (cardId: string) => Promise<void>;
  fetchCardById: (cardId: string) => Promise<Card | null>; // New prop
  clearCardError: () => void;
  // Repack-related props (These are now passed to RepacksPage via its own useRepacks hook)
  // The Router itself does not need to pass them directly to RepacksPage
  // RepacksPage will use its own useRepacks hook.
  // We keep the types here for the Router's overall knowledge of the app's state/functions.
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
  // Promo-related props (These are now passed to PromosPage via its own usePromos hook)
  // The Router itself does not need to pass them directly to PromosPage
  // PromosPage will use its own usePromos hook.
  promos: Promo[]; // All promos for selection in Repack management
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
  goToRepacksList: () => void; // New navigation
  goToPromosList: () => void;   // New navigation
  goToHome: () => void;
  goToPlayerProfile: (id: string) => void;
  goToPlayerPayments: (id: string, name: string) => void;
  // Selected item states
  selectedPlayerId: string | null;
  selectedPlayerName: string | null;
}

export const Router: React.FC<RouterProps> = ({
  currentView,
  isAuthenticated,
  authError,
  userId, // Destructure userId prop
  players,
  playersLoading,
  playersError,
  addPlayer,
  updatePlayer,
  deletePlayer,
  clearPlayerError,
  // Removed direct passing of cards, repacks, promos, and their CRUD functions
  // as CardsPage, RepacksPage and PromosPage now manage their own data fetching.
  onAuthSuccess,
  goToPlayersList,
  goToCardsList,
  goToRepacksList,
  goToPromosList,
  goToHome,
  goToPlayerProfile,
  goToPlayerPayments,
  selectedPlayerId,
  selectedPlayerName,
}) => {
  // Use the userId prop directly instead of accessing supabase.auth.currentUser
  const currentUserId = userId;

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
          players={players} // These props are still passed from App.tsx's usePlayers
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
          currentUserId={currentUserId} // Pass currentUserId to CardsPage
          // CardsPage will use its own useCards hook.
          // So, no need to pass cards or their CRUD functions here.
        />
      );
    case 'repacks':
      return (
        <RepacksPage
          onBack={goToHome}
          isAuthenticated={isAuthenticated}
          authError={authError}
          currentUserId={currentUserId} // Pass currentUserId to RepacksPage
          // RepacksPage will use its own useRepacks and usePromos hooks
          // So, no need to pass repacks, promos, or their CRUD functions here.
        />
      );
    case 'promos':
      return (
        <PromosPage
          onBack={goToHome}
          isAuthenticated={isAuthenticated}
          authError={authError}
          currentUserId={currentUserId} // Pass currentUserId to PromosPage
          // PromosPage will use its own usePromos hook.
          // So, no need to pass promos or their CRUD functions here.
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
