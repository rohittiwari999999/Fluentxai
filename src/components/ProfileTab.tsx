import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, ENGLISH_LEVELS } from '../data/languages';
import { NativeLanguage, EnglishLevel, UserProfile } from '../types';
import {
  User,
  Languages,
  Target,
  Clock,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Settings,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenOnboarding: () => void;
  onOpenTutorDrawer: () => void;
}

export const ProfileTab: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onOpenOnboarding,
  onOpenTutorDrawer,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<NativeLanguage>(profile.nativeLanguage);
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel>(profile.englishLevel);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(profile.dailyTargetMinutes);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSavePreferences = () => {
    voiceService.playSfx('success');
    const updated: UserProfile = {
      ...profile,
      nativeLanguage: selectedLanguage,
      englishLevel: selectedLevel,
      dailyTargetMinutes: selectedMinutes,
    };
    onUpdateProfile(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleTestVoice = () => {
    voiceService.playSfx('tap');
    voiceService.speak(
      `Hello! I am Ava, your English tutor. Your settings are configured for a ${selectedLevel} learner with ${selectedLanguage} explanations.`
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-28 pt-2 space-y-4">
      
      {/* 1. Profile Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
            🧑‍🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                {profile.name || 'Learner'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {profile.englishLevel}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
              {profile.profession && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                  {profile.profession}
                </span>
              )}
              {profile.ageGroup && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] border border-slate-700">
                  Age: {profile.ageGroup}
                </span>
              )}
              {profile.gender && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] border border-slate-700">
                  {profile.gender}
                </span>
              )}
              {profile.preferredTimeOfDay && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] border border-amber-500/20">
                  ⏰ {profile.preferredTimeOfDay}
                </span>
              )}
            </div>

            {profile.learningStruggle && (
              <div className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                <span>Focus:</span>
                <span className="font-semibold">{profile.learningStruggle}</span>
              </div>
            )}

            {profile.levelHinglishDesc && (
              <p className="text-[11px] text-purple-300 mt-0.5 italic">
                "{profile.levelHinglishDesc}"
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="px-3 py-1.5 rounded-xl bg-[#FF4B26]/20 border border-[#FF4B26]/40 hover:bg-[#FF4B26]/30 text-xs font-semibold text-[#FF4B26] hover:text-white transition-all shrink-0"
        >
          Edit Preferences
        </button>
      </div>

      {/* Save Success Alert */}
      {savedAlert && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated and saved successfully!</span>
        </div>
      )}

      {/* 2. Native Language Preference */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Native Language for Explanations</h3>
          </div>
          <span className="text-xs font-bold text-indigo-400">{selectedLanguage}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedLanguage(lang.id);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-lg">{lang.flag}</div>
                <div className="text-xs font-bold">{lang.nativeName}</div>
                <div className="text-[10px] text-slate-400">{lang.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. English CEFR Level Preference */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Target English Level</h3>
          </div>
          <span className="text-xs font-bold text-purple-400">{selectedLevel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ENGLISH_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedLevel(lvl.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-400 text-white font-bold'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-purple-300 font-mono font-bold">
                  {lvl.cefr}
                </span>
                <div className="text-xs font-bold mt-1">{lvl.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Daily Learning Goal (Minutes) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Daily Learning Commitment</h3>
          </div>
          <span className="text-xs font-bold text-amber-400">{selectedMinutes} mins / day</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 30].map((mins) => {
            const isSelected = selectedMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedMinutes(mins);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-base font-extrabold">{mins}m</div>
                <div className="text-[10px] text-slate-400">Daily</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Sound & Speech Diagnostics */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Voice & Audio Diagnostics</h3>
        </div>
        <p className="text-xs text-slate-400">
          Ava speaks using high-fidelity native synthesis. Test her voice output to ensure your speaker and volume are optimal.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleTestVoice}
            className="px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Ava Voice Audio</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSavePreferences}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-[0.99]"
      >
        Save All Profile Settings
      </button>

    </div>
  );
};
