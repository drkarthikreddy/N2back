import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Sliders, 
  BookOpen, 
  Trophy, 
  HelpCircle, 
  BarChart3, 
  Stethoscope, 
  Maximize, 
  Minimize, 
  Pause, 
  Clock, 
  Zap, 
  Flame, 
  Target 
} from 'lucide-react';

import { MedicalWord, Trial, GameSettings, UserProgress, SessionStats } from './types/game';
import { 
  loadSettings, 
  saveSettings, 
  loadProgress, 
  recordCompletedSession, 
  DEFAULT_SETTINGS 
} from './utils/storage';
import { 
  generateDualNBackSequence, 
  evaluateTrialChannels, 
  calculateSessionStats 
} from './utils/gameLogic';
import { playMedicalSpeech, playSoundEffect, initVoicesListener } from './utils/audio';

import { MedicalGrid } from './components/MedicalGrid';
import { GameControls } from './components/GameControls';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { TutorialModal } from './components/TutorialModal';
import { GlossaryModal } from './components/GlossaryModal';
import { StatsView } from './components/StatsView';
import { LeaderboardGoalsModal } from './components/LeaderboardGoalsModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';

type AppScreen = 'home' | 'playing' | 'stats';

export default function App() {
  // Persistence State
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // App & Game State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showGoalsLeaderboard, setShowGoalsLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState<SessionStats | null>(null);

  // Gameplay Engine
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [sequence, setSequence] = useState<Trial[]>([]);

  // Current Trial Presentation
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [currentSound, setCurrentSound] = useState<MedicalWord | null>(null);
  const [isStimulusActive, setIsStimulusActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Current Trial Player Responses
  const [visualPressed, setVisualPressed] = useState(false);
  const [audioPressed, setAudioPressed] = useState(false);
  const [immediateVisualResult, setImmediateVisualResult] = useState<'hit' | 'miss' | 'false_alarm' | null>(null);
  const [immediateAudioResult, setImmediateAudioResult] = useState<'hit' | 'miss' | 'false_alarm' | null>(null);

  // Timer & Progress
  const [trialProgressPercent, setTrialProgressPercent] = useState(100);

  // Refs for synchronous loop control
  const trialTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trialStartTimeRef = useRef<number>(0);

  const currentScreenRef = useRef(currentScreen);
  const isPausedRef = useRef(isPaused);
  const currentTrialIdxRef = useRef(currentTrialIdx);
  const sequenceRef = useRef(sequence);
  const visualPressedRef = useRef(visualPressed);
  const audioPressedRef = useRef(audioPressed);
  const settingsRef = useRef(settings);

  useEffect(() => { currentScreenRef.current = currentScreen; }, [currentScreen]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentTrialIdxRef.current = currentTrialIdx; }, [currentTrialIdx]);
  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { visualPressedRef.current = visualPressed; }, [visualPressed]);
  useEffect(() => { audioPressedRef.current = audioPressed; }, [audioPressed]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Initial load
  useEffect(() => {
    const loadedS = loadSettings();
    setSettings(loadedS);
    const loadedP = loadProgress();
    setProgress(loadedP);

    initVoicesListener(() => {});

    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Safe timer clearing helper
  const clearGameTimers = useCallback(() => {
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    trialTimerRef.current = null;
    stimulusTimerRef.current = null;
    progressIntervalRef.current = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  useEffect(() => {
    return () => clearGameTimers();
  }, [clearGameTimers]);

  // Pause game automatically if any modal is opened
  const pauseGameIfRunning = useCallback(() => {
    if (currentScreenRef.current === 'playing') {
      setIsPaused(true);
      clearGameTimers();
      setIsStimulusActive(false);
      setIsPlayingAudio(false);
    }
  }, [clearGameTimers]);

  // Finish Round
  const finishRound = useCallback((completedTrials: Trial[]) => {
    clearGameTimers();
    setCurrentScreen('home');
    setIsPaused(false);
    setIsStimulusActive(false);
    setIsPlayingAudio(false);
    setActivePosition(null);
    setCurrentSound(null);

    const s = settingsRef.current;
    const stats = calculateSessionStats(completedTrials, s.nLevel, s.autoAdaptive);

    if (stats.levelChange === 'promoted') {
      playSoundEffect('levelup', s.soundEffectsVolume);
      const newSettings = { ...s, nLevel: stats.nextNLevel };
      setSettings(newSettings);
      saveSettings(newSettings);
    } else if (stats.levelChange === 'demoted') {
      playSoundEffect('miss', s.soundEffectsVolume * 0.7);
      const newSettings = { ...s, nLevel: stats.nextNLevel };
      setSettings(newSettings);
      saveSettings(newSettings);
    } else {
      playSoundEffect('pulse', s.soundEffectsVolume);
    }

    const updatedProg = recordCompletedSession(stats, progress);
    setProgress(updatedProg);
    setLastSessionStats(stats);
  }, [clearGameTimers, progress]);

  // Execute trial
  const executeTrial = useCallback((idx: number) => {
    if (currentScreenRef.current !== 'playing' || isPausedRef.current) {
      return;
    }

    const currentSeq = sequenceRef.current;
    if (idx >= currentSeq.length) {
      finishRound(currentSeq);
      return;
    }

    const trial = currentSeq[idx];
    setCurrentTrialIdx(idx);
    setVisualPressed(false);
    setAudioPressed(false);
    setImmediateVisualResult(null);
    setImmediateAudioResult(null);
    setTrialProgressPercent(100);

    // Visual Presentation
    setActivePosition(trial.position);
    setIsStimulusActive(true);

    // Audio Presentation (Speech Synthesis)
    setCurrentSound(trial.sound);
    setIsPlayingAudio(true);
    const s = settingsRef.current;

    playMedicalSpeech(trial.sound, s.audioVolume, s.selectedVoiceURI).finally(() => {
      setIsPlayingAudio(false);
    });

    playSoundEffect('pulse', s.soundEffectsVolume * 0.25);

    // Turn off active visual square after stimulusDurationMs
    stimulusTimerRef.current = setTimeout(() => {
      setIsStimulusActive(false);
    }, s.stimulusDurationMs);

    // Trial countdown progress bar
    trialStartTimeRef.current = Date.now();
    const duration = s.trialDurationMs;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - trialStartTimeRef.current;
      const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
      setTrialProgressPercent(remainingPercent);
    }, 35);

    // Trial timer end
    trialTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      const vPressed = visualPressedRef.current;
      const aPressed = audioPressedRef.current;

      trial.userVisualResponse = vPressed;
      trial.userAudioResponse = aPressed;

      const evalResults = evaluateTrialChannels(trial, s.nLevel);
      trial.visualResult = evalResults.visualResult;
      trial.audioResult = evalResults.audioResult;

      executeTrial(idx + 1);
    }, duration);
  }, [finishRound]);

  // Start Play Session
  const startPlaySession = useCallback((overrideLevel?: number) => {
    clearGameTimers();
    setLastSessionStats(null);

    const level = overrideLevel ?? settings.nLevel;
    const newSeq = generateDualNBackSequence(level, settings.trialsPerRound);

    setSequence(newSeq);
    sequenceRef.current = newSeq;
    setCurrentTrialIdx(0);
    setCurrentScreen('playing');
    setIsPaused(false);

    setTimeout(() => {
      executeTrial(0);
    }, 300);
  }, [clearGameTimers, executeTrial, settings.nLevel, settings.trialsPerRound]);

  // Pause action (opens PauseModal)
  const handlePauseGame = useCallback(() => {
    if (currentScreen !== 'playing') return;
    setIsPaused(true);
    clearGameTimers();
    setIsStimulusActive(false);
    setIsPlayingAudio(false);
  }, [clearGameTimers, currentScreen]);

  // Resume action
  const handleResumeGame = useCallback(() => {
    setIsPaused(false);
    executeTrial(currentTrialIdxRef.current);
  }, [executeTrial]);

  // New Game action (Exit to Opening Screen)
  const handleNewGame = useCallback(() => {
    clearGameTimers();
    setIsPaused(false);
    setIsStimulusActive(false);
    setIsPlayingAudio(false);
    setActivePosition(null);
    setCurrentSound(null);
    setCurrentScreen('home');
  }, [clearGameTimers]);

  // Handle Visual Match Press
  const handleVisualPress = useCallback(() => {
    if (currentScreen !== 'playing' || isPaused || visualPressed) return;

    setVisualPressed(true);
    playSoundEffect('click', settings.soundEffectsVolume * 0.4);

    if (settings.immediateFeedback) {
      const trial = sequenceRef.current[currentTrialIdxRef.current];
      if (trial) {
        if (trial.isVisualMatch) {
          setImmediateVisualResult('hit');
          playSoundEffect('hit', settings.soundEffectsVolume * 0.5);
        } else {
          setImmediateVisualResult('false_alarm');
          playSoundEffect('miss', settings.soundEffectsVolume * 0.5);
        }
      }
    }
  }, [currentScreen, isPaused, settings.immediateFeedback, settings.soundEffectsVolume, visualPressed]);

  // Handle Audio Match Press
  const handleAudioPress = useCallback(() => {
    if (currentScreen !== 'playing' || isPaused || audioPressed) return;

    setAudioPressed(true);
    playSoundEffect('click', settings.soundEffectsVolume * 0.4);

    if (settings.immediateFeedback) {
      const trial = sequenceRef.current[currentTrialIdxRef.current];
      if (trial) {
        if (trial.isAudioMatch) {
          setImmediateAudioResult('hit');
          playSoundEffect('hit', settings.soundEffectsVolume * 0.5);
        } else {
          setImmediateAudioResult('false_alarm');
          playSoundEffect('miss', settings.soundEffectsVolume * 0.5);
        }
      }
    }
  }, [audioPressed, currentScreen, isPaused, settings.immediateFeedback, settings.soundEffectsVolume]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'KeyA' || e.code === 'KeyS') {
        e.preventDefault();
        handleVisualPress();
      } else if (e.code === 'KeyL' || e.code === 'KeyK') {
        e.preventDefault();
        handleAudioPress();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (currentScreen === 'playing') {
          if (isPaused) {
            handleResumeGame();
          } else {
            handlePauseGame();
          }
        } else if (currentScreen === 'home') {
          startPlaySession();
        }
      } else if (e.code === 'Enter') {
        if (lastSessionStats) {
          startPlaySession(lastSessionStats.nextNLevel);
        } else if (currentScreen === 'home') {
          startPlaySession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, handleAudioPress, handlePauseGame, handleResumeGame, handleVisualPress, isPaused, lastSessionStats, startPlaySession]);

  // Settings Updaters
  const updateNLevel = (lvl: number) => {
    const updated = { ...settings, nLevel: lvl };
    setSettings(updated);
    saveSettings(updated);
  };

  const updateSpeed = (ms: number) => {
    const updated = { ...settings, trialDurationMs: ms };
    setSettings(updated);
    saveSettings(updated);
  };

  const updateTrials = (trials: number) => {
    const updated = { ...settings, trialsPerRound: trials };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  const handleResetHistory = () => {
    const updated: UserProgress = {
      ...progress,
      sessionsHistory: [],
      highestNLevel: settings.nLevel,
      currentNLevel: settings.nLevel,
      totalSessionsPlayed: 0
    };
    setProgress(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('med_nback_progress_v1', JSON.stringify(updated));
    }
  };

  const handleUpdateDailyGoal = (goal: number) => {
    const newSettings = { ...settings, dailyGoalSessions: goal };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleTogglePro = () => {
    const updated = { ...progress, proUnlocked: !progress.proUnlocked };
    setProgress(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('med_nback_progress_v1', JSON.stringify(updated));
    }
  };

  // Estimated total session time in seconds
  const estimatedSeconds = Math.round((settings.trialsPerRound * settings.trialDurationMs) / 1000);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-white text-black select-none">
      
      {/* ================= HEADER ================= */}
      {currentScreen !== 'playing' ? (
        /* HOME / OPENING SCREEN HEADER: All Top Bar Options Displayed */
        <header className="w-full shrink-0 border-b-2 border-black bg-white px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* Title / Brand */}
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-black">
                MedNBack
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-mono font-black text-xs shadow-sm">
                N={settings.nLevel}
              </span>
            </div>

            {/* Top Bar Complete Navigation Options */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => {
                  pauseGameIfRunning();
                  setCurrentScreen(currentScreen === 'stats' ? 'home' : 'stats');
                }}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  currentScreen === 'stats'
                    ? 'bg-orange-500 text-white border-black shadow-sm'
                    : 'bg-white hover:bg-zinc-100 border-black text-black'
                }`}
                title="Stats"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  pauseGameIfRunning();
                  setShowGlossary(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-black text-black transition-colors cursor-pointer"
                title="Glossary (9 Words)"
              >
                <Stethoscope className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  pauseGameIfRunning();
                  setShowGoalsLeaderboard(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-black text-black transition-colors cursor-pointer"
                title="Goals & Leaderboard"
              >
                <Trophy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  pauseGameIfRunning();
                  setShowSettings(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-black text-black transition-colors cursor-pointer"
                title="Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  pauseGameIfRunning();
                  setShowTutorial(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-black text-black transition-colors cursor-pointer"
                title="Help & Rules"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border-2 border-black text-black transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* GAMEPLAY TOP BAR: Clean, Minimal, NO retry or clutter. ONLY Pause button! */
        <header className="w-full shrink-0 border-b-2 border-black bg-white px-3 py-1.5 sm:px-4">
          <div className="max-w-md mx-auto flex items-center justify-between font-mono font-black text-xs">
            <span className="text-zinc-900">
              TRIAL {currentTrialIdx + 1} / {sequence.length}
            </span>

            <span className="text-orange-600 font-sans tracking-wide">
              MATCH N={settings.nLevel}
            </span>

            {/* ONLY ONE PAUSE BUTTON PRESENT WHILE PLAYING */}
            <button
              type="button"
              onClick={handlePauseGame}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-zinc-100 border-2 border-black text-black font-sans font-black text-xs shadow-[0_2px_0_#000000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Pause Game"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause</span>
            </button>
          </div>
        </header>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <main className="flex-1 min-h-0 w-full flex flex-col justify-between overflow-hidden">
        
        {currentScreen === 'home' && (
          /* ================= OPENING SCREEN ================= */
          <div className="h-full w-full max-w-md mx-auto px-4 py-2 flex flex-col justify-between overflow-y-auto">
            
            {/* Title / Intro */}
            <div className="text-center pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                Medical Dual N-Back
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Configure your workout and sharpen working memory
              </p>
            </div>

            {/* 1. Level Adjustment */}
            <div className="p-3 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-black flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-orange-600" />
                  N-Back Level
                </span>
                <span className="font-mono text-sm font-black text-orange-600">
                  N={settings.nLevel} ({settings.nLevel} steps back)
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateNLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                      settings.nLevel === lvl
                        ? 'bg-orange-500 border-2 border-black text-white shadow-sm scale-105'
                        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-black'
                    }`}
                  >
                    N={lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Speed Adjustment */}
            <div className="p-3 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-black flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Speed Interval
                </span>
                <span className="font-mono text-xs font-bold text-zinc-700">
                  {(settings.trialDurationMs / 1000).toFixed(1)}s / step
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Blitz (1.6s)', ms: 1600 },
                  { label: 'Pro (2.0s)', ms: 2000 },
                  { label: 'Standard (2.4s)', ms: 2400 },
                  { label: 'Relaxed (3.0s)', ms: 3000 },
                ].map((opt) => (
                  <button
                    key={opt.ms}
                    type="button"
                    onClick={() => updateSpeed(opt.ms)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
                      settings.trialDurationMs === opt.ms
                        ? 'bg-orange-500 border-2 border-black text-white shadow-sm'
                        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-black'
                    }`}
                  >
                    {opt.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Time Limit / Session Length Adjustment */}
            <div className="p-3 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-black flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Time Limit / Trials
                </span>
                <span className="font-mono text-xs font-bold text-zinc-700">
                  {settings.trialsPerRound} trials (~{estimatedSeconds}s)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 20, 25, 30].map((count) => {
                  const estSec = Math.round((count * settings.trialDurationMs) / 1000);
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateTrials(count)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                        settings.trialsPerRound === count
                          ? 'bg-orange-500 border-2 border-black text-white shadow-sm'
                          : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-black'
                      }`}
                    >
                      {count} ({estSec}s)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Start / Play Button */}
            <div className="w-full pt-1 pb-1">
              <button
                type="button"
                onClick={() => startPlaySession()}
                className="w-full h-16 sm:h-18 rounded-2xl bg-orange-500 hover:bg-orange-600 border-2 border-black text-white font-black text-base sm:text-lg tracking-wider shadow-[0_5px_0_#000000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>PLAY DUAL N-BACK</span>
              </button>

              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-600 px-2 mt-2">
                <span>EST: ~{estimatedSeconds}s</span>
                <span className="flex items-center gap-1 text-orange-600">
                  <Flame className="w-3.5 h-3.5" />
                  {progress.currentStreakDays} DAY STREAK
                </span>
              </div>
            </div>

          </div>
        )}

        {currentScreen === 'playing' && (
          /* ================= GAMEPLAY SCREEN ================= */
          <div className="h-full w-full max-w-md mx-auto px-3 py-1 flex flex-col justify-between overflow-hidden">
            
            {/* 3x3 Grid Matrix: FILLS ENTIRE space between upper bar and lower buttons */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
              <MedicalGrid
                activePosition={activePosition}
                isStimulusActive={isStimulusActive}
                currentSound={currentSound}
                isPlayingAudio={isPlayingAudio}
                immediateVisualResult={immediateVisualResult}
                immediateAudioResult={immediateAudioResult}
              />
            </div>

            {/* Bottom Dual Action Controls: POSITION [A] & SOUND [L] (NO retry/pause buttons here) */}
            <div className="w-full shrink-0 pb-1 pt-0.5">
              <GameControls
                isPlaying={true}
                isPaused={isPaused}
                onVisualPress={handleVisualPress}
                onAudioPress={handleAudioPress}
                visualPressedThisTrial={visualPressed}
                audioPressedThisTrial={audioPressed}
                trialProgressPercent={trialProgressPercent}
                immediateVisualResult={immediateVisualResult}
                immediateAudioResult={immediateAudioResult}
                showImmediateFeedback={settings.immediateFeedback}
                disabled={isPaused}
              />
            </div>

          </div>
        )}

        {currentScreen === 'stats' && (
          /* ================= STATS VIEW ================= */
          <div className="flex-1 min-h-0 w-full overflow-y-auto px-4 py-2">
            <StatsView
              progress={progress}
              onStartTraining={() => {
                startPlaySession();
              }}
              onResetHistory={handleResetHistory}
            />
          </div>
        )}

      </main>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* Pause Modal (Opened via the single Pause button) */}
      {isPaused && currentScreen === 'playing' && (
        <PauseModal
          currentTrial={currentTrialIdx + 1}
          totalTrials={sequence.length}
          nLevel={settings.nLevel}
          onContinue={handleResumeGame}
          onNewGame={handleNewGame}
          onHelp={() => setShowTutorial(true)}
        />
      )}

      {/* Round Summary Modal */}
      {lastSessionStats && (
        <RoundSummaryModal
          stats={lastSessionStats}
          trials={sequence}
          onNextRound={() => startPlaySession(lastSessionStats.nextNLevel)}
          onOpenGlossary={() => setShowGlossary(true)}
          onClose={() => setLastSessionStats(null)}
        />
      )}

      {/* Tutorial / Help Modal */}
      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
          audioVolume={settings.audioVolume}
          voiceURI={settings.selectedVoiceURI}
        />
      )}

      {/* Medical Condition Glossary */}
      {showGlossary && (
        <GlossaryModal
          onClose={() => setShowGlossary(false)}
          audioVolume={settings.audioVolume}
          voiceURI={settings.selectedVoiceURI}
        />
      )}

      {/* Goals & Leaderboard */}
      {showGoalsLeaderboard && (
        <LeaderboardGoalsModal
          progress={progress}
          dailyGoal={settings.dailyGoalSessions}
          onUpdateDailyGoal={handleUpdateDailyGoal}
          onTogglePro={handleTogglePro}
          onClose={() => setShowGoalsLeaderboard(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onResetDefaults={handleResetDefaults}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
}
