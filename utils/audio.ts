import * as Tone from 'tone';
import { Judgement } from '../types';

let normalSynth: Tone.MembraneSynth | null = null;
let perfectSynth: Tone.PolySynth | null = null;

export const initAudio = () => {
  if (!normalSynth) {
    // Quiet, short thud for normal hits
    normalSynth = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 0.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 },
      volume: -25 // Significantly reduced volume
    }).toDestination();
  }

  if (!perfectSynth) {
    // Bright, crystal-like chime for Perfect hits
    perfectSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.002,
        decay: 0.1,
        sustain: 0,
        release: 0.4
      },
      volume: -12
    }).toDestination();
  }
};

export const playHitSound = (judgement: Judgement) => {
  if (Tone.context.state !== 'running') return;

  if (judgement === 'PERFECT' && perfectSynth) {
    // Play a pleasant high chord/interval for perfect
    // E6 adds a nice brightness
    perfectSynth.triggerAttackRelease(["C6", "E6"], "32n");
  } else if (normalSynth) {
    // Standard low click/thud
    normalSynth.triggerAttackRelease("C4", "32n");
  }
};