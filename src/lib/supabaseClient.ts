// src/lib/supabaseClient.ts
import { createClient, Session, User } from '@supabase/supabase-js';

// Define the Supabase Project URL
const supabaseUrl = 'https://drueqeumgoxlcnrkxfgz.supabase.co';

// Access your Supabase anon (public) key from Vite's environment variables.
// Ensure you have VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY_HERE in your .env file.
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Ensure the key is available (optional, but good for debugging)
if (!supabaseKey) {
  console.error('Supabase API key (VITE_SUPABASE_KEY) is not defined. Please check your .env file.');
  // In a production app, you might want to throw an error or show a user-friendly message.
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey as string);

// --- Supabase Authentication State Management ---
// This section manages the Supabase user session and provides it to the React app.

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

let authState: AuthState = {
  session: null,
  user: null,
  loading: true, // Initially loading authentication state
  error: null,
};

type AuthStateCallback = (state: AuthState) => void;
const authStateCallbacks: AuthStateCallback[] = [];

// Function to notify all registered callbacks of state changes
const notifyAuthStateChange = () => {
  authStateCallbacks.forEach(callback => callback(authState));
};

// Listen for Supabase Auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  console.log("Supabase Auth State Changed:", _event, session);
  authState = {
    session,
    user: session?.user || null,
    loading: false,
    error: null, // Clear error on successful state change
  };
  notifyAuthStateChange();
});

// Function to get the current auth state
export const getSupabaseAuthState = (): AuthState => {
  return authState;
};

// Function to subscribe to auth state changes
export const subscribeToSupabaseAuth = (callback: AuthStateCallback) => {
  authStateCallbacks.push(callback);
  // Immediately call the callback with the current state
  callback(authState);

  // Return an unsubscribe function
  return () => {
    const index = authStateCallbacks.indexOf(callback);
    if (index > -1) {
      authStateCallbacks.splice(index, 1);
    }
  };
};

// Initial check for session (useful on app load)
// This will trigger the onAuthStateChange listener if a session exists.
supabase.auth.getSession().then(({ data: { session } }) => {
  authState = {
    session,
    user: session?.user || null,
    loading: false,
    error: null,
  };
  notifyAuthStateChange();
}).catch((err) => {
  console.error("Error getting initial Supabase session:", err);
  authState = {
    session: null,
    user: null,
    loading: false,
    error: err.message,
  };
  notifyAuthStateChange();
});
