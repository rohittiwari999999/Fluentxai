import React, { useState } from 'react';
import { AchievementBadge, SpeakingAssessmentReport, UserProfile } from '../types';
import {
  Flame,
  Award,
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  BookOpen,
  Mic,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { voiceService } from '../services/voiceService';

interface Props {
  profile: UserProfile;
  assessments: SpeakingAssessmentReport[];
  onOpenAssessment: (report: SpeakingAssessmentReport) => void;
}

export const ProgressTab: React.FC<Props> = ({ profile, assessments, onOpenAssessment }) => {
  const [badges, setBadges] = useState<AchievementBadge[]>(() => storageService.getBadges());

  // Weekly data bars (mocked based on streak & active minutes)
  const weeklyData = [
    { day: 'Mon', minutes: 12 },
    { day: 'Tue', minutes: 18 },
    { day: 'Wed', minutes: 15 },
    { day: 'Thu', minutes: 22 },
    { day: 'Fri', minutes: profile.totalSpeakingMinutes > 20 ? 25 : 14 },
    { day: 'Sat', minutes: 16 },
    { day: 'Sun', minutes: 10 },
  ];

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 30);

  // Gamification Level calculation
  const levelNumber = Math.max(1, Math.floor(profile.xp / 100) + 1);
  const xpInCurrentLevel = profile.xp % 100;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-28 pt-2 space-y-4">
      
      {/* 1. Header & Level Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              FluentX Mastery Level
            </span>
            <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Level {levelNumber}: Fluency Explorer</span>
              <span className="text-xl">🚀</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block">Total XP</span>
            <span className="text-lg font-black text-purple-300">{profile.xp} XP</span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Next Level</span>
            <span>{xpInCurrentLevel} / 100 XP</span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${xpInCurrentLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Lifetime Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-md">
          <div className="text-xl font-black text-amber-400 mb-0.5">{profile.streak} Days</div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Streak</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-md">
          <div className="text-xl font-black text-indigo-400 mb-0.5">{profile.totalSpeakingMinutes}m</div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Speaking Time</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-md">
          <div className="text-xl font-black text-emerald-400 mb-0.5">{profile.completedLessons.length}</div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lessons Done</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-md">
          <div className="text-xl font-black text-pink-400 mb-0.5">{profile.masteredVocabCount}</div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Words Mastered</div>
        </div>
      </div>

      {/* 3. Weekly Speaking Practice Chart */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">Weekly Speaking Minutes</h3>
          </div>
          <span className="text-xs text-slate-400">Target: {profile.dailyTargetMinutes}m/day</span>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
          {weeklyData.map((d, i) => {
            const barHeight = Math.max(12, Math.round((d.minutes / maxMinutes) * 100));
            const isToday = i === 4;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-slate-400 font-mono">{d.minutes}m</span>
                <div className="w-full max-w-[28px] h-full flex items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Achievement Badges */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">Achievements & Badges</h3>
          </div>
          <span className="text-xs text-purple-400 font-bold">
            {profile.unlockedBadges.length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {badges.map((b) => {
            const isUnlocked = profile.unlockedBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-purple-950/20 border-purple-500/40 text-white'
                    : 'bg-slate-850/50 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="font-bold text-xs truncate text-white">{b.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                  {b.description}
                </div>
                {isUnlocked ? (
                  <span className="mt-2 inline-block px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                    Unlocked ✓
                  </span>
                ) : (
                  <span className="mt-2 inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[9px] font-medium flex items-center justify-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Speaking Assessment History */}
      {assessments.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm sm:text-base text-white">Past Speaking Assessments</h3>
            </div>
            <span className="text-xs text-slate-400">{assessments.length} Reports</span>
          </div>

          <div className="space-y-2">
            {assessments.slice(0, 3).map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  voiceService.playSfx('tap');
                  onOpenAssessment(report);
                }}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{report.scenario}</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-black">
                      CEFR {report.cefrLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Score: {report.overallScore}% • Duration: {report.durationMinutes}m
                  </div>
                </div>

                <button className="px-3 py-1 rounded-xl bg-slate-700 text-xs font-semibold text-slate-200">
                  View Analysis
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
