import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';
import { GameStats, Judgement, KEYS, KeyType, NoteData } from '../../types';
import { 
  GAME_DURATION_SEC, 
  GAME_HEIGHT_PX, 
  HIT_POSITION_Y_PX, 
  JUDGEMENT_WINDOWS, 
  KEY_MAPPING, 
  NOTE_DROP_TIME_SEC, 
  POINTS, 
  SPAWN_INTERVAL_MAX, 
  SPAWN_INTERVAL_MIN,
  LANE_WIDTH_PX,
  COLORS
} from '../../constants';
import { playHitSound, initAudio } from '../../utils/audio';
import { Lane } from './Lane';
import { ScorePanel } from '../UI/ScorePanel';

interface GameContainerProps {
  onGameOver: (stats: GameStats) => void;
}

interface HitEffect {
    id: string;
    lane: KeyType;
    color: string;
    judgement: Judgement;
}

export const GameContainer: React.FC<GameContainerProps> = ({ onGameOver }) => {
  // Game State
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; color: string; id: number } | null>(null);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  
  // Stats Ref (to avoid closure staleness in loop)
  const statsRef = useRef<GameStats>({
    perfect: 0,
    good: 0,
    ok: 0,
    miss: 0,
    totalNotes: 0,
    maxCombo: 0,
    score: 0,
    history: []
  });

  // Loop Control
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const nextSpawnIntervalRef = useRef<number>(0.5);
  const notesRef = useRef<NoteData[]>([]);
  const isRunningRef = useRef(false);

  // Initialize
  useEffect(() => {
    initAudio();
    isRunningRef.current = true;
    startTimeRef.current = Tone.now();
    lastSpawnTimeRef.current = startTimeRef.current - 0.5; // slight delay before first note
    
    const animate = () => {
      if (!isRunningRef.current) return;
      const currentTime = Tone.now();
      const elapsedTime = currentTime - startTimeRef.current;
      
      // Timer Update
      const remaining = Math.max(0, GAME_DURATION_SEC - elapsedTime);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        endGame();
        return;
      }

      // Spawning Logic
      if (currentTime > lastSpawnTimeRef.current + nextSpawnIntervalRef.current) {
        spawnNote(currentTime);
        lastSpawnTimeRef.current = currentTime;
        nextSpawnIntervalRef.current = Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN;
      }

      // Miss Logic (Check only the oldest active notes)
      setNotes(prevNotes => {
        const activeNotes = [...prevNotes];
        
        const validNotes = activeNotes.filter(n => {
          const targetTime = n.startTime + NOTE_DROP_TIME_SEC;
          const missThreshold = targetTime + JUDGEMENT_WINDOWS.OK; // Late miss threshold
          
          if (!n.judged && currentTime > missThreshold) {
            handleMiss();
            // Record miss in history
            statsRef.current.history.push({
                noteIndex: statsRef.current.totalNotes, // approximate index order
                offset: 1000, // Large value to indicate miss off-chart
                judgement: 'MISS'
            });
            return false;
          }
          
          if (currentTime > targetTime + 1.0) {
             return false;
          }
          
          return true;
        });

        if (validNotes.length !== prevNotes.length) {
            notesRef.current = validNotes;
            return validNotes;
        }
        return validNotes;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isRunningRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnNote = (currentTime: number) => {
    const randomLane = KEYS[Math.floor(Math.random() * KEYS.length)];
    const newNote: NoteData = {
      id: uuidv4(),
      lane: randomLane,
      startTime: currentTime,
      judged: false,
    };
    
    setNotes(prev => {
        const next = [...prev, newNote];
        notesRef.current = next;
        return next;
    });
    
    statsRef.current.totalNotes += 1;
  };

  const handleMiss = () => {
    setCombo(0);
    statsRef.current.miss += 1;
    statsRef.current.score = Math.max(0, statsRef.current.score); 
    showFeedback("MISS", POINTS.MISS);
  };

  const showFeedback = (text: string, points: number) => {
    const color = text === "MISS" ? COLORS.miss : 
                  text === "PERFECT" ? COLORS.perfect : 
                  text === "GOOD" ? COLORS.good : COLORS.ok;
    
    setFeedback({ text, color, id: Date.now() });
    
    statsRef.current.score += points;
    setScore(statsRef.current.score);
  };

  const triggerHitEffect = (lane: KeyType, color: string, judgement: Judgement) => {
      const id = uuidv4();
      setHitEffects(prev => [...prev, { id, lane, color, judgement }]);
      setTimeout(() => {
          setHitEffects(prev => prev.filter(e => e.id !== id));
      }, judgement === 'PERFECT' ? 500 : 300); 
  };

  const endGame = () => {
    isRunningRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, combo);
    onGameOver(statsRef.current);
  };

  // Keyboard Handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isRunningRef.current) return;
    const key = e.key;
    const lane = KEY_MAPPING[key];
    if (!lane) return;

    const currentTime = Tone.now();
    const activeNotes = notesRef.current.filter(n => n.lane === lane && !n.judged);

    if (activeNotes.length === 0) return;

    // Sort by proximity to target time
    activeNotes.sort((a, b) => {
        const distA = Math.abs(currentTime - (a.startTime + NOTE_DROP_TIME_SEC));
        const distB = Math.abs(currentTime - (b.startTime + NOTE_DROP_TIME_SEC));
        return distA - distB;
    });

    const targetNote = activeNotes[0];
    const targetTime = targetNote.startTime + NOTE_DROP_TIME_SEC;
    // Calculate raw offset (negative = early, positive = late)
    const rawOffset = currentTime - targetTime;
    const absDiff = Math.abs(rawOffset);

    let judgement: Judgement = null;

    if (absDiff <= JUDGEMENT_WINDOWS.PERFECT) {
        judgement = 'PERFECT';
    } else if (absDiff <= JUDGEMENT_WINDOWS.GOOD) {
        judgement = 'GOOD';
    } else if (absDiff <= JUDGEMENT_WINDOWS.OK) {
        judgement = 'OK';
    } else {
        return;
    }

    if (judgement) {
        targetNote.judged = true;
        setNotes(prev => prev.filter(n => n.id !== targetNote.id));
        
        // Pass judgement type to audio player
        playHitSound(judgement);
        
        // Record History
        statsRef.current.history.push({
            noteIndex: statsRef.current.totalNotes - activeNotes.length, // Approximate logical index
            offset: rawOffset * 1000, // convert to ms
            judgement
        });

        // Update Stats
        if (judgement === 'PERFECT') statsRef.current.perfect++;
        if (judgement === 'GOOD') statsRef.current.good++;
        if (judgement === 'OK') statsRef.current.ok++;

        setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > statsRef.current.maxCombo) statsRef.current.maxCombo = newCombo;
            return newCombo;
        });

        const basePoints = POINTS[judgement];
        const comboBonus = Math.min(combo * 10, 500);
        showFeedback(judgement, basePoints + comboBonus);

        const color = judgement === 'PERFECT' ? COLORS.perfect : 
                      judgement === 'GOOD' ? COLORS.good : COLORS.ok;
        
        triggerHitEffect(lane, color, judgement);
    }
  }, [combo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderTime = Tone.now();

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* CSS for custom beam animation */}
        <style>{`
          @keyframes beam-fade {
            0% { opacity: 0.8; height: 10px; }
            30% { opacity: 0.6; height: 350px; }
            100% { opacity: 0; height: 400px; }
          }
        `}</style>

        {/* Game Area */}
        <div className="relative bg-game-lane rounded-xl border-4 border-game-border shadow-2xl overflow-hidden"
             style={{ width: 4 * LANE_WIDTH_PX + 8, height: GAME_HEIGHT_PX }}>
             
             {/* Lanes */}
             <div className="absolute inset-0 flex">
                {KEYS.map((k, i) => (
                    <Lane 
                        key={k} 
                        laneKey={k} 
                        isLast={i === KEYS.length - 1} 
                    />
                ))}
             </div>

             {/* Judgement Line */}
             <div className="absolute w-full h-3 bg-gradient-to-r from-gray-300 via-white to-gray-300 opacity-60 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  style={{ top: HIT_POSITION_Y_PX }} />
             
             {/* Hit Effects Layer */}
             {hitEffects.map(effect => {
                 const isPerfect = effect.judgement === 'PERFECT';
                 const laneIndex = KEYS.indexOf(effect.lane);
                 const laneLeft = laneIndex * LANE_WIDTH_PX;

                 return (
                    <div
                        key={effect.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: laneLeft,
                            top: 0,
                            width: LANE_WIDTH_PX,
                            height: GAME_HEIGHT_PX,
                        }}
                    >
                        {/* 1. Light Beam for Perfect */}
                        {isPerfect && (
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-200/60 via-cyan-500/20 to-transparent"
                                style={{
                                    bottom: GAME_HEIGHT_PX - HIT_POSITION_Y_PX, // Start exactly at judgement line
                                    animation: 'beam-fade 0.4s ease-out forwards',
                                }}
                            />
                        )}

                        {/* 2. Expanding Ring (Effect for all, thicker for perfect) */}
                        <div 
                            className={`absolute rounded-full border-4 opacity-0 animate-[ping_0.3s_cubic-bezier(0,0,0.2,1)]
                                ${isPerfect ? 'w-[100px] h-[100px] border-cyan-100' : 'w-[80px] h-[80px]'}`}
                            style={{ 
                                borderColor: effect.color, 
                                top: HIT_POSITION_Y_PX - (isPerfect ? 50 : 40),
                                left: isPerfect ? -10 : 0
                            }} 
                        />
                        
                        {/* 3. Central Flash for Perfect */}
                        {isPerfect && (
                            <div 
                                className="absolute w-[80px] h-[80px] rounded-full bg-white blur-md opacity-0 animate-[ping_0.2s_ease-out]"
                                style={{ 
                                    top: HIT_POSITION_Y_PX - 40,
                                    left: 0,
                                }}
                            />
                        )}
                    </div>
                 );
             })}

             {/* Notes */}
             {notes.map(note => {
                 const timeSinceSpawn = renderTime - note.startTime;
                 const progress = timeSinceSpawn / NOTE_DROP_TIME_SEC;
                 const top = progress * HIT_POSITION_Y_PX; 
                 
                 return (
                     <div
                        key={note.id}
                        className="absolute w-[70px] h-[24px] rounded-md bg-game-note shadow-[0_0_10px_#11d7fc] transform -translate-x-1/2"
                        style={{
                            left: (KEYS.indexOf(note.lane) * LANE_WIDTH_PX) + (LANE_WIDTH_PX / 2),
                            top: `${top}px`,
                            opacity: note.judged ? 0 : 1
                        }}
                     />
                 );
             })}

             {/* Key Inputs Visuals at bottom */}
             <div className="absolute bottom-4 w-full flex justify-around px-1">
                {KEYS.map(k => (
                    <KeyIndicator key={k} laneKey={k} />
                ))}
             </div>

             {/* Feedback Text */}
             {feedback && (
                 <div key={feedback.id} 
                      className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black animate-bounce z-20"
                      style={{ color: feedback.color, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                     {feedback.text}
                 </div>
             )}
        </div>

        {/* Sidebar */}
        <ScorePanel 
            score={score} 
            combo={combo} 
            timeLeft={timeLeft} 
            stats={statsRef.current}
        />
    </div>
  );
};

const KeyIndicator: React.FC<{ laneKey: KeyType }> = ({ laneKey }) => {
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (KEY_MAPPING[e.key] === laneKey) setPressed(true);
        };
        const handleUp = (e: KeyboardEvent) => {
            if (KEY_MAPPING[e.key] === laneKey) setPressed(false);
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, [laneKey]);

    return (
        <div className={`w-16 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-75
            ${pressed ? 'bg-game-note border-white text-black translate-y-1 shadow-none' : 'bg-game-border border-gray-500 text-white shadow-[0_4px_0_#2a2e45]'}`}>
            {laneKey.toUpperCase()}
        </div>
    );
};