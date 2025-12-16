import React from 'react';
import { GameStats } from '../../types';
import { COLORS } from '../../constants';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { RotateCcw, Home } from 'lucide-react';

interface ResultScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ stats, onRestart, onMenu }) => {
  const totalHits = stats.perfect + stats.good + stats.ok + stats.miss;
  const accuracy = totalHits > 0 
    ? ((stats.perfect * 1 + stats.good * 0.8 + stats.ok * 0.5) / totalHits) * 100 
    : 0;

  let grade = 'F';
  let gradeColor = COLORS.miss;
  if (accuracy >= 98) { grade = 'S'; gradeColor = COLORS.perfect; }
  else if (accuracy >= 95) { grade = 'A'; gradeColor = COLORS.good; }
  else if (accuracy >= 90) { grade = 'B'; gradeColor = COLORS.ok; }
  else if (accuracy >= 80) { grade = 'C'; gradeColor = 'orange'; }
  else if (accuracy >= 70) { grade = 'D'; gradeColor = 'yellow'; }

  const chartData = [
    { name: 'PERFECT', value: stats.perfect, color: COLORS.perfect },
    { name: 'GOOD', value: stats.good, color: COLORS.good },
    { name: 'OK', value: stats.ok, color: COLORS.ok },
    { name: 'MISS', value: stats.miss, color: COLORS.miss },
  ];

  // Prepare Scatter Data (Filter out MISS for the accuracy graph as they are off-chart)
  const accuracyData = stats.history
    .filter(h => h.judgement !== 'MISS')
    .map((h, i) => ({
      x: i + 1,
      y: parseFloat(h.offset.toFixed(1)),
      judgement: h.judgement,
      color: h.judgement === 'PERFECT' ? COLORS.perfect : h.judgement === 'GOOD' ? COLORS.good : COLORS.ok
    }));

  return (
    <div className="w-[850px] h-[600px] bg-game-lane border-4 border-game-border rounded-xl flex flex-col md:flex-row gap-6 p-6 shadow-2xl z-20 overflow-y-auto md:overflow-hidden">
        
        {/* Left Col: Main Stats */}
        <div className="flex-1 flex flex-col items-center">
            <h2 className="text-3xl font-black text-white mb-2">결과</h2>
            
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="text-8xl font-black drop-shadow-lg" style={{ color: gradeColor }}>
                    {grade}
                </div>
                <div className="text-xl font-bold text-gray-400 mt-2">
                    {accuracy.toFixed(2)}%
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <div className="bg-game-border/30 p-3 rounded text-center">
                    <div className="text-xs text-gray-400 uppercase">점수</div>
                    <div className="text-xl font-bold text-white">{stats.score.toLocaleString()}</div>
                </div>
                <div className="bg-game-border/30 p-3 rounded text-center">
                    <div className="text-xs text-gray-400 uppercase">최대 콤보</div>
                    <div className="text-xl font-bold text-yellow-400">{stats.maxCombo}</div>
                </div>
            </div>

            <div className="w-full h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#4a4e69' }} 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="w-full flex gap-4 mt-auto">
                <button 
                    onClick={onMenu}
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg flex items-center justify-center transition"
                >
                    <Home className="w-5 h-5 mr-2" /> 메뉴
                </button>
                <button 
                    onClick={onRestart}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center transition shadow-lg shadow-blue-900/50"
                >
                    <RotateCcw className="w-5 h-5 mr-2" /> 재시도
                </button>
            </div>
        </div>

        {/* Right Col: Accuracy Graph */}
        <div className="flex-1 bg-game-bg rounded-lg border border-game-border p-4 flex flex-col">
            <h3 className="text-lg font-bold text-game-note mb-4 text-center">타격 정확도 (ms)</h3>
            <p className="text-xs text-gray-500 text-center mb-2">양수(+) = 늦음, 음수(-) = 빠름</p>
            <div className="flex-1 w-full min-h-[300px]">
                {accuracyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <ReferenceLine y={0} stroke="#4a4e69" strokeDasharray="3 3" />
                            <ReferenceLine y={-45} stroke={COLORS.perfect} strokeOpacity={0.3} />
                            <ReferenceLine y={45} stroke={COLORS.perfect} strokeOpacity={0.3} />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="순서" 
                                tick={{ fill: '#6b7280', fontSize: 10 }} 
                                tickLine={false}
                                axisLine={{ stroke: '#4a4e69' }}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="오차" 
                                unit="ms" 
                                domain={[-150, 150]} 
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickLine={false}
                                axisLine={{ stroke: '#4a4e69' }}
                            />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#4a4e69', color: '#fff' }}
                                labelFormatter={(value) => `노트 #${value}`}
                            />
                            <Scatter name="Hits" data={accuracyData} fill="#8884d8" shape="circle">
                                {accuracyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        데이터 없음
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};