// src/pages/HomePage.tsx
import React from 'react';
import { Button } from '../components/Button'; // Adjust path if necessary

interface HomePageProps {
  onGoToPlayers: () => void;
  onGoToCards: () => void; // New prop for navigating to CardsPage
}

export const HomePage: React.FC<HomePageProps> = ({ onGoToPlayers, onGoToCards }) => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome to Your App!</h2>
      <p className="text-gray-600 text-center">
        Manage your players and card collections efficiently.
      </p>
      <Button onClick={onGoToPlayers} variant="primary" className="w-full">
        Go to Players List
      </Button>
      <Button onClick={onGoToCards} variant="secondary" className="w-full">
        Go to Card Database
      </Button>
    </div>
  );
};
