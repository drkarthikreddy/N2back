export type MedicalWord = 
  | 'tb'
  | 'cml'
  | 'aids'
  | 'mi'
  | 'angina'
  | 'typhoid'
  | 'dengue'
  | 'mumps'
  | 'rabies';

export interface MedicalWordInfo {
  id: MedicalWord;
  display: string;
  fullName: string;
  category: 'Infectious' | 'Cardiology' | 'Oncology / Hematology';
  phonetic: string;
  overview: string;
  symptoms: string[];
}

export type ChannelResult = 'hit' | 'miss' | 'false_alarm' | 'correct_rejection';

export interface Trial {
  index: number;
  position: number; // 0 to 8 in 3x3 grid
  sound: MedicalWord;
  isVisualMatch: boolean;
  isAudioMatch: boolean;
  userVisualResponse: boolean | null;
  userAudioResponse: boolean | null;
  visualResult: ChannelResult | null;
  audioResult: ChannelResult | null;
  timestamp?: number;
}

export interface GameSettings {
  nLevel: number;
  trialsPerRound: number;
  stimulusDurationMs: number; // Duration active light/sound is shown
  trialDurationMs: number; // Total duration per trial (stimulus + wait)
  autoAdaptive: boolean;
  immediateFeedback: boolean;
  audioVolume: number; // 0 to 1
  selectedVoiceURI: string | null;
  soundEffectsVolume: number;
  dailyGoalSessions: number;
}

export interface SessionStats {
  id: string;
  date: string;
  timestamp: number;
  nLevel: number;
  totalTrials: number;
  evaluatedTrials: number; // Trials after trial index >= N
  visualHits: number;
  visualMisses: number;
  visualFalseAlarms: number;
  visualCorrectRejections: number;
  visualAccuracy: number; // 0 - 100
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  audioCorrectRejections: number;
  audioAccuracy: number; // 0 - 100
  combinedAccuracy: number; // 0 - 100
  levelChange: 'promoted' | 'demoted' | 'maintained';
  nextNLevel: number;
}

export interface UserProgress {
  currentNLevel: number;
  highestNLevel: number;
  totalSessionsPlayed: number;
  currentStreakDays: number;
  lastPlayedDate: string | null;
  sessionsToday: number;
  sessionsHistory: SessionStats[];
  proUnlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  role: string;
  nLevel: number;
  accuracy: number;
  isCurrentUser?: boolean;
}
