// src/features/repacks/components/RepackList.tsx
import React from 'react';
import { Repack } from '../types';
import { Button } from '../../../components/Button';

interface RepackListProps {
  repacks: Repack[];
  onViewRepackDetails: (repackId: string) => void;
  onViewGame: (repackId: string) => void; // New prop for game view
  isAuthenticated: boolean;
}

export const RepackList: React.FC<RepackListProps> = ({
  repacks,
  onViewRepackDetails,
  onViewGame, // Destructure new prop
  isAuthenticated,
}) => {
  if (repacks.length === 0) {
    return null; // Parent component can show "No repacks found" message
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Title</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {repacks.map((repack) => (
            <tr key={repack.repacks_id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-800">{repack.title}</td>
              <td className="py-3 px-4 text-gray-600">{repack.date}</td>
              <td className="py-3 px-4 text-gray-600">{repack.quantity}</td>
              <td className="py-3 px-4 text-gray-600">₱{repack.price.toFixed(2)}</td>
              <td className="py-3 px-4 text-gray-600">{repack.status}</td>
              <td className="py-3 px-4 flex space-x-2">
                <Button
                  onClick={() => onViewRepackDetails(repack.repacks_id)}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  View
                </Button>
                <Button
                  onClick={() => onViewGame(repack.repacks_id)} // New button for Game View
                  variant="primary"
                  className="text-sm px-3 py-1"
                >
                  Play Game
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
