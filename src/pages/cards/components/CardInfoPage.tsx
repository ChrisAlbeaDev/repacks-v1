// src/features/cards/CardInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Card } from '../types'; // Adjust path if necessary
import { DeleteConfirmation } from '../../../components/DeleteConfirmation'; // Adjust path if necessary
import { EditCardModal } from './EditCardModal'; // New modal for editing

interface CardInfoPageProps {
  cardId: string; // The ID of the card to display
  onBack: () => void;
  // Props from useCards hook in parent (CardsPage.tsx)
  fetchCardById: (cardId: string) => Promise<Card | null>;
  updateCard: (cardId: string, updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>) => Promise<Card | undefined>;
  deleteCard: (cardId: string) => Promise<void>;
  loading: boolean; // Overall loading state from useCards hook
  error: string | null; // Overall error state from useCards hook
  clearError: () => void;
  isAuthenticated: boolean;
}

export const CardInfoPage: React.FC<CardInfoPageProps> = ({
  cardId,
  onBack,
  fetchCardById,
  updateCard,
  deleteCard,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [card, setCard] = useState<Card | null>(null);
  const [cardDetailsLoading, setCardDetailsLoading] = useState(true);
  const [cardDetailsError, setCardDetailsError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCardDetails = async () => {
      if (!cardId) {
        setCard(null);
        setCardDetailsLoading(false);
        setCardDetailsError("No card ID provided.");
        return;
      }

      setCardDetailsLoading(true);
      setCardDetailsError(null);
      clearError(); // Clear any global errors from parent

      try {
        const fetchedCard = await fetchCardById(cardId);
        if (isMounted) {
          if (fetchedCard) {
            setCard(fetchedCard);
          } else {
            setCard(null);
            setCardDetailsError("Card not found or you don't have permission to view it.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading card details:", err.message);
          setCardDetailsError(err.message);
          setCard(null);
        }
      } finally {
        if (isMounted) {
          setCardDetailsLoading(false);
        }
      }
    };

    loadCardDetails();

    return () => {
      isMounted = false;
    };
  }, [cardId, fetchCardById, clearError]);

  const handleUpdateCard = async (updatedFields: Partial<Omit<Card, 'id' | 'card_id' | 'inserted_at' | 'user_id'>>) => {
    if (!card) return undefined; // Return undefined if no card to update
    const updated = await updateCard(card.card_id, updatedFields);
    if (updated) {
      setCard(updated); // Update local state with the new card data
      setShowEditModal(false); // Close the modal on success
    }
    return updated; // Explicitly return the result of updateCard
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    clearError();
    setCardDetailsError(null);
    if (card) {
      await deleteCard(card.card_id);
      // If delete was successful (no error from useCards), go back to gallery
      if (!error) { // Check the error state from useCards after the operation
        onBack();
      } else {
        setCardDetailsError(error); // Display error if delete failed
      }
    }
  };

  const getCardImageUrl = (imageName: string | null) => {
    if (!imageName) return 'https://placehold.co/300x400/cccccc/333333?text=No+Image';
    // Assuming images are in src/assets/images/cards/
    // Add a cache-busting parameter (e.g., timestamp) to ensure fresh image load
    return `/src/assets/images/cards/${imageName}?t=${Date.now()}`;
  };

  const overallLoading = loading || cardDetailsLoading;
  const overallError = error || cardDetailsError;

  if (overallLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading card details...
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="text-center">
        <p className="text-red-500 mt-2">Error: {overallError}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Back to Card Gallery
        </Button>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center">
        <p className="text-red-500">Card not found.</p>
        <Button onClick={onBack} variant="primary" className="mt-4">
          Go to Card Gallery
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Card Details</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4 text-center">
        <div className="flex justify-center mb-4">
          <img
            src={getCardImageUrl(card.image_name)}
            alt={card.display_name}
            className="max-w-xs w-full h-auto rounded-lg shadow-lg border-2 border-blue-400 object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/300x400/cccccc/333333?text=No+Image'; // Fallback
              e.currentTarget.alt = 'Image not found';
            }}
          />
        </div>
        <p className="text-gray-700"><strong>Display Name:</strong> {card.display_name}</p>
        <p className="text-gray-700"><strong>Box Name:</strong> {card.box_name}</p>
        <p className="text-gray-700"><strong>Card Code:</strong> {card.card_code}</p>
        <p className="text-gray-700"><strong>Image File:</strong> {card.image_name || 'N/A'}</p>
        <p className="text-gray-700"><strong>Card ID:</strong> <span className="font-mono break-all">{card.card_id}</span></p>
        <p className="text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{card.user_id}</span></p>
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(card.inserted_at).toLocaleString()}</p>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Back to Gallery
        </Button>
        <Button onClick={() => setShowEditModal(true)} variant="primary" className="flex-1" disabled={!isAuthenticated}>
          Edit Card
        </Button>
        <Button onClick={confirmDelete} variant="danger" className="flex-1" disabled={!isAuthenticated}>
          Delete Card
        </Button>
      </div>

      {showEditModal && card && (
        <EditCardModal
          card={card}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateCard}
          loading={loading}
          error={error}
          clearError={clearError}
        />
      )}

      {showDeleteConfirm && card && (
        <DeleteConfirmation
          message={`Are you sure you want to delete card "${card.display_name}" (${card.card_code})? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={cancelDelete}
          loading={loading}
        />
      )}
    </div>
  );
};
