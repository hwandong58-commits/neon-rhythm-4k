import React from 'react';
import { PlayerRecord } from '../../types';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankingScreenProps {
  onBack: () => void;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({ onBack }) => {
  const [records, setRecords] = React.useState<PlayerRecord[]>([]);

  React.useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('rhythmGameRecords') || '[]');
    setRecords(savedRecords);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'SS': return '#FFD700';
      case 'S': return '#11d7fc';
      case 'A': return '#8BC34A';
      case 'B': return '#FFC107';
      case 'C': return 'orange';
      case 'D': return 'yellow';
      case 'F': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <div className="w-[600px] h-[600px] bg-game-lane border-4 border-game-border rounded-xl flex flex-col p-6 shadow-2xl overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-white">랭킹 보드</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
        >
          뒤로가기
        </button>
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">아직 기록이 없습니다!</p>
            <p className="text-sm">게임을 플레이해서 첫 기록을 만들어보세요.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-game-border/30 rounded-lg hover:bg-game-border/50 transition"
            >
              <div className="flex items-center space-x-4">
                {getRankIcon(index)}
                <div>
                  <div className="text-white font-bold text-lg">{record.name}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(record.date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-right">
                <div>
                  <div className="text-white font-bold">{record.accuracy.toFixed(2)}%</div>
                  <div className="text-gray-400 text-sm">정확도</div>
                </div>
                <div>
                  <div className="text-white font-bold">{record.score.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">점수</div>
                </div>
                <div>
                  <div className="text-white font-bold" style={{ color: getGradeColor(record.grade) }}>
                    {record.grade}
                  </div>
                  <div className="text-gray-400 text-sm">등급</div>
                </div>
                <div>
                  <div className="text-white font-bold">{record.maxCombo}</div>
                  <div className="text-gray-400 text-sm">최대 콤보</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-gray-500 text-sm">
        상위 50개 기록만 표시됩니다.
      </div>
    </div>
  );
};