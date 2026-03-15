import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import useGameStore from '../store/gameStore';

export default function LocalGamePage() {
  const navigate = useNavigate();
  const initGame = useGameStore((s) => s.initGame);

  useEffect(() => {
    initGame(2);
  }, [initGame]);

  return (
    <div>
      <div className="bg-amber-700 text-white text-xs text-center py-1">
        Local Test Mode — no backend required
        <button
          onClick={() => navigate('/lobby')}
          className="ml-4 underline hover:no-underline"
        >
          ← Back to Lobby
        </button>
      </div>
      <Board />
    </div>
  );
}
