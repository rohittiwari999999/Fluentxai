import React, { useState } from 'react';
import { UserProfile, LearningMode } from '../types';
import { TabType } from './BottomNav';
import {
  Flame,
  Sparkles,
  Mic,
  BookOpen,
  Volume2,
  ArrowRight,
  Target,
  Zap,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  PhoneCall,
  Gamepad2,
  Briefcase,
  Smile,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface Props {
  profile: UserProfile;
  onSelectTab: (tab: TabType) => void;
  onStartVoiceCall: () => void;
  onOpenFunZone: () => void;
  onOpenThinkSpeak: () => void;
  onOpenPronunciation: () => void;
  onOpenGrammar: () => void;
  onOpenVocab: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const HomeTab: React.FC<Props> = ({
  profile,
  onSelectTab,
  onStartVoiceCall,
  onOpenFunZone,
  onOpenThinkSpeak,
  onOpenPronunciation,
  onOpenGrammar,
  onOpenVocab,
  onUpdateProfile,
}) => {
  const nativeLang = profile.nativeLanguage || 'Hindi';
  const dailyTargetMinutes = profile.dailyTargetMinutes || 15;
  const progressPercent = Math.min(
    100,
    Math.round((profile.totalSpeakingMinutes / dailyTargetMinutes) * 100)
  );

  // Active learning mode selected by user
  const activeMode: LearningMode = profile.activeLearningMode || 'voice_call';

  const handleSelectMode = (mode: LearningMode) => {
    voiceService.playSfx('tap');
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, activeLearningMode: mode });
    }
  };

  // Daily Speaking Challenge state
  const [challengeSpoken, setChallengeSpoken] = useState('');
  const [isListeningChallenge, setIsListeningChallenge] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  const todayChallenge = {
    prompt: 'Describe your favorite morning routine in one clear English sentence.',
    sample: 'I enjoy starting my morning with a cup of hot tea and a brisk walk.',
  };

  const handleStartChallengeMic = () => {
    if (isListeningChallenge) {
      voiceService.stopListening();
      setIsListeningChallenge(false);
      return;
    }

    setChallengeSpoken('');
    setIsListeningChallenge(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setChallengeSpoken(transcript);
        if (isFinal) {
          setIsListeningChallenge(false);
          if (transcript.trim().split(' ').length >= 4) {
            voiceService.playSfx('success');
            setChallengeSuccess(true);
          }
        }
      },
      () => setIsListeningChallenge(false),
      () => setIsListeningChallenge(false)
    );

    if (!started) setIsListeningChallenge(false);
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-28 pt-2 space-y-4">
      
      {/* 1. Daily Learning Target & Streak Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          {/* Progress Circular Ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-700 ease-out"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">
              {progressPercent}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {profile.name ? `Namaste, ${profile.name}!` : "Today's Target"}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {profile.totalSpeakingMinutes} / {dailyTargetMinutes} mins
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.profession ? (
                <span>
                  <strong className="text-slate-300 font-semibold">{profile.profession}</strong> track • {profile.streak}-day streak!
                </span>
              ) : (
                `Keep practicing to maintain your ${profile.streak}-day streak!`
              )}
            </p>
          </div>
        </div>

        {/* 7-day mini streak indicators */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          {daysOfWeek.map((day, i) => {
            const isCompleted = i <= Math.min(6, profile.streak);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-slate-500">{day}</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. "Aap Kaise Seekhna Chahte Hain?" - Learning Mode Switcher */}
      <div className="p-4 rounded-3xl bg-[#141624] border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aap kaise seekhna chahte hain? (Learning Style)</span>
          </span>
          <span className="text-[10px] text-slate-400">Tap to switch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Mode 1: Voice Call Ava */}
          <button
            onClick={() => handleSelectMode('voice_call')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMode === 'voice_call'
                ? 'bg-gradient-to-br from-[#FF4B26]/20 to-indigo-900/30 border-2 border-[#FF4B26] shadow-md shadow-[#FF4B26]/20'
                : 'bg-[#181A28] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xl mb-1">📞</div>
            <div className="text-xs font-black text-white leading-tight">
              Call Ava
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              1-on-1 Real Phone Call
            </div>
          </button>

          {/* Mode 2: Fun Games */}
          <button
            onClick={() => handleSelectMode('fun_games')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMode === 'fun_games'
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-900/30 border-2 border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-[#181A28] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xl mb-1">🎉</div>
            <div className="text-xs font-black text-white leading-tight">
              Maje Maje Mein
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5">
              Twisters & Games
            </div>
          </button>

          {/* Mode 3: Career / Interview Focus */}
          <button
            onClick={() => handleSelectMode('career_focus')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMode === 'career_focus'
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-900/30 border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-[#181A28] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xl mb-1">💼</div>
            <div className="text-xs font-black text-white leading-tight">
              Career & Office
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">
              Interviews & Meetings
            </div>
          </button>

          {/* Mode 4: Structured Grammar Course */}
          <button
            onClick={() => handleSelectMode('structured_course')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMode === 'structured_course'
                ? 'bg-gradient-to-br from-indigo-500/20 to-blue-900/30 border-2 border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-[#181A28] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xl mb-1">📚</div>
            <div className="text-xs font-black text-white leading-tight">
              Grammar & Rules
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">
              Step-by-step Course
            </div>
          </button>
        </div>
      </div>

      {/* 3. Flagship Hero: AI Phone Call with Ava (Inspired by Screenshot) */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-[#181B2B] text-white border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Ava is Online
            </span>
            <span className="text-[11px] text-indigo-200 font-semibold">
              Live Phone Call Simulation
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            Call Ava • 1-on-1 Voice Call
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4 leading-relaxed">
            Asli phone call ki tarah Ava se baat kijiye. Galti hone par Ava Hindi mein samjhayegi aur darr poori tarah khatam hoga!
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                voiceService.playSfx('tap');
                onStartVoiceCall();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 flex items-center gap-2.5"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Ava Now (Instant Connect)</span>
            </button>

            <button
              onClick={() => {
                voiceService.playSfx('tap');
                onSelectTab('speak');
              }}
              className="px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>10 Scenarios</span>
            </button>
          </div>
        </div>

        {/* Ambient background avatar */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-7xl select-none opacity-40 sm:opacity-85 pointer-events-none">
          👩‍🏫
        </div>
      </div>

      {/* 4. "Maje Maje Mein English Sikhein" Fun Zone Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-pink-950/40 to-slate-900 border border-purple-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-base font-black text-white">
                Maje Maje Mein English Sikhein
              </h3>
              <p className="text-xs text-purple-300">
                Games khel kar naturally English bolna seekhein
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onOpenFunZone();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <span>Play All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onOpenFunZone();
            }}
            className="p-3 rounded-2xl bg-[#161828] border border-slate-800 hover:border-purple-500/60 text-center transition-all group"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👅</div>
            <div className="text-xs font-bold text-white">जीभ घुमाओ</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tongue Twister</div>
          </button>

          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onOpenFunZone();
            }}
            className="p-3 rounded-2xl bg-[#161828] border border-slate-800 hover:border-pink-500/60 text-center transition-all group"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎬</div>
            <div className="text-xs font-bold text-white">देसी मुहावरे</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bollywood Idioms</div>
          </button>

          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onOpenFunZone();
            }}
            className="p-3 rounded-2xl bg-[#161828] border border-slate-800 hover:border-emerald-500/60 text-center transition-all group"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🧩</div>
            <div className="text-xs font-bold text-white">शब्द जोड़ो</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Jumble Puzzle</div>
          </button>
        </div>
      </div>

      {/* 5. Continue Learning Active Lesson */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Continue Learning
            </div>
            <div className="font-bold text-sm text-white">
              Introducing Yourself Confidently
            </div>
            <div className="text-xs text-slate-400">
              Unit 1: Introductions & Daily Speaking
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onSelectTab('learn');
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Quick Action Modules Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Think in Hindi / Native, Speak in English */}
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onOpenThinkSpeak();
          }}
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            💭
          </div>
          <div className="text-xs font-bold text-white group-hover:text-amber-300">
            Think in {nativeLang}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Translate thoughts into natural spoken English
          </div>
        </button>

        {/* Pronunciation Coach */}
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onOpenPronunciation();
          }}
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            🎯
          </div>
          <div className="text-xs font-bold text-white group-hover:text-cyan-300">
            Pronunciation Coach
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Word diff, mouth & tongue placement guides
          </div>
        </button>

        {/* AI Grammar Doctor */}
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onOpenGrammar();
          }}
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            🩺
          </div>
          <div className="text-xs font-bold text-white group-hover:text-emerald-300">
            AI Grammar Doctor
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Identify tense & preposition slips in {nativeLang}
          </div>
        </button>

        {/* Vocabulary Builder (Flashcards) */}
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onOpenVocab();
          }}
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            📇
          </div>
          <div className="text-xs font-bold text-white group-hover:text-purple-300">
            Vocabulary Builder
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Daily words with Spaced Repetition boxes
          </div>
        </button>
      </div>

      {/* 7. Today's Interactive Speaking Challenge */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Today's Speaking Challenge
            </span>
          </div>
          <span className="text-xs font-bold text-purple-400">+25 XP</span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-white mb-1">
          {todayChallenge.prompt}
        </p>
        <p className="text-[11px] text-slate-400 italic mb-3">
          Example: "{todayChallenge.sample}"
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartChallengeMic}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              isListeningChallenge
                ? 'bg-rose-500 text-white animate-pulse'
                : challengeSuccess
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>
              {isListeningChallenge
                ? 'Listening... Speak now'
                : challengeSuccess
                ? 'Challenge Completed! ✓'
                : 'Speak Answer Out Loud'}
            </span>
          </button>
        </div>

        {challengeSpoken && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-800 text-xs text-slate-200">
            <span className="text-slate-400 block text-[10px]">Recognized voice:</span>
            "{challengeSpoken}"
          </div>
        )}
      </div>

      {/* 8. Vocabulary Word of the Day */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
            Vocabulary of the Day
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">Articulate</span>
            <span className="text-xs text-purple-300 italic font-mono">/ɑːrˈtɪk.jə.lət/</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            "Able to express thoughts and ideas clearly in speech."
          </div>
        </div>

        <button
          onClick={() => {
            voiceService.playSfx('tap');
            voiceService.speak('Articulate. Able to express thoughts clearly in speech.');
          }}
          className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all shrink-0"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
