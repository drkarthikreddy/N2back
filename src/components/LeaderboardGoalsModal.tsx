import React, { useState } from 'react';
import { X, Target, Trophy, Bell, Flame, Crown } from 'lucide-react';
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
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showProSuccess, setShowProSuccess] = useState(false);

  const simulatedLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Dr. Sarah Lin', role: 'Neurology', nLevel: 7, accuracy: 92 },
    { rank: 2, name: 'Alexandru M.', role: 'Neurosurgery', nLevel: 6, accuracy: 89 },
    { rank: 3, name: 'Priya Patel', role: 'Cardiology', nLevel: 6, accuracy: 84 },
    { rank: 4, name: 'You', role: 'Player', nLevel: progress.highestNLevel, accuracy: 85, isCurrentUser: true },
    { rank: 5, name: 'Julian Vance', role: 'Emergency Med', nLevel: 5, accuracy: 88 },
    { rank: 6, name: 'David Cho', role: 'Medical Student', nLevel: 4, accuracy: 87 },
  ];

  const sorted = [...simulatedLeaderboard].sort((a, b) => {
    if (b.nLevel !== a.nLevel) return b.nLevel - a.nLevel;
    return b.accuracy - a.accuracy;
  }).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const completedToday = progress.sessionsToday;
  const progressPercent = Math.min(100, Math.round((completedToday / dailyGoal) * 100));

  const handleProAction = () => {
    onTogglePro();
    setShowProSuccess(true);
    setTimeout(() => setShowProSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black">Goals & Leaderboard</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Goal & Streak Card */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-black">
              <Target className="w-4 h-4 text-orange-600" />
              <span>Daily Target</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-orange-600">
              <Flame className="w-4 h-4" />
              <span>{progress.currentStreakDays} Day Streak</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-700">
            <span>Today: <strong>{completedToday} of {dailyGoal} rounds</strong></span>
            <span className="font-mono font-bold text-orange-600">{progressPercent}%</span>
          </div>

          <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-zinc-600">Set Rounds/Day:</span>
            <div className="flex items-center gap-1">
              {[2, 4, 6, 8].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onUpdateDailyGoal(g)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    dailyGoal === g
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-zinc-300 text-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-black text-black">Medical Leaderboard</span>
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 font-mono text-[10px] text-zinc-600 uppercase border-b border-zinc-200">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Clinician / Player</th>
                  <th className="py-2 px-3">Level</th>
                  <th className="py-2 px-3">Acc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-xs bg-white">
                {sorted.map((e) => (
                  <tr
                    key={e.name}
                    className={e.isCurrentUser ? 'bg-orange-50 font-black text-orange-950' : ''}
                  >
                    <td className="py-2 px-3 font-bold">{e.rank}</td>
                    <td className="py-2 px-3 font-sans font-medium flex items-center gap-1">
                      <span>{e.name}</span>
                      {e.isCurrentUser && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black text-white font-bold font-mono">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-orange-600 font-bold">N={e.nLevel}</td>
                    <td className="py-2 px-3 font-bold">{e.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual N-Back Pro Experience */}
        <div className="p-3.5 rounded-xl border-2 border-black bg-zinc-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500 text-white">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-black block">Dual N-Back Pro</span>
              <span className="text-[11px] text-zinc-600">Ad-Free & Extreme Levels</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProAction}
            className="py-1.5 px-3 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            {progress.proUnlocked ? 'Pro Active ✓' : 'Enable Pro Free'}
          </button>
        </div>

        {showProSuccess && (
          <div className="p-2 bg-emerald-100 text-emerald-800 text-xs font-bold text-center rounded-lg">
            {progress.proUnlocked ? 'Dual N-Back Pro Enabled!' : 'Standard mode enabled.'}
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
        >
          Close
        </button>

      </div>
    </div>
  );
};
