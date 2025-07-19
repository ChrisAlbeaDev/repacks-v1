// src/features/auth/components/SignupForm.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { supabase } from '../../../lib/supabaseClient'; // Adjust path if necessary

interface SignupFormProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage('Signup successful! Please check your email for a confirmation link.');
        onSignupSuccess(); // Notify parent of successful signup
      } else {
        setMessage('Signup initiated. Please check your email for a confirmation link.');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <h3 className="text-xl font-bold text-gray-800 text-center">Sign Up</h3>
      <div>
        <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          id="signupEmail"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Password:
        </label>
        <input
          type="password"
          id="signupPassword"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm italic mt-1 text-center">{error}</p>}
      {message && <p className="text-green-600 text-sm italic mt-1 text-center">{message}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onSwitchToLogin}
        disabled={loading}
        className="w-full"
      >
        Already have an account? Login
      </Button>
    </form>
  );
};
