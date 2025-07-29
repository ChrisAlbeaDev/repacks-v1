// src/pages/HomePage.tsx
import React from 'react';
import { Button } from '../components/Button'; // Adjust path as necessary

interface HomePageProps {
  onGoToPlayers: () => void;
  onGoToCards: () => void;
  onGoToRepacks: () => void; // New prop
  onGoToPromos: () => void;   // New prop
}

export const HomePage: React.FC<HomePageProps> = ({ onGoToPlayers, onGoToCards, onGoToRepacks, onGoToPromos }) => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome to Your App!</h2>
      <p className="text-gray-600 text-center">
        Manage your players, card collections, repacks, and promos efficiently.
      </p>
      <Button onClick={onGoToPlayers} variant="primary" className="w-full">
        Go to Players List
      </Button>
      <Button onClick={onGoToCards} variant="secondary" className="w-full">
        Go to Card Database
      </Button>
      <Button onClick={onGoToRepacks} variant="primary" className="w-full">
        Go to Repacks
      </Button>
      <Button onClick={onGoToPromos} variant="secondary" className="w-full">
        Go to Promos
      </Button>
    </div>
  );
};
