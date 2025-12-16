import { KeyType } from './types';

// Game Mechanics
export const GAME_DURATION_SEC = 60;
export const NOTE_DROP_TIME_SEC = 1.6;
export const SPAWN_INTERVAL_MIN = 0.15;
export const SPAWN_INTERVAL_MAX = 0.5;

// Scoring
export const POINTS = {
  PERFECT: 300,
  GOOD: 200,
  OK: 100,
  MISS: 0,
};

// Judgement Windows (in seconds)
// Based on 120 BPM: 64n (~0.03s), 32n*1.5 (~0.09s), 16n (~0.125s)
export const JUDGEMENT_WINDOWS = {
  PERFECT: 0.045,
  GOOD: 0.100,
  OK: 0.140,
};

// Visuals
export const GAME_HEIGHT_PX = 600;
export const LANE_WIDTH_PX = 80;
export const HIT_POSITION_Y_PX = GAME_HEIGHT_PX - 80; // The Y position of the judgement line
export const NOTE_HEIGHT_PX = 24;

export const COLORS = {
  perfect: '#11d7fc',
  good: '#8BC34A',
  ok: '#FFC107',
  miss: '#F44336',
  idle: '#4a4e69',
};

export const KEY_MAPPING: Record<string, KeyType> = {
  'd': 'd',
  'f': 'f',
  'j': 'j',
  'k': 'k',
  'D': 'd',
  'F': 'f',
  'J': 'j',
  'K': 'k',
};
