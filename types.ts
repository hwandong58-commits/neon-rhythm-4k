export type GameState = 'idle' | 'playing' | 'ended' | 'ranking';

export type KeyType = 'd' | 'f' | 'j' | 'k';

export interface NoteData {
  id: string;
  lane: KeyType;
  startTime: number;
  judged: boolean;
}

export type Judgement = 'PERFECT' | 'GOOD' | 'OK' | 'MISS' | null;

export interface HitHistoryItem {
  noteIndex: number;
  offset: number; // ms
  judgement: Judgement;
}

export interface GameStats {
  perfect: number;
  good: number;
  ok: number;
  miss: number;
  totalNotes: number;
  maxCombo: number;
  score: number;
  history: HitHistoryItem[];
}

export interface PlayerRecord {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  grade: string;
  maxCombo: number;
  date: string;
  totalHits: number;
}

export const KEYS: KeyType[] = ['d', 'f', 'j', 'k'];

export const LANE_LABELS: Record<KeyType, string> = {
  d: 'D',
  f: 'F',
  j: 'J',
  k: 'K'
};
