import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, 
  Activity, 
  Play, 
  RotateCcw, 
  Sliders, 
  BookOpen, 
  Trophy, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Flame,
  Target,
  BarChart3,
  Stethoscope,
  Crown
} from 'lucide-react';

import { MedicalWord, Trial, GameSettings, UserProgress, SessionStats } from './types/game';
import { MEDICAL_DICTIONARY } from './data/medicalTerms';
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

export default function App() {
  // Persistence State
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'train' | 'stats'>('train');

  // Modals State
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showGoalsLeaderboard, setShowGoalsLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState<SessionStats | null>(null);

  // Game Engine State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [sequence, setSequence] = useState<Trial[]>([]);

  // Current Trial Presentation
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [currentSound, setCurrentSound] = useState<MedicalWord | null>(null);
  const [isStimulusActive, setIsStimulusActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Player Responses for Current Trial
  const [visualPressed, setVisualPressed] = useState(false);
  const [audioPressed, setAudioPressed] = useState(false);
  const [immediateVisualResult, setImmediateVisualResult] = useState<'hit' | 'miss' | 'false_alarm' | null>(null);
  const [immediateAudioResult, setImmediateAudioResult] = useState<'hit' | 'miss' | 'false_alarm' | null>(null);

  // Trial Timer & Progress
  const [trialProgressPercent, setTrialProgressPercent] = useState(100);

  // Refs for timer loops & state access inside intervals
  const trialTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trialStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(isPaused);
  const currentTrialIdxRef = useRef(currentTrialIdx);
  const sequenceRef = useRef(sequence);
  const visualPressedRef = useRef(visualPressed);
  const audioPressedRef = useRef(audioPressed);
  const settingsRef = useRef(settings);

  // Keep refs synchronized
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentTrialIdxRef.current = currentTrialIdx; }, [currentTrialIdx]);
  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { visualPressedRef.current = visualPressed; }, [visualPressed]);
  useEffect(() => { audioPressedRef.current = audioPressed; }, [audioPressed]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Initial Load & Voice setup
  useEffect(() => {
    const loadedS = loadSettings();
    setSettings(loadedS);
    const loadedP = loadProgress();
    setProgress(loadedP);

    initVoicesListener(() => {
      // voices loaded in browser
    });
  }, []);

  // Clear all running timers helper
  const clearGameTimers = useCallback(() => {
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    trialTimerRef.current = null;
    stimulusTimerRef.current = null;
    progressIntervalRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearGameTimers();
  }, [clearGameTimers]);

  // Finish Round Handler
  const finishRound = useCallback((completedTrials: Trial[]) => {
    clearGameTimers();
    setIsPlaying(false);
    setIsPaused(false);
    setIsStimulusActive(false);
    setIsPlayingAudio(false);
    setActivePosition(null);
    setCurrentSound(null);

    const s = settingsRef.current;
    const stats = calculateSessionStats(completedTrials, s.nLevel, s.autoAdaptive);

    if (stats.levelChange === 'promoted') {
      playSoundEffect('levelup', s.soundEffectsVolume);
      // Auto adapt level in settings
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

  // Run a single trial step
  const executeTrial = useCallback((idx: number) => {
    if (!isPlayingRef.current) return;

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

    // Subtle clinical telemetry pulse
    playSoundEffect('pulse', s.soundEffectsVolume * 0.35);

    // Timer: hide active square after stimulusDurationMs (mental retention interval)
    stimulusTimerRef.current = setTimeout(() => {
      setIsStimulusActive(false);
    }, s.stimulusDurationMs);

    // Progress Bar countdown
    trialStartTimeRef.current = Date.now();
    const duration = s.trialDurationMs;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - trialStartTimeRef.current;
      const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
      setTrialProgressPercent(remainingPercent);
    }, 40);

    // Trial End Timer: evaluate responses and step forward
    trialTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      // Record final responses for this trial
      const vPressed = visualPressedRef.current;
      const aPressed = audioPressedRef.current;

      trial.userVisualResponse = vPressed;
      trial.userAudioResponse = aPressed;

      const evalResults = evaluateTrialChannels(trial, s.nLevel);
      trial.visualResult = evalResults.visualResult;
      trial.audioResult = evalResults.audioResult;

      // Advance to next trial
      executeTrial(idx + 1);
    }, duration);
  }, [finishRound]);

  // Start / Restart Round
  const startRound = useCallback((overrideLevel?: number) => {
    clearGameTimers();
    setLastSessionStats(null);

    const level = overrideLevel ?? settings.nLevel;
    const newSeq = generateDualNBackSequence(level, settings.trialsPerRound);

    setSequence(newSeq);
    sequenceRef.current = newSeq;
    setCurrentTrialIdx(0);
    setIsPlaying(true);
    setIsPaused(false);
    setActiveTab('train');

    // Small initial countdown breather so audio context is active
    setTimeout(() => {
      executeTrial(0);
    }, 400);
  }, [clearGameTimers, executeTrial, settings.nLevel, settings.trialsPerRound]);

  // Toggle Pause
  const togglePause = useCallback(() => {
    if (!isPlaying) return;

    if (isPaused) {
      // Resume
      setIsPaused(false);
      // Restart current trial
      executeTrial(currentTrialIdxRef.current);
    } else {
      // Pause
      setIsPaused(true);
      clearGameTimers();
      setIsStimulusActive(false);
    }
  }, [clearGameTimers, executeTrial, isPaused, isPlaying]);

  // Handle Visual Match Press (Key 'A' or on-screen button)
  const handleVisualPress = useCallback(() => {
    if (!isPlaying || isPaused || visualPressed) return;

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
  }, [isPaused, isPlaying, settings.immediateFeedback, settings.soundEffectsVolume, visualPressed]);

  // Handle Audio Match Press (Key 'L' or on-screen button)
  const handleAudioPress = useCallback(() => {
    if (!isPlaying || isPaused || audioPressed) return;

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
  }, [audioPressed, isPaused, isPlaying, settings.immediateFeedback, settings.soundEffectsVolume]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
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
        if (isPlaying) {
          togglePause();
        } else {
          startRound();
        }
      } else if (e.code === 'Enter') {
        if (lastSessionStats) {
          // Advance to next round from summary modal
          startRound(lastSessionStats.nextNLevel);
        } else if (!isPlaying) {
          startRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAudioPress, handleVisualPress, isPlaying, lastSessionStats, startRound, togglePause]);

  // Save Settings handler
  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Reset to Defaults handler
  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  // Reset History handler
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

  // Update Daily Goal
  const handleUpdateDailyGoal = (goal: number) => {
    const newSettings = { ...settings, dailyGoalSessions: goal };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Toggle Pro
  const handleTogglePro = () => {
    const updated = { ...progress, proUnlocked: !progress.proUnlocked };
    setProgress(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('med_nback_progress_v1', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Clinical Telemetry Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950">
              <Activity className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  MedNBack
                </h1>
                <span className="text-[11px] font-mono text-teal-400 font-semibold bg-teal-950/70 border border-teal-500/30 px-2 py-0.5 rounded-md">
                  N={settings.nLevel}
                </span>
                {progress.proUnlocked && (
                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 border border-amber-400/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Clinical Dual N-Back · TB, CML, AIDS, MI, Angina, Typhoid, Dengue, Mumps, Rabies
              </p>
            </div>
          </div>

          {/* Navigation Controls & Metric Badges */}
          <div className="flex items-center gap-2">
            
            {/* View Switcher: Train vs Stats */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveTab('train')}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'train'
                    ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Train
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Stats</span>
              </button>
            </div>

            {/* Quick Actions (Glossary, Tutorial, Goals, Settings) */}
            <button
              type="button"
              onClick={() => setShowGlossary(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
              title="Medical Glossary (9 Conditions)"
            >
              <Stethoscope className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowGoalsLeaderboard(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700 transition-colors relative"
              title="Goals & Leaderboard"
            >
              <Trophy className="w-4 h-4" />
              {progress.sessionsToday >= settings.dailyGoalSessions && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Game Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* Main App Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-center">
        
        {activeTab === 'train' ? (
          <div className="flex flex-col items-center justify-center">
            
            {/* Round Telemetry Status Strip */}
            <div className="w-full max-w-[420px] mb-6 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {isPlaying ? (
                    <span>
                      TRIAL <strong className="text-white font-bold">{currentTrialIdx + 1}</strong> / {sequence.length}
                    </span>
                  ) : (
                    <span>SESSION READY</span>
                  )}
                </span>
                {isPaused && (
                  <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                    PAUSED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Target:</span>
                <span className="font-mono text-teal-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  Match {settings.nLevel} Steps Ago
                </span>
              </div>
            </div>

            {/* 3x3 Medical Positive Stimulus Grid */}
            <MedicalGrid
              activePosition={activePosition}
              isStimulusActive={isStimulusActive}
              currentSound={currentSound}
              isPlayingAudio={isPlayingAudio}
              immediateVisualResult={immediateVisualResult}
              immediateAudioResult={immediateAudioResult}
            />

            {/* Response Controls (Visual Match [A] & Sound Match [L]) */}
            {isPlaying ? (
              <GameControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                onVisualPress={handleVisualPress}
                onAudioPress={handleAudioPress}
                onTogglePause={togglePause}
                onRestart={() => startRound()}
                visualPressedThisTrial={visualPressed}
                audioPressedThisTrial={audioPressed}
                trialProgressPercent={trialProgressPercent}
                immediateVisualResult={immediateVisualResult}
                immediateAudioResult={immediateAudioResult}
                showImmediateFeedback={settings.immediateFeedback}
                disabled={false}
              />
            ) : (
              /* Idle / Start State */
              <div className="w-full max-w-[420px] mx-auto mt-12 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => startRound()}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-extrabold text-base tracking-wide shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2.5 select-none active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Start Training Session (N={settings.nLevel})</span>
                </button>

                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-teal-400" />
                    <span>{settings.trialsPerRound} trials per round</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{progress.sessionsToday}/{settings.dailyGoalSessions} daily goal</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Stats & History View */
          <StatsView
            progress={progress}
            onStartTraining={() => {
              setActiveTab('train');
              startRound();
            }}
            onResetHistory={handleResetHistory}
          />
        )}

      </main>

      {/* Clinical Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span>Auditory Stimuli:</span>
            <span className="font-mono text-slate-400">TB · CML · AIDS · MI · Angina · Typhoid · Dengue · Mumps · Rabies</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              How it works
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowGlossary(true)}
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              Condition Glossary
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowGoalsLeaderboard(true)}
              className="text-slate-400 hover:text-amber-300 transition-colors"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {lastSessionStats && (
        <RoundSummaryModal
          stats={lastSessionStats}
          trials={sequence}
          onNextRound={() => startRound(lastSessionStats.nextNLevel)}
          onOpenGlossary={() => setShowGlossary(true)}
          onClose={() => setLastSessionStats(null)}
        />
      )}

      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
          audioVolume={settings.audioVolume}
          voiceURI={settings.selectedVoiceURI}
        />
      )}

      {showGlossary && (
        <GlossaryModal
          onClose={() => setShowGlossary(false)}
          audioVolume={settings.audioVolume}
          voiceURI={settings.selectedVoiceURI}
        />
      )}

      {showGoalsLeaderboard && (
        <LeaderboardGoalsModal
          progress={progress}
          dailyGoal={settings.dailyGoalSessions}
          onUpdateDailyGoal={handleUpdateDailyGoal}
          onTogglePro={handleTogglePro}
          onClose={() => setShowGoalsLeaderboard(false)}
        />
      )}

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
