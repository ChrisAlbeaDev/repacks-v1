// src/components/Layout.tsx
import React from 'react';
import { Button } from './Button'; // Assuming Button is in components folder

interface LayoutProps {
  isAuthenticated: boolean;
  userId: string | null;
  authError: string | null;
  onLogout: () => void;
  children: React.ReactNode; // This will render the current page
}

export const Layout: React.FC<LayoutProps> = ({
  isAuthenticated,
  userId,
  authError,
  onLogout,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Authentication Error:</strong>
            <span className="block sm:inline"> {authError}</span>
          </div>
        )}

        {isAuthenticated && userId && (
          <div className="text-sm text-gray-600 mb-4 text-center">
            Logged in as: <span className="font-mono text-blue-700 break-all">{userId}</span>
            <Button onClick={onLogout} variant="secondary" className="ml-4 px-3 py-1 text-sm">
              Logout
            </Button>
          </div>
        )}

        {/* This is where your current page content will be rendered */}
        {children}
      </div>
    </div>
  );
};
