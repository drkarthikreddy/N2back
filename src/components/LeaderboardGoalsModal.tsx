import React, { useState } from 'react';
import { X, Target, Trophy, Bell, Sparkles, Check, Flame, ShieldCheck, Crown } from 'lucide-react';
import { UserProgress, LeaderboardEntry } from '../types/game';

interface LeaderboardGoalsModalProps {
  progress: UserProgress;
  onClose: () => void;
  dailyGoal: number;
  onUpdateDailyGoal: (newGoal: number) => void;
  onTogglePro: () => void;
}

export const LeaderboardGoalsModal: React.FC<LeaderboardGoalsModalProps> = ({
  progress,
  onClose,
  dailyGoal,
  onUpdateDailyGoal,
  onTogglePro,
}) => {
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showProSuccess, setShowProSuccess] = useState(false);

  // Simulated Medical & Cognitive Leaderboard
  const simulatedLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Dr. Sarah Lin', role: 'Neurology Fellow (Johns Hopkins)', nLevel: 7, accuracy: 92 },
    { rank: 2, name: 'Alexandru M.', role: 'Neurosurgery Resident (Charité)', nLevel: 6, accuracy: 89 },
    { rank: 3, name: 'Priya Patel', role: 'Cardiology Registrar (Imperial)', nLevel: 6, accuracy: 84 },
    { rank: 4, name: 'You (Current Rank)', role: 'Medical Brain Athlete', nLevel: progress.highestNLevel, accuracy: 85, isCurrentUser: true },
    { rank: 5, name: 'Julian Vance', role: 'Emergency Medicine (UCLA)', nLevel: 5, accuracy: 88 },
    { rank: 6, name: 'Elena Rostova', role: 'Cognitive Neuroscientist', nLevel: 5, accuracy: 83 },
    { rank: 7, name: 'David Cho', role: 'MS3 Medical Student', nLevel: 4, accuracy: 87 },
  ];

  // Sort with current user integrated correctly
  const sortedLeaderboard = [...simulatedLeaderboard].sort((a, b) => {
    if (b.nLevel !== a.nLevel) return b.nLevel - a.nLevel;
    return b.accuracy - a.accuracy;
  }).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const completedToday = progress.sessionsToday;
  const progressPercent = Math.min(100, Math.round((completedToday / dailyGoal) * 100));

  const handleEnableReminders = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          setNotificationEnabled(true);
        } else {
          setNotificationEnabled(true); // Soft enabled in-app
        }
      });
    } else {
      setNotificationEnabled(true);
    }
  };

  const handleProAction = () => {
    onTogglePro();
    setShowProSuccess(true);
    setTimeout(() => setShowProSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Goals, Streaks & Leaderboards</h2>
              <p className="text-xs text-slate-400">Track habits and compare with medical training peers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Goal & Streak Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Target className="w-4 h-4 text-teal-400" />
              <span>Daily Practice Target</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold font-mono">
              <Flame className="w-4 h-4" />
              <span>{progress.currentStreakDays} Day Streak</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Today's Sessions: <strong className="text-white font-mono">{completedToday} / {dailyGoal}</strong></span>
            <span className="font-mono text-teal-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 text-[11px]">Set Target Rounds / Day:</span>
            <div className="flex items-center gap-1">
              {[2, 4, 6, 8].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onUpdateDailyGoal(g)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                    dailyGoal === g
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Reminders */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Daily Memory Workout Reminder</h4>
              <p className="text-[11px] text-slate-400">Consistent training reinforces cognitive synaptic pathways</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-slate-200"
            />
            <button
              type="button"
              onClick={handleEnableReminders}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                notificationEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              }`}
            >
              {notificationEnabled ? 'Reminders Active ✓' : 'Set Reminder'}
            </button>
          </div>
        </div>

        {/* Global Clinical Cohort Leaderboard */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Global Medical Cohort Leaderboard
            </span>
            <span className="text-[11px] text-slate-500">Ranked by N-Back Ceiling & Accuracy</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[10px] font-mono text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Player / Clinician</th>
                  <th className="py-2 px-3">Specialty / Role</th>
                  <th className="py-2 px-3">Level</th>
                  <th className="py-2 px-3">Acc %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {sortedLeaderboard.map((entry) => (
                  <tr
                    key={entry.name}
                    className={`transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-teal-500/10 font-bold border-l-2 border-l-teal-400'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}`}
                    </td>
                    <td className="py-2.5 px-3 text-white font-sans font-medium flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-400 text-slate-950 font-bold font-mono">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{entry.role}</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">N={entry.nLevel}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{entry.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual N-Back Pro Section (Prompted Feature) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dual N-Back Pro Experience</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
              {progress.proUnlocked ? 'PRO ACTIVE' : '3-DAY FREE TRIAL AVAILABLE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Upgrade your cognitive workout: 100% ad-free training, unlock extreme N-back levels up to N=9, custom medical stimuli, and deep cognitive metric exports.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {progress.proUnlocked ? 'All Pro perks active on this device' : 'Cancel anytime in account settings.'}
            </span>
            <button
              type="button"
              onClick={handleProAction}
              className="py-1.5 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all select-none active:scale-[0.98]"
            >
              {progress.proUnlocked ? 'Revert to Standard Mode' : 'Activate Dual N-Back Pro (Free)'}
            </button>
          </div>

          {showProSuccess && (
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
              {progress.proUnlocked
                ? '🎉 Dual N-Back Pro activated! Ad-free environment & pro analytics unlocked.'
                : 'Switched back to standard mode.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
