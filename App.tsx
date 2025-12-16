import React, { useState } from 'react';
import { GameContainer } from './components/Game/GameContainer';
import { ResultScreen } from './components/UI/ResultScreen';
import { StartScreen } from './components/UI/StartScreen';
import { RankingScreen } from './components/UI/RankingScreen';
import { GameState, GameStats } from './types';
import * as Tone from 'tone';

const INITIAL_STATS: GameStats = {
  perfect: 0,
  good: 0,
  ok: 0,
  miss: 0,
  totalNotes: 0,
  maxCombo: 0,
  score: 0,
  history: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [finalStats, setFinalStats] = useState<GameStats>(INITIAL_STATS);
  const [playerName, setPlayerName] = useState<string>('');

  const handleStart = async (name: string) => {
    setPlayerName(name);
    await Tone.start();
    setGameState('playing');
  };

  const handleGameOver = (stats: GameStats) => {
    console.log('handleGameOver called, setting gameState to ended', stats);
    setFinalStats(stats);
    setGameState('ended');
    console.log('gameState should now be ended');
  };

  const handleRestart = () => {
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('idle');
  };

  const handleShowRanking = () => {
    setGameState('ranking');
  };

  const handleBackFromRanking = () => {
    setGameState('idle');
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="text-3xl font-black mb-6 text-game-note tracking-wider shadow-cyan-500/50 drop-shadow-lg">
        네온 리듬 4K
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        {gameState === 'idle' && (
          <StartScreen onStart={handleStart} onShowRanking={handleShowRanking} />
        )}

        {gameState === 'ranking' && (
          <RankingScreen onBack={handleBackFromRanking} />
        )}

        {gameState === 'playing' && (
          <GameContainer onGameOver={handleGameOver} playerName={playerName} />
        )}

        {gameState === 'ended' && (
          <ResultScreen 
            stats={finalStats} 
            onRestart={handleRestart}
            onMenu={handleBackToMenu}
            playerName={playerName}
            onShowRanking={handleShowRanking}
          />
        )}
      </div>
      
      <div className="absolute bottom-4 text-xs text-gray-500">
        D, F, J, K 키를 사용하여 플레이하세요. PC 환경을 권장합니다.
      </div>
    </div>
  );
}