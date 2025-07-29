// src/features/repacks/components/RepackList.tsx
import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/Button';
import { Repack } from '../types';

type RepackSortKey = 'title' | 'date' | 'price' | 'status' | 'inserted_at';

interface RepackListProps {
  repacks: Repack[];
  onViewRepackDetails: (repackId: string) => void;
  // onDeleteRepack: (repackId: string) => Promise<void>; // Delete moved to info page
  isAuthenticated: boolean;
}

export const RepackList: React.FC<RepackListProps> = ({
  repacks,
  onViewRepackDetails,
  // onDeleteRepack,
  isAuthenticated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<RepackSortKey>('inserted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [repacksPerPage] = useState(5); // Items per page

  const filteredAndSortedRepacks = useMemo(() => {
    let filtered = repacks;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = repacks.filter(repack =>
        repack.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        repack.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        repack.repacks_id.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortKey === 'date' || sortKey === 'inserted_at') {
          valA = new Date(a[sortKey]).getTime();
          valB = new Date(b[sortKey]).getTime();
        } else if (sortKey === 'price') {
          valA = a.price;
          valB = b.price;
        } else {
          valA = (a[sortKey as keyof Repack] || '').toString().toLowerCase();
          valB = (b[sortKey as keyof Repack] || '').toString().toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [repacks, searchTerm, sortKey, sortDirection]);

  // Pagination logic
  const indexOfLastRepack = currentPage * repacksPerPage;
  const indexOfFirstRepack = indexOfLastRepack - repacksPerPage;
  const currentRepacks = filteredAndSortedRepacks.slice(indexOfFirstRepack, indexOfLastRepack);

  const totalPages = Math.ceil(filteredAndSortedRepacks.length / repacksPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  React.useEffect(() => {
    setCurrentPage(1); // Reset page when filters/sort change
  }, [searchTerm, sortKey, sortDirection]);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
        <input
          type="text"
          placeholder="Search repacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-2">
          <label htmlFor="sortKey" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as RepackSortKey)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="inserted_at">Date Added</option>
            <option value="title">Title</option>
            <option value="date">Repack Date</option>
            <option value="price">Price</option>
            <option value="status">Status</option>
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

      {filteredAndSortedRepacks.length === 0 && searchTerm ? (
        <p className="text-center text-gray-600 mt-4">No repacks found matching "{searchTerm}".</p>
      ) : filteredAndSortedRepacks.length === 0 && !searchTerm ? (
        <p className="text-center text-gray-600 mt-4">No repacks available. Add one to get started!</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Title</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRepacks.map((repack) => (
              <tr key={repack.repacks_id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">{repack.title}</td>
                <td className="py-3 px-4 text-gray-600">{repack.date}</td>
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
                  {/* Delete button removed from list view, now on info page */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  );
};
