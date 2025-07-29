// src/features/cards/components/JsonCardUploader.tsx
import React, { useState, useRef } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { Card, JsonCardInput } from '../types'; // Import Card and JsonCardInput types

interface JsonCardUploaderProps {
  cards: Card[];
  onUploadJsonCards: (jsonData: JsonCardInput[]) => Promise<Card[] | undefined>;
  onDeleteCard: (cardId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

export const JsonCardUploader: React.FC<JsonCardUploaderProps> = ({
  cards,
  onUploadJsonCards,
  onDeleteCard,
  loading,
  error,
  clearError,
  isAuthenticated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/json') {
        setSelectedFile(file);
        clearError(); // Clear previous errors when a new file is selected
      } else {
        setSelectedFile(null);
        clearError();
        alert('Please select a JSON file.'); // Use a custom modal in a real app
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a JSON file to upload.'); // Use a custom modal
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to upload cards.'); // Use a custom modal
      return;
    }

    clearError();

    try {
      const fileContent = await selectedFile.text();
      const jsonData: JsonCardInput[] = JSON.parse(fileContent);

      // Basic validation: ensure it's an array of objects with expected properties
      if (!Array.isArray(jsonData) || jsonData.some(item =>
        !item.box_name || !item.display_name || !item.card_code || !item.image_filename
      )) {
        alert('Invalid JSON format. Expected an array of objects with "box_name", "display_name", "card_code", and "image_filename".');
        return;
      }

      await onUploadJsonCards(jsonData);
      setSelectedFile(null); // Clear selected file after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input element
      }
    } catch (parseError: any) {
      console.error('Error parsing JSON or uploading:', parseError);
      alert(`Error processing file: ${parseError.message}. Please check file format.`); // Use a custom modal
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Card Management</h2>

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

      <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Existing Cards</h3>
        {loading && cards.length === 0 && <p className="text-center text-gray-600">Loading cards...</p>}
        {!loading && cards.length === 0 && !error && (
          <p className="text-center text-gray-600">No cards uploaded yet.</p>
        )}

        {cards.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700">Display Name</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700">Box Name</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700">Card Code</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.card_id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-800 text-sm">{card.display_name}</td>
                    <td className="py-2 px-3 text-gray-600 text-sm">{card.box_name}</td>
                    <td className="py-2 px-3 text-gray-600 text-sm">{card.card_code}</td>
                    <td className="py-2 px-3">
                      <Button
                        onClick={() => onDeleteCard(card.card_id)}
                        variant="danger"
                        className="text-xs px-2 py-1"
                        disabled={loading || !isAuthenticated}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
