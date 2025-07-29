// src/features/promos/components/PromoList.tsx
import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/Button';
import { Promo } from '../types';

type PromoSortKey = 'title' | 'qty' | 'price' | 'inserted_at';

interface PromoListProps {
  promos: Promo[];
  onViewPromoDetails: (promoId: string) => void;
  isAuthenticated: boolean;
}

export const PromoList: React.FC<PromoListProps> = ({
  promos,
  onViewPromoDetails,
  isAuthenticated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<PromoSortKey>('inserted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [promosPerPage] = useState(5); // Items per page

  const filteredAndSortedPromos = useMemo(() => {
    let filtered = promos;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = promos.filter(promo =>
        promo.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        (promo.free && promo.free.toLowerCase().includes(lowerCaseSearchTerm)) ||
        promo.promo_id.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortKey === 'inserted_at') {
          valA = new Date(a[sortKey]).getTime();
          valB = new Date(b[sortKey]).getTime();
        } else if (sortKey === 'price' || sortKey === 'qty') {
          valA = a[sortKey];
          valB = b[sortKey];
        } else {
          valA = (a[sortKey as keyof Promo] || '').toString().toLowerCase();
          valB = (b[sortKey as keyof Promo] || '').toString().toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [promos, searchTerm, sortKey, sortDirection]);

  // Pagination logic
  const indexOfLastPromo = currentPage * promosPerPage;
  const indexOfFirstPromo = indexOfLastPromo - promosPerPage;
  const currentPromos = filteredAndSortedPromos.slice(indexOfFirstPromo, indexOfLastPromo);

  const totalPages = Math.ceil(filteredAndSortedPromos.length / promosPerPage);

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
          placeholder="Search promos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-2">
          <label htmlFor="sortKey" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as PromoSortKey)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="inserted_at">Date Added</option>
            <option value="title">Title</option>
            <option value="qty">Quantity</option>
            <option value="price">Price</option>
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

      {filteredAndSortedPromos.length === 0 && searchTerm ? (
        <p className="text-center text-gray-600 mt-4">No promos found matching "{searchTerm}".</p>
      ) : filteredAndSortedPromos.length === 0 && !searchTerm ? (
        <p className="text-center text-gray-600 mt-4">No promos available. Add one to get started!</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Title</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Qty</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Free</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPromos.map((promo) => (
              <tr key={promo.promo_id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">{promo.title}</td>
                <td className="py-3 px-4 text-gray-600">{promo.qty}</td>
                <td className="py-3 px-4 text-gray-600">{promo.free || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600">₱{promo.price.toFixed(2)}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <Button
                    onClick={() => onViewPromoDetails(promo.promo_id)}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    View
                  </Button>
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
