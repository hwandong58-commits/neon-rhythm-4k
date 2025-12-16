import React from 'react';
import { GameStats } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../../constants';

interface ScorePanelProps {
  score: number;
  combo: number;
  timeLeft: number;
  stats: GameStats;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ score, combo, timeLeft, stats }) => {
  
  const totalHits = stats.perfect + stats.good + stats.ok + stats.miss;
  
  // Calculate accuracy
  const accuracy = totalHits > 0 
    ? ((stats.perfect * 1 + stats.good * 0.8 + stats.ok * 0.5) / totalHits) * 100 
    : 100;

  const data = [
    { name: 'Perfect', value: stats.perfect, color: COLORS.perfect },
    { name: 'Good', value: stats.good, color: COLORS.good },
    { name: 'OK', value: stats.ok, color: COLORS.ok },
    { name: 'Miss', value: stats.miss, color: COLORS.miss },
  ];
  
  // Filter for cleaner chart, but keep structure
  const chartData = data.filter(d => d.value > 0);
  if (chartData.length === 0) {
      chartData.push({ name: '대기 중', value: 1, color: COLORS.idle });
  }

  return (
    <div className="w-full md:w-80 bg-game-lane border-4 border-game-border rounded-xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="text-center">
            <h2 className="text-game-note text-xl font-bold mb-2">남은 시간</h2>
            <div className={`text-4xl font-black py-3 rounded-lg shadow-inner transition-colors duration-500
                ${timeLeft <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-800 text-white'}`}>
                {Math.ceil(timeLeft)}초
            </div>
        </div>

        <div className="bg-game-border/50 p-4 rounded-lg text-center">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">점수</div>
            <div className="text-3xl font-mono font-bold text-white">{score.toLocaleString()}</div>
        </div>
        
        <div className="bg-game-border/50 p-4 rounded-lg text-center">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">콤보</div>
            <div className="text-4xl font-black text-yellow-400">{combo}</div>
        </div>

        <div className="bg-game-border/50 p-4 rounded-lg flex flex-col items-center">
             <div className="w-full flex justify-between text-xs text-gray-400 uppercase font-bold mb-2">
                 <span>판정 비율</span>
             </div>
             
             <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#4a4e69', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`${value}개`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-gray-400">정확도</span>
                    <span className="text-xl font-bold text-white">
                        {totalHits > 0 ? `${accuracy.toFixed(1)}%` : '0%'}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};