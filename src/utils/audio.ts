import { MedicalWord } from '../types/game';
import { MEDICAL_DICTIONARY } from '../data/medicalTerms';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Medical pronunciation mappings for crisp speech synthesis
export const PRONUNCIATION_MAP: Record<MedicalWord, string> = {
  stroke: 'Stroke',
  asthma: 'Asthma',
  aids: 'AIDS',
  syphilis: 'Syphilis',
  angina: 'Angina',
  typhoid: 'Typhoid',
  dengue: 'Dengue',
  mumps: 'Mumps',
  rabies: 'Rabies'
};

// Fallback audio tone frequencies (Hz) for procedural audio in case speech is disabled/unavailable
const WORD_TONES: Record<MedicalWord, number[]> = {
  stroke: [330, 440],
  asthma: [294, 370, 440],
  aids: [523, 659],
  syphilis: [392, 587],
  angina: [349, 440, 523],
  typhoid: [261, 329, 392],
  dengue: [440, 554],
  mumps: [370, 493],
  rabies: [493, 622]
};

let voicesCache: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesCache = voices;
  }
  return voicesCache.filter(v => v.lang.startsWith('en'));
}

export function initVoicesListener(callback: (voices: SpeechSynthesisVoice[]) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  const update = () => {
    const list = getAvailableVoices();
    callback(list);
  };

  update();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
  }
}

/**
 * Speaks a medical word stimulus using SpeechSynthesis with optimized vocal settings
 */
export function playMedicalSpeech(
  word: MedicalWord,
  volume = 1.0,
  voiceURI?: string | null
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Try SpeechSynthesis first
    if ('speechSynthesis' in window && volume > 0) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech

        const textToSpeak = PRONUNCIATION_MAP[word] || MEDICAL_DICTIONARY[word]?.display || word;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.volume = Math.max(0, Math.min(1, volume));
        utterance.rate = 1.05; // Slightly brisk for responsive N-Back training
        utterance.pitch = 1.0;

        if (voiceURI) {
          const matchedVoice = getAvailableVoices().find(v => v.voiceURI === voiceURI);
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        } else {
          // Prefer natural English voices if available
          const voices = getAvailableVoices();
          const naturalVoice = voices.find(v => 
            v.lang.startsWith('en') && (
              v.name.includes('Natural') || 
              v.name.includes('Google') || 
              v.name.includes('Samantha') || 
              v.name.includes('Daniel')
            )
          ) || voices.find(v => v.lang.startsWith('en'));
          if (naturalVoice) {
            utterance.voice = naturalVoice;
          }
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => {
          // If speech synthesis errors, fallback to audio tones
          playWordToneFallback(word, volume);
          resolve();
        };

        window.speechSynthesis.speak(utterance);

        // Safety timeout in case onend never fires
        setTimeout(() => resolve(), 1200);
        return;
      } catch {
        playWordToneFallback(word, volume);
        resolve();
      }
    } else {
      playWordToneFallback(word, volume);
      resolve();
    }
  });
}

/**
 * Fallback tone generator for words in environments where speech synthesis is offline
 */
function playWordToneFallback(word: MedicalWord, volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx || volume <= 0) return;

  const freqs = WORD_TONES[word] || [440];
  const now = ctx.currentTime;
  const noteDuration = 0.12;

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

    gain.gain.setValueAtTime(0, now + idx * noteDuration);
    gain.gain.linearRampToValueAtTime(volume * 0.25, now + idx * noteDuration + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * noteDuration);
    osc.stop(now + (idx + 1) * noteDuration);
  });
}

/**
 * Sound effects for tactile feedback and milestones
 */
export function playSoundEffect(type: 'hit' | 'miss' | 'levelup' | 'pulse' | 'click', volume = 0.6) {
  const ctx = getAudioContext();
  if (!ctx || volume <= 0) return;

  const now = ctx.currentTime;

  if (type === 'hit') {
    // Uplifting dual chime: C5 (523Hz) & G5 (784Hz)
    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.001, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(volume * 0.25, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  } else if (type === 'miss') {
    // Low muffled buzzer
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(volume * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'levelup') {
    // Medical milestone triumphant arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.001, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.4);
    });
  } else if (type === 'pulse') {
    // Faint clinical telemetry blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'click') {
    // Soft subtle button tactile click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(volume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}
