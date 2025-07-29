// src/pages/CardsPage.tsx
import React, { useState } from 'react';
import { Button } from '../components/Button'; // Adjust path if necessary
import { CardGallery } from '../pages/cards/components/CardGallery'; // Updated import
import { CardInfoPage } from '../pages/cards/components/CardInfoPage'; // New import
import { useCards } from '../pages/cards/hooks/useCards'; // Adjust path if necessary

interface CardsPageProps {
  onBack: () => void;
  isAuthenticated: boolean;
  authError: string | null;
  currentUserId: string | null; // Pass currentUserId to useCards hook
}

export const CardsPage: React.FC<CardsPageProps> = ({ onBack, isAuthenticated, authError, currentUserId }) => {
  // State to manage which card is currently selected for detailed view
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Use the useCards hook to manage card data and operations
  // Correctly destructure clearCardError
  const { cards, loading, error, uploadJsonCards, deleteCard, updateCard, fetchCardById, clearCardError } = useCards({ isAuthenticated, currentUserId });

  // Function to navigate to the Card Info Page
  const handleViewCardDetails = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  // Function to go back to the Card Gallery
  const handleBackToGallery = () => {
    setSelectedCardId(null);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Card Database</h2>

      {/* Display authentication error if present and not authenticated */}
      {!isAuthenticated && authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Authentication Error:</strong>
          <span className="block sm:inline"> {authError}</span>
          <p className="text-xs mt-1">Card management requires an authenticated session.</p>
        </div>
      )}

      {selectedCardId ? (
        // If a card is selected, show the CardInfoPage
        <CardInfoPage
          cardId={selectedCardId}
          onBack={handleBackToGallery}
          fetchCardById={fetchCardById}
          updateCard={updateCard}
          deleteCard={deleteCard}
          loading={loading}
          error={error}
          clearError={clearCardError} // Pass clearCardError as clearError prop
          isAuthenticated={isAuthenticated}
        />
      ) : (
        // Otherwise, show the CardGallery
        <CardGallery
          cards={cards}
          onUploadJsonCards={uploadJsonCards}
          loading={loading}
          error={error}
          clearError={clearCardError} // Pass clearCardError as clearError prop
          isAuthenticated={isAuthenticated}
          onViewCardDetails={handleViewCardDetails} // Pass the new callback
        />
      )}

      {/* Back to Home button, always visible */}
      {!selectedCardId && ( // Only show if not on CardInfoPage
        <Button onClick={onBack} variant="secondary" className="w-full">
          Back to Home
        </Button>
      )}
    </div>
  );
};
