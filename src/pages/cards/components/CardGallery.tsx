// src/features/cards/components/CardGallery.tsx
import React, { useState, useRef, useMemo } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Card, JsonCardInput } from '../types'; // Import Card and JsonCardInput types

interface CardGalleryProps {
  cards: Card[]; // All cards fetched from the hook
  onUploadJsonCards: (jsonData: JsonCardInput[]) => Promise<Card[] | undefined>;
  // onDeleteCard: (cardId: string) => Promise<void>; // Removed from gallery, now only on info page
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
  onViewCardDetails: (cardId: string) => void; // New prop for viewing card details
}

// Define valid sort keys for Card
type CardSortKey = 'box_name' | 'display_name' | 'card_code' | 'inserted_at';

export const CardGallery: React.FC<CardGalleryProps> = ({
  cards,
  onUploadJsonCards,
  // onDeleteCard, // Removed from props
  loading,
  error,
  clearError,
  isAuthenticated,
  onViewCardDetails, // Destructure new prop
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for search and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<CardSortKey>('box_name'); // Default sort by box_name
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Default ascending

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(6); // You can adjust this number

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/json') {
        setSelectedFile(file);
        clearError();
      } else {
        setSelectedFile(null);
        clearError();
        alert('Please select a JSON file.'); // In a real app, use a custom modal for alerts
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a JSON file to upload.');
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to upload cards.');
      return;
    }

    clearError();

    try {
      const fileContent = await selectedFile.text();
      const jsonData: JsonCardInput[] = JSON.parse(fileContent);

      if (!Array.isArray(jsonData) || jsonData.some(item =>
        !item.box_name || !item.display_name || !item.card_code || !item.image_filename
      )) {
        alert('Invalid JSON format. Expected an array of objects with "box_name", "display_name", "card_code", and "image_filename".');
        return;
      }

      await onUploadJsonCards(jsonData);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCurrentPage(1); // Reset to first page after upload
    } catch (parseError: any) {
      console.error('Error parsing JSON or uploading:', parseError);
      alert(`Error processing file: ${parseError.message}. Please check file format.`);
    }
  };

  // Memoize filtered and sorted cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards;

    // 1. Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = cards.filter(card =>
        card.display_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        card.card_code.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // 2. Sort the filtered cards
    if (sortKey) {
      filtered.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortKey === 'display_name' || sortKey === 'box_name' || sortKey === 'card_code') {
          valA = a[sortKey].toLowerCase();
          valB = b[sortKey].toLowerCase();
        } else if (sortKey === 'inserted_at') {
          valA = new Date(a.inserted_at).getTime();
          valB = new Date(b.inserted_at).getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [cards, searchTerm, sortKey, sortDirection]);

  // Pagination logic
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredAndSortedCards.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(filteredAndSortedCards.length / cardsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Reset page to 1 if filters/sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortDirection]);

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Card Management</h2>

      {/* JSON Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Upload Cards (JSON)</h3>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={loading || !isAuthenticated}
        />
        {selectedFile && (
          <p className="text-sm text-gray-500">Selected file: {selectedFile.name}</p>
        )}
        {error && <p className="text-red-500 text-sm italic mt-2">{error}</p>}
        <Button
          onClick={handleUpload}
          variant="primary"
          loading={loading}
          disabled={!selectedFile || loading || !isAuthenticated}
          className="w-full"
        >
          {loading ? 'Uploading...' : 'Upload JSON Cards'}
        </Button>
        {!isAuthenticated && (
          <p className="text-center text-gray-500 text-sm italic">
            Sign in to upload cards.
          </p>
        )}
      </div>

      {/* Card Gallery Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Your Card Collection</h3>

        {/* Search and Sort Controls */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <input
            type="text"
            placeholder="Search by display name or card code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <label htmlFor="sortKey" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sortKey"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as CardSortKey)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="box_name">Box Name</option>
              <option value="display_name">Display Name</option>
              <option value="card_code">Card Code</option>
              <option value="inserted_at">Date Added</option>
            </select>
            <Button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              {sortDirection === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
            </Button>
          </div>
        </div>

        {loading && filteredAndSortedCards.length === 0 && <p className="text-center text-gray-600">Loading cards...</p>}
        {!loading && filteredAndSortedCards.length === 0 && !error && (
          <p className="text-center text-gray-600">
            {searchTerm ? `No cards found matching "${searchTerm}".` : 'No cards uploaded yet.'}
          </p>
        )}

        {filteredAndSortedCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCards.map((card) => ( // Use currentCards for pagination
              <div
                key={card.card_id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => onViewCardDetails(card.card_id)} // Make the whole card clickable
              >
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {card.image_name ? (
                    <img
                      src={`/src/assets/images/cards/${card.image_name}`}
                      alt={card.display_name}
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/150x200/cccccc/333333?text=No+Image'; // Fallback image
                        e.currentTarget.alt = 'Image not found';
                      }}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">No Image</span>
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 break-words">{card.display_name}</h4>
                    <p className="text-sm text-gray-600">Box: {card.box_name}</p>
                    <p className="text-sm text-gray-600">Code: {card.card_code}</p>
                  </div>
                  {/* Removed Delete Button from Gallery View for better UX */}
                  {/* <Button
                    onClick={() => onDeleteCard(card.card_id)}
                    variant="danger"
                    className="mt-3 w-full text-sm"
                    disabled={loading || !isAuthenticated}
                  >
                    Delete Card
                  </Button> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="flex justify-center items-center space-x-2 mt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              className="px-4 py-2"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                onClick={() => paginate(page)}
                variant={currentPage === page ? 'primary' : 'secondary'}
                className={`px-4 py-2 ${currentPage === page ? 'font-bold' : ''}`}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary"
              className="px-4 py-2"
            >
              Next
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
};
