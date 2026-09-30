import { MedicalWord, Trial, SessionStats, ChannelResult } from '../types/game';
import { MEDICAL_WORDS } from '../data/medicalTerms';

/**
 * Scientifically constructs an N-Back stimulus sequence with controlled match probability (~30%)
 */
export function generateDualNBackSequence(
  nLevel: number,
  totalTrials: number,
  matchProbability = 0.32
): Trial[] {
  const sequence: Trial[] = [];

  for (let i = 0; i < totalTrials; i++) {
    if (i < nLevel) {
      // First N items cannot match because there are no preceding N items
      const pos = Math.floor(Math.random() * 9);
      const sound = MEDICAL_WORDS[Math.floor(Math.random() * MEDICAL_WORDS.length)];

      sequence.push({
        index: i,
        position: pos,
        sound: sound,
        isVisualMatch: false,
        isAudioMatch: false,
        userVisualResponse: null,
        userAudioResponse: null,
        visualResult: null,
        audioResult: null,
      });
    } else {
      // Step >= N: roll for matches
      const targetNIndex = i - nLevel;
      const prevPosition = sequence[targetNIndex].position;
      const prevSound = sequence[targetNIndex].sound;

      const isVisualMatch = Math.random() < matchProbability;
      let position: number;

      if (isVisualMatch) {
        position = prevPosition;
      } else {
        // Pick a position that differs from prevPosition
        const choices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(p => p !== prevPosition);
        position = choices[Math.floor(Math.random() * choices.length)];
      }

      const isAudioMatch = Math.random() < matchProbability;
      let sound: MedicalWord;

      if (isAudioMatch) {
        sound = prevSound;
      } else {
        // Pick a sound that differs from prevSound
        const choices = MEDICAL_WORDS.filter(w => w !== prevSound);
        sound = choices[Math.floor(Math.random() * choices.length)];
      }

      sequence.push({
        index: i,
        position,
        sound,
        isVisualMatch,
        isAudioMatch,
        userVisualResponse: null,
        userAudioResponse: null,
        visualResult: null,
        audioResult: null,
      });
    }
  }

  // Sanity validation: ensure there is at least 1 match in each modality if trials >= 10
  if (totalTrials >= 10) {
    const visualMatches = sequence.slice(nLevel).filter(t => t.isVisualMatch).length;
    const audioMatches = sequence.slice(nLevel).filter(t => t.isAudioMatch).length;

    if (visualMatches === 0) {
      const idx = Math.min(sequence.length - 1, nLevel + 2);
      sequence[idx].position = sequence[idx - nLevel].position;
      sequence[idx].isVisualMatch = true;
    }

    if (audioMatches === 0) {
      const idx = Math.min(sequence.length - 1, nLevel + 1);
      sequence[idx].sound = sequence[idx - nLevel].sound;
      sequence[idx].isAudioMatch = true;
    }
  }

  return sequence;
}

/**
 * Evaluates the results for a single trial
 */
export function evaluateTrialChannels(
  trial: Trial,
  nLevel: number
): { visualResult: ChannelResult | null; audioResult: ChannelResult | null } {
  if (trial.index < nLevel) {
    // Non-testable buffer trials
    return {
      visualResult: trial.userVisualResponse ? 'false_alarm' : 'correct_rejection',
      audioResult: trial.userAudioResponse ? 'false_alarm' : 'correct_rejection'
    };
  }

  // Visual Channel
  let visualResult: ChannelResult;
  if (trial.isVisualMatch) {
    visualResult = trial.userVisualResponse ? 'hit' : 'miss';
  } else {
    visualResult = trial.userVisualResponse ? 'false_alarm' : 'correct_rejection';
  }

  // Audio Channel
  let audioResult: ChannelResult;
  if (trial.isAudioMatch) {
    audioResult = trial.userAudioResponse ? 'hit' : 'miss';
  } else {
    audioResult = trial.userAudioResponse ? 'false_alarm' : 'correct_rejection';
  }

  return { visualResult, audioResult };
}

/**
 * Calculates complete session statistics according to cognitive psychology standards
 */
export function calculateSessionStats(
  trials: Trial[],
  nLevel: number,
  autoAdaptive: boolean
): SessionStats {
  const evaluatedTrials = trials.slice(nLevel);
  const evalCount = evaluatedTrials.length || 1;

  let visualHits = 0;
  let visualMisses = 0;
  let visualFalseAlarms = 0;
  let visualCorrectRejections = 0;

  let audioHits = 0;
  let audioMisses = 0;
  let audioFalseAlarms = 0;
  let audioCorrectRejections = 0;

  evaluatedTrials.forEach(t => {
    // Visual
    if (t.visualResult === 'hit') visualHits++;
    else if (t.visualResult === 'miss') visualMisses++;
    else if (t.visualResult === 'false_alarm') visualFalseAlarms++;
    else if (t.visualResult === 'correct_rejection') visualCorrectRejections++;

    // Audio
    if (t.audioResult === 'hit') audioHits++;
    else if (t.audioResult === 'miss') audioMisses++;
    else if (t.audioResult === 'false_alarm') audioFalseAlarms++;
    else if (t.audioResult === 'correct_rejection') audioCorrectRejections++;
  });

  const visualAccuracy = Math.round(((visualHits + visualCorrectRejections) / evalCount) * 100);
  const audioAccuracy = Math.round(((audioHits + audioCorrectRejections) / evalCount) * 100);
  const combinedAccuracy = Math.round((visualAccuracy + audioAccuracy) / 2);

  // Standard Jaeggi / Dual N-Back adaptive threshold:
  // >= 80% on both modalities promotes N+1
  // < 50% on either modality demotes N-1
  // Otherwise maintain
  let levelChange: 'promoted' | 'demoted' | 'maintained' = 'maintained';
  let nextNLevel = nLevel;

  if (autoAdaptive) {
    if (visualAccuracy >= 80 && audioAccuracy >= 80) {
      levelChange = 'promoted';
      nextNLevel = nLevel + 1;
    } else if (visualAccuracy < 50 || audioAccuracy < 50) {
      if (nLevel > 1) {
        levelChange = 'demoted';
        nextNLevel = nLevel - 1;
      } else {
        levelChange = 'maintained';
        nextNLevel = 1;
      }
    } else {
      levelChange = 'maintained';
      nextNLevel = nLevel;
    }
  }

  const now = new Date();

  return {
    id: `session_${Date.now()}`,
    date: now.toISOString().split('T')[0],
    timestamp: now.getTime(),
    nLevel,
    totalTrials: trials.length,
    evaluatedTrials: evalCount,
    visualHits,
    visualMisses,
    visualFalseAlarms,
    visualCorrectRejections,
    visualAccuracy,
    audioHits,
    audioMisses,
    audioFalseAlarms,
    audioCorrectRejections,
    audioAccuracy,
    combinedAccuracy,
    levelChange,
    nextNLevel
  };
}
