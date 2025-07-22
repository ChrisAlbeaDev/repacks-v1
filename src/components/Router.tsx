// src/components/Router.tsx
import React from 'react';
import { HomePage, PlayersPage, AuthPage } from '../pages';
import { PlayerProfilePage, PlayerPaymentsPage } from '../pages/players';
import { Button } from './Button'; // Assuming Button is in components folder
import { Player } from '../pages/players/types'; // Import Player type

type AppView = 'auth' | 'home' | 'players' | 'playerProfile' | 'playerPayments' | 'cards';

interface RouterProps {
  currentView: AppView;
  isAuthenticated: boolean;
  authError: string | null;
  // Player-related props
  players: Player[];
  playersLoading: boolean;
  playersError: string | null;
  addPlayer: (newItem: Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>) => Promise<Player | undefined>;
  updatePlayer: (playerId: string, updatedFields: Partial<Omit<Player, 'player_id' | 'inserted_at' | 'user_id'>>) => Promise<Player | undefined>;
  deletePlayer: (playerId: string) => Promise<void>;
  clearPlayerError: () => void;
  // Navigation functions
  onAuthSuccess: () => void;
  goToPlayersList: () => void;
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
  players,
  playersLoading,
  playersError,
  addPlayer,
  updatePlayer,
  deletePlayer,
  clearPlayerError,
  onAuthSuccess,
  goToPlayersList,
  goToHome,
  goToPlayerProfile,
  goToPlayerPayments,
  selectedPlayerId,
  selectedPlayerName,
}) => {
  switch (currentView) {
    case 'auth':
      return <AuthPage onAuthSuccess={onAuthSuccess} />;
    case 'home':
      return <HomePage onGoToPlayers={goToPlayersList}  />;
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
