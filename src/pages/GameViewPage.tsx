// src/pages/GameViewPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { RepackWithPromos } from '../pages/repacks/types';
// No need to import useRepacks here, as fetchRepackById is passed as a prop

interface GameViewPageProps {
  repackId: string;
  onBack: () => void;
  fetchRepackById: (repackId: string) => Promise<RepackWithPromos | null>; // From useRepacks hook
  loading: boolean; // Overall loading from useRepacks
  error: string | null; // Overall error from useRepacks
  clearError: () => void;
}

export const GameViewPage: React.FC<GameViewPageProps> = ({
  repackId,
  onBack,
  fetchRepackById,
  loading, // Overall loading from useRepacks
  error,   // Overall error from useRepacks
  clearError,
}) => {
  const [repack, setRepack] = useState<RepackWithPromos | null>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRepackForGame = async () => {
      if (!repackId) {
        setRepack(null);
        setGameLoading(false);
        setGameError("No repack ID provided for game view.");
        return;
      }

      setGameLoading(true);
      setGameError(null);
      clearError(); // Clear any global errors

      try {
        const fetchedRepack = await fetchRepackById(repackId);
        if (isMounted) {
          if (fetchedRepack) {
            setRepack(fetchedRepack);
          } else {
            setRepack(null);
            setGameError("Repack not found for game view or you don't have permission.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading repack for game view:", err.message);
          setGameError(err.message);
          setRepack(null);
        }
      } finally {
        if (isMounted) {
          setGameLoading(false);
        }
      }
    };

    loadRepackForGame();

    return () => {
      isMounted = false;
    };
  }, [repackId, fetchRepackById, clearError]);

  const overallLoading = loading || gameLoading;
  const overallError = error || gameError;

  if (overallLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading game setup...
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="text-center">
        <p className="text-red-500 mt-2">Error: {overallError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Back to Repacks
        </Button>
      </div>
    );
  }

  if (!repack) {
    return (
      <div className="text-center">
        <p className="text-red-500">Repack not found for game view.</p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Go to Repacks List
        </Button>
      </div>
    );
  }

  const numberOfSlots = repack.quantity; // Get quantity from the repack

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Game View for: {repack.title}
      </h2>
      <p className="text-gray-600 text-center">
        Click a slot to reveal! ({numberOfSlots} slots available)
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4 bg-gray-100 rounded-lg shadow-inner">
        {Array.from({ length: numberOfSlots }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center w-20 h-20 bg-blue-500 text-white text-xl font-bold rounded-lg shadow-md cursor-pointer hover:bg-blue-600 transition duration-150 ease-in-out"
            onClick={() => console.log(`Clicked slot ${i + 1}`)} // Placeholder click handler
          >
            {i + 1}
          </div>
        ))}
      </div>

      <Button onClick={onBack} variant="secondary" className="w-full">
        Back to Repacks
      </Button>
    </div>
  );
};
