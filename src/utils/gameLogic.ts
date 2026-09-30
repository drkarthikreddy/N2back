import { MedicalWord, Trial, SessionStats, ChannelResult } from '../types/game';
import { MEDICAL_WORDS } from '../data/medicalTerms';

/**
 * Competitive N-Back sequence generator with calibrated target matches (~33%)
 * and intentional N-1 / N+1 interference lures (~25%) to eliminate easy guessing.
 */
export function generateDualNBackSequence(
  nLevel: number,
  totalTrials: number,
  targetProbability = 0.33,
  lureProbability = 0.28
): Trial[] {
  const sequence: Trial[] = [];

  for (let i = 0; i < totalTrials; i++) {
    if (i < nLevel) {
      // First N buffer items
      const pos = Math.floor(Math.random() * 9);
      const sound = MEDICAL_WORDS[Math.floor(Math.random() * MEDICAL_WORDS.length)];

      sequence.push({
        index: i,
        position: pos,
        sound: sound,
        isVisualMatch: false,
        isAudioMatch: false,
        isVisualLure: false,
        isAudioLure: false,
        userVisualResponse: null,
        userAudioResponse: null,
        visualResult: null,
        audioResult: null,
      });
    } else {
      const targetIdx = i - nLevel;
      const targetPos = sequence[targetIdx].position;
      const targetSound = sequence[targetIdx].sound;

      // 1. VISUAL CHANNEL
      const isVisualMatch = Math.random() < targetProbability;
      let position: number;
      let isVisualLure = false;

      if (isVisualMatch) {
        position = targetPos;
      } else {
        // Check for Lure Generation (N-1 or N+1 interference)
        const canNMinusOne = i - (nLevel - 1) >= 0 && nLevel > 1;
        const canNPlusOne = i - (nLevel + 1) >= 0;
        const rollLure = Math.random() < lureProbability;

        if (rollLure && (canNMinusOne || canNPlusOne)) {
          const lureIdx = (canNMinusOne && (Math.random() < 0.6 || !canNPlusOne))
            ? i - (nLevel - 1)
            : i - (nLevel + 1);

          const potentialLurePos = sequence[lureIdx].position;
          // Only a true lure if it does NOT match the actual target
          if (potentialLurePos !== targetPos) {
            position = potentialLurePos;
            isVisualLure = true;
          } else {
            const choices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(p => p !== targetPos);
            position = choices[Math.floor(Math.random() * choices.length)];
          }
        } else {
          // Standard non-match
          const choices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(p => p !== targetPos);
          position = choices[Math.floor(Math.random() * choices.length)];
        }
      }

      // 2. AUDIO CHANNEL
      const isAudioMatch = Math.random() < targetProbability;
      let sound: MedicalWord;
      let isAudioLure = false;

      if (isAudioMatch) {
        sound = targetSound;
      } else {
        // Check for Lure Generation
        const canNMinusOne = i - (nLevel - 1) >= 0 && nLevel > 1;
        const canNPlusOne = i - (nLevel + 1) >= 0;
        const rollLure = Math.random() < lureProbability;

        if (rollLure && (canNMinusOne || canNPlusOne)) {
          const lureIdx = (canNMinusOne && (Math.random() < 0.6 || !canNPlusOne))
            ? i - (nLevel - 1)
            : i - (nLevel + 1);

          const potentialLureSound = sequence[lureIdx].sound;
          if (potentialLureSound !== targetSound) {
            sound = potentialLureSound;
            isAudioLure = true;
          } else {
            const choices = MEDICAL_WORDS.filter(w => w !== targetSound);
            sound = choices[Math.floor(Math.random() * choices.length)];
          }
        } else {
          const choices = MEDICAL_WORDS.filter(w => w !== targetSound);
          sound = choices[Math.floor(Math.random() * choices.length)];
        }
      }

      sequence.push({
        index: i,
        position,
        sound,
        isVisualMatch,
        isAudioMatch,
        isVisualLure,
        isAudioLure,
        userVisualResponse: null,
        userAudioResponse: null,
        visualResult: null,
        audioResult: null,
      });
    }
  }

  // Ensure balanced targets: At least 25% targets in each channel
  const evaluated = sequence.slice(nLevel);
  const minTargets = Math.max(3, Math.floor(evaluated.length * 0.25));

  const visualMatches = evaluated.filter(t => t.isVisualMatch).length;
  if (visualMatches < minTargets) {
    for (let k = 0; k < minTargets - visualMatches; k++) {
      const candidateIdx = nLevel + Math.floor(Math.random() * (sequence.length - nLevel));
      sequence[candidateIdx].position = sequence[candidateIdx - nLevel].position;
      sequence[candidateIdx].isVisualMatch = true;
      sequence[candidateIdx].isVisualLure = false;
    }
  }

  const audioMatches = evaluated.filter(t => t.isAudioMatch).length;
  if (audioMatches < minTargets) {
    for (let k = 0; k < minTargets - audioMatches; k++) {
      const candidateIdx = nLevel + Math.floor(Math.random() * (sequence.length - nLevel));
      sequence[candidateIdx].sound = sequence[candidateIdx - nLevel].sound;
      sequence[candidateIdx].isAudioMatch = true;
      sequence[candidateIdx].isAudioLure = false;
    }
  }

  return sequence;
}

