import { GameSettings, UserProgress, SessionStats } from '../types/game';

const SETTINGS_KEY = 'med_nback_settings_v1';
const PROGRESS_KEY = 'med_nback_progress_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  nLevel: 2,
  trialsPerRound: 20,
  stimulusDurationMs: 450,
  trialDurationMs: 2000,
  autoAdaptive: true,
  immediateFeedback: true,
  audioVolume: 0.9,
  selectedVoiceURI: null,
  soundEffectsVolume: 0.7,
  dailyGoalSessions: 4,
};

export const DEFAULT_PROGRESS: UserProgress = {
  currentNLevel: 2,
  highestNLevel: 2,
  totalSessionsPlayed: 0,
  currentStreakDays: 1,
  lastPlayedDate: null,
  sessionsToday: 0,
  sessionsHistory: [],
  proUnlocked: false,
};

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed: UserProgress = JSON.parse(raw);

    // Check if day changed to reset sessionsToday
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastPlayedDate !== today) {
      // Calculate streak
      if (parsed.lastPlayedDate) {
        const lastDate = new Date(parsed.lastPlayedDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 2) {
          // Missed more than 1 day
          parsed.currentStreakDays = 1;
        }
      }
      parsed.sessionsToday = 0;
    }

    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function recordCompletedSession(
  stats: SessionStats,
  currentProgress: UserProgress
): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = currentProgress.lastPlayedDate !== today;

  let streak = currentProgress.currentStreakDays;
  if (isNewDay) {
    if (currentProgress.lastPlayedDate) {
      const last = new Date(currentProgress.lastPlayedDate);
      const curr = new Date(today);
      const dayDiff = Math.round((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        streak += 1;
      } else if (dayDiff > 1) {
        streak = 1;
      }
    } else {
      streak = 1;
    }
  }

  const updated: UserProgress = {
    ...currentProgress,
    currentNLevel: stats.nextNLevel,
    highestNLevel: Math.max(currentProgress.highestNLevel, stats.nextNLevel),
    totalSessionsPlayed: currentProgress.totalSessionsPlayed + 1,
    currentStreakDays: streak,
    lastPlayedDate: today,
    sessionsToday: isNewDay ? 1 : currentProgress.sessionsToday + 1,
    sessionsHistory: [stats, ...currentProgress.sessionsHistory].slice(0, 100),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  }

  return updated;
}
