import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingTips = [
  "🏝️ Puerto Rico was a Spanish colony from 1508 to 1898",
  "🌽 Corn is the most versatile resource - it costs nothing to produce!",
  "☕ Coffee is the most valuable trade good",
  "👷 Don't forget the Mayor brings colonists from the ship",
  "⚓ The Captain phase can earn you lots of victory points",
  "🏛️ Try buying buildings early for their special abilities",
  "💰 The Trader gets +1 doubloon bonus when selling",
  "🏗️ Each building type has a unique strategy advantage",
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading game...',
  progress,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LoadingTips.length);
    }, 4000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(tipInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 flex flex-col items-center justify-center p-4">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-6xl">🏝️</span>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-2 left-1/2 w-3 h-3 bg-amber-500 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
          <div className="absolute top-1/2 -right-2 w-2 h-2 bg-yellow-500 rounded-full" />
        </div>
      </div>

      {/* Loading Text */}
      <h1 className="text-3xl font-bold text-amber-800 mb-4">
        🌴 Puerto Rico
      </h1>

      <div className="text-lg text-amber-600 font-medium mb-2">
        {message}{dots}
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-amber-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
          style={{
            width: progress !== undefined ? `${progress}%` : '60%',
            animation: progress === undefined ? 'loading 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>

      {/* Tip Box */}
      <div className="max-w-md bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg border border-amber-200">
        <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
          💡 Did you know?
        </div>
        <p className="text-sm text-gray-700 transition-opacity duration-500">
          {LoadingTips[tipIndex]}
        </p>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
