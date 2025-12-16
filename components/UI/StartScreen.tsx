import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface StartScreenProps {
  onStart: (playerName: string) => void;
  onShowRanking: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowRanking }) => {
  const [playerName, setPlayerName] = useState('');

  const handleStart = () => {
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };

  return (
    <div className="w-[420px] h-[600px] bg-game-lane border-4 border-game-border rounded-xl flex flex-col items-center justify-center p-8 text-center shadow-2xl relative overflow-hidden group">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-0"></div>
        
        <div className="z-10 flex flex-col items-center">
            <h1 className="text-4xl font-black text-white mb-2">준비되셨나요?</h1>
            <p className="text-game-note mb-8 text-lg">1분 랜덤 챌린지</p>
            
            <div className="space-y-4 mb-10 text-gray-300">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        플레이어 이름
                    </label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-2 bg-game-border border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-game-note focus:border-transparent"
                        maxLength={20}
                    />
                </div>
                
                <p>
                    <span className="text-white font-bold bg-game-border px-2 py-1 rounded">D</span> 
                    <span className="text-white font-bold bg-game-border px-2 py-1 rounded">F</span> 
                    <span className="text-white font-bold bg-game-border px-2 py-1 rounded">J</span> 
                    <span className="text-white font-bold bg-game-border px-2 py-1 rounded">K</span>
                </p>
                <p className="text-sm">노트가 판정선에 닿을 때 키를 누르세요.</p>
            </div>

            <button 
                onClick={handleStart}
                disabled={!playerName.trim()}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-green-500 font-lg rounded-full hover:bg-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.6)] active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
                <PlayCircle className="w-6 h-6 mr-2" />
                게임 시작
            </button>

            <button
                onClick={onShowRanking}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
                랭킹 보기
            </button>
        </div>
    </div>
  );
};