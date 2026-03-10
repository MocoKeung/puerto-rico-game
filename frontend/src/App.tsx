import Board from './components/Board';
import useGameStore from './store/gameStore';

export default function App() {
  const { players, currentPlayerIndex } = useGameStore();

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-800">Puerto Rico</h1>
        <p className="text-lg text-amber-600">Current Player: {players[currentPlayerIndex].name}</p>
      </header>

      <main>
        <Board />
      </main>

      <footer className="mt-8 text-center text-amber-700">
        <p>Puerto Rico Game © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
