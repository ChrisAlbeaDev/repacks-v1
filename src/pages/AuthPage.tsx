// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { LoginForm } from '../pages/auth/components/LoginForm'; // Adjust path if necessary
import { SignupForm } from '../pages/auth/components/SignupForm'; // Adjust path if necessary

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleAuthSuccess = () => {
    onAuthSuccess();
  };

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome!</h2>
      {isLoginView ? (
        <LoginForm
          onLoginSuccess={handleAuthSuccess}
          onSwitchToSignup={() => setIsLoginView(false)}
        />
      ) : (
        <SignupForm
          onSignupSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setIsLoginView(true)}
        />
      )}
    </div>
  );
};
