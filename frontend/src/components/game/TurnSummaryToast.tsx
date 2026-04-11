import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { X, ScrollText } from 'lucide-react';
import { useGameContext } from '../../contexts/GameContext';

interface TurnSummaryToastProps {
  onOpenLog: () => void;
}

interface LogEntry {
  message: string;
  seat: number | null;
}

const PLAYER_COLORS: Record<number, string> = {
  0: '#22c55e',
  1: '#ef4444',
  2: '#8b5cf6',
  3: '#06b6d4',
  4: '#f97316',
};

export default function TurnSummaryToast({ onOpenLog }: TurnSummaryToastProps) {
  const { waitingForHuman, gameLog, players } = useGameContext();
  const [visible, setVisible] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const prevWaitingRef = useRef(false);
  const prevLogLenRef = useRef(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wasWaiting = prevWaitingRef.current;
    prevWaitingRef.current = waitingForHuman;

    // Trigger when it becomes the human's turn (after AI acted)
    if (!wasWaiting && waitingForHuman) {
      const newEntries = gameLog.slice(prevLogLenRef.current);
      if (newEntries.length > 0) {
        // Only show if AI did something (seat !== 0)
        const aiEntries = newEntries.filter(e => e.seat !== 0);
        if (aiEntries.length > 0) {
          setEntries(aiEntries.slice(-8)); // last 8 AI actions
          setVisible(true);
          if (dismissTimer.current) clearTimeout(dismissTimer.current);
          dismissTimer.current = setTimeout(() => setVisible(false), 6000);
        }
      }
    }

    prevLogLenRef.current = gameLog.length;

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [waitingForHuman, gameLog]);

  if (!visible || entries.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-sm px-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{
          background: 'rgba(8,28,44,0.95)',
          border: '1px solid rgba(201,135,12,0.4)',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'all',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(201,135,12,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <ScrollText size={13} className="text-[#f0a830]" strokeWidth={2} />
            <span className="font-cinzel text-[11px] font-bold text-[#f0a830] uppercase tracking-wider">
              Opponent Actions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVisible(false); onOpenLog(); }}
              className="text-[10px] font-cinzel text-[#c9870c] hover:text-[#f0a830] transition-colors"
            >
              Full Log
            </button>
            <button
              onClick={() => setVisible(false)}
              className="w-5 h-5 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto">
          {entries.map((entry, i) => {
            const color = entry.seat !== null ? (PLAYER_COLORS[entry.seat] ?? '#c9870c') : '#c9870c';
            const playerName = entry.seat !== null ? players[entry.seat]?.name : null;
            return (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  {playerName && (
                    <span className="font-cinzel font-bold text-[10px] mr-1" style={{ color }}>
                      {playerName}
                    </span>
                  )}
                  <span className="font-crimson text-xs text-white/75 leading-snug">
                    {entry.message.replace(playerName ? playerName + ' ' : '', '')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="h-0.5 bg-[#c9870c]/20">
          <div
            className="h-full bg-[#c9870c]"
            style={{ animation: 'shrink 6s linear forwards' }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
