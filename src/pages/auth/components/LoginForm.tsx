// src/features/auth/components/LoginForm.tsx
import React, { useState } from 'react';
import { Button } from '../../../components/Button'; // Adjust path if necessary
import { supabase } from '../../../lib/supabaseClient'; // Adjust path if necessary

interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      onLoginSuccess(); // Notify parent of successful login
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <h3 className="text-xl font-bold text-gray-800 text-center">Login</h3>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password:
        </label>
        <input
          type="password"
          id="password"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm italic mt-1 text-center">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onSwitchToSignup}
        disabled={loading}
        className="w-full"
      >
        Don't have an account? Sign Up
      </Button>
    </form>
  );
};