/**
 * Evaluates responses for a single trial
 */
export function evaluateTrialChannels(
  trial: Trial,
  nLevel: number
): { visualResult: ChannelResult | null; audioResult: ChannelResult | null } {
  if (trial.index < nLevel) {
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
 * Competitive scoring based on Signal Detection Theory (SDT).
 * Penalizes missed targets and false alarms severely.
 * 100% requires catching ALL targets and resisting ALL lures/distractors.
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

  // Strict Signal Detection Competitive Accuracy
  const visualTargets = visualHits + visualMisses;
  const visualNonTargets = visualCorrectRejections + visualFalseAlarms;
  const visualHitRate = visualTargets > 0 ? (visualHits / visualTargets) : 1;
  const visualFARate = visualNonTargets > 0 ? (visualFalseAlarms / visualNonTargets) : 0;
  const visualRejectionRate = visualNonTargets > 0 ? (visualCorrectRejections / visualNonTargets) : 1;

  // Formula: 70% weighted on targets, 30% on lure/distractor rejection, with FA penalty
  const rawVisualScore = (visualHitRate * 0.70 + visualRejectionRate * 0.30 - visualFARate * 0.20) * 100;
  const visualAccuracy = Math.max(0, Math.min(100, Math.round(rawVisualScore)));

  const audioTargets = audioHits + audioMisses;
  const audioNonTargets = audioCorrectRejections + audioFalseAlarms;
  const audioHitRate = audioTargets > 0 ? (audioHits / audioTargets) : 1;
  const audioFARate = audioNonTargets > 0 ? (audioFalseAlarms / audioNonTargets) : 0;
  const audioRejectionRate = audioNonTargets > 0 ? (audioCorrectRejections / audioNonTargets) : 1;

  const rawAudioScore = (audioHitRate * 0.70 + audioRejectionRate * 0.30 - audioFARate * 0.20) * 100;
  const audioAccuracy = Math.max(0, Math.min(100, Math.round(rawAudioScore)));

  const combinedAccuracy = Math.round((visualAccuracy + audioAccuracy) / 2);

  // Competitive Progression:
  // Requires >= 85% on BOTH visual and audio channels to promote N+1
  // Demotes N-1 if accuracy falls below 60%
  let levelChange: 'promoted' | 'demoted' | 'maintained' = 'maintained';
  let nextNLevel = nLevel;

  if (autoAdaptive) {
    if (visualAccuracy >= 85 && audioAccuracy >= 85) {
      levelChange = 'promoted';
      nextNLevel = nLevel + 1;
    } else if (visualAccuracy < 60 || audioAccuracy < 60) {
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
