import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Adjust path if needed

// Define a type for your todo item for better type safety
interface Todo {
  id: number;
  name: string;
  inserted_at: string; // Supabase often adds this column automatically
}

function App() {
  const [players, setPlayers] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');

  // Function to fetch todos from Supabase
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players') // Specify the table name
        .select('*') // Select all columns
        .order('id', { ascending: true }); // Order by id

      if (error) {
        throw error;
      }
      setPlayers(data || []); // Set todos, or an empty array if data is null
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching players:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new todo
  const addPlayer = async () => {
    if (!newName.trim()) return; // Don't add empty tasks

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .insert([{ name: newName.trim() }])
        .select(); // Select the newly inserted row

      if (error) {
        throw error;
      }
      setPlayers((prevPlayers) => [...prevPlayers, data[0]]); // Add the new todo to the state
      setNewName(''); // Clear the input field
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding player:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch todos when the component mounts
  useEffect(() => {
    fetchPlayers();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          What IF OPTCG Players
        </h1>

        <div className="mb-6 flex space-x-2">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addPlayer();
              }
            }}
          />
          <button
            onClick={addPlayer}
            className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {loading && players.length === 0 && <p className="text-center text-gray-600">Loading players...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && players.length === 0 && !error && (
          <p className="text-center text-gray-600">No players yet. Add one!</p>
        )}

        <ul className="space-y-3">
          {players.map((player) => (
            <li
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-md transition duration-200`}
            >
              <span className="text-lg">{player.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
``