import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import {
  NativeLanguage,
  EnglishLevel,
  Gender,
  AgeGroup,
  Profession,
  UserProfile,
  LearningGoal,
  LearningReason,
  LearningStruggle,
  TimeOfDay,
} from '../types';
import {
  ArrowLeft,
  Volume2,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  Bell,
  TrendingUp,
  PhoneCall,
  Calendar,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { voiceService } from '../services/voiceService';

interface Props {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile, shouldStartCall?: boolean) => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

interface EnglishLevelOption {
  text: string;
  level: EnglishLevel;
  cefr: string;
}

const ENGLISH_LEVEL_OPTIONS: EnglishLevelOption[] = [
  {
    text: 'Main english mein abhi beginner hoon',
    level: 'Absolute Beginner',
    cefr: 'A1-',
  },
  {
    text: 'Mujhe kuch common English words aate hain',
    level: 'Beginner',
    cefr: 'A1',
  },
  {
    text: 'Basic conversation mujhse ho jaati hai',
    level: 'Elementary',
    cefr: 'A2',
  },
  {
    text: 'Alag-alag topics par baat karne mein comfortable hoon',
    level: 'Intermediate',
    cefr: 'B1',
  },
  {
    text: 'English fluently bolne mein koi dikkat nahin',
    level: 'Advanced',
    cefr: 'C1',
  },
];

const PROFESSIONS: { id: Profession; label: string; icon: string }[] = [
  { id: 'Business Owner', label: 'Business Owner', icon: '💼' },
  { id: 'Working Professional', label: 'Working Professional', icon: '👔' },
  { id: 'Home Maker', label: 'Home Maker', icon: '🏠' },
  { id: 'Student', label: 'Student', icon: '🎓' },
  { id: 'Teacher', label: 'Teacher', icon: '👩‍🏫' },
  { id: 'Other', label: 'Job Seeker / Other', icon: '🌐' },
];

const REASONS: { id: LearningReason; label: string; icon: string; goal: LearningGoal }[] = [
  { id: 'Rozmarra ki English', label: 'Rozmarra ki English', icon: '🗣️', goal: 'Daily Fluency' },
  { id: 'Job interviews', label: 'Job interviews clear karna', icon: '💼', goal: 'Job Interview' },
  { id: 'Office promotion & career', label: 'Office promotion & career growth', icon: '📈', goal: 'Office & Business' },
  { id: 'Higher education', label: 'Higher education & exams', icon: '🎓', goal: 'Exam & Academics' },
  { id: 'Social confidence & family', label: 'Social circle & confidence', icon: '👨‍👩‍👦', goal: 'Social Confidence' },
  { id: 'Videsh jaana', label: 'Videsh jaana ya travel karna', icon: '✈️', goal: 'Travel & Tourism' },
  { id: 'Bas maze ke liye', label: 'Bas maze ke liye seekhna hai', icon: '🎉', goal: 'Daily Fluency' },
];

const STRUGGLES: { id: LearningStruggle; label: string; icon: string }[] = [
  { id: 'Bolte waqt atak jaana', label: 'Bolte waqt atak jaana (Hesitation)', icon: '🤐' },
  { id: 'Words bhool jaana', label: 'Sahi time par words bhool jaana', icon: '🧠' },
  { id: 'Grammar rules & tenses', label: 'Grammar rules aur tenses mein confusion', icon: '📖' },
  { id: 'Sahi sentence banana', label: 'Dimag mein sentence jaldi na banna', icon: '🧩' },
  { id: 'Bolne walon ko samajhna', label: 'Angrezon ya fast bolne walon ko samajhna', icon: '👂' },
];

const TIME_OPTIONS: { id: TimeOfDay; label: string; icon: string }[] = [
  { id: 'Subah (Morning)', label: 'Subah (Morning)', icon: '🌅' },
  { id: 'Din mein (Afternoon)', label: 'Din mein (Afternoon)', icon: '☀️' },
  { id: 'Lunch ke baad (Lunch)', label: 'Lunch ke waqt', icon: '🍱' },
  { id: 'Shaam (Evening)', label: 'Shaam (Evening)', icon: '🌇' },
  { id: 'Sone se pehle (Night)', label: 'Sone se pehle (Night)', icon: '🌙' },
  { id: 'Flexible (Kabhi bhi)', label: 'Flexible (Jab bhi time mile)', icon: '⏰' },
];

const DAILY_TIME_CHOICES = [
  { minutes: 10, label: '5-10 mins / day', tag: 'Light & Easy' },
  { minutes: 15, label: '15-20 mins / day', tag: 'Recommended ⭐' },
  { minutes: 30, label: '30 mins / day', tag: 'Fast Progress 🔥' },
  { minutes: 45, label: '45+ mins / day', tag: 'Intense Fluency 🚀' },
];

const AGE_GROUPS: AgeGroup[] = ['<18', '18-25', '26-30', '31-40', '41-50', '50+'];

export const OnboardingModal: React.FC<Props> = ({
  initialProfile,
  onComplete,
  onCancel,
  canCancel = false,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 10;

  // Form State
  const [selectedLanguage, setSelectedLanguage] = useState<NativeLanguage>(
    initialProfile.nativeLanguage || 'Hindi'
  );
  const [learnerName, setLearnerName] = useState(
    initialProfile.name && initialProfile.name !== 'Learner' ? initialProfile.name : ''
  );
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'Male');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialProfile.ageGroup || '18-25');
  const [profession, setProfession] = useState<Profession>(
    initialProfile.profession || 'Working Professional'
  );
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(() => {
    const idx = ENGLISH_LEVEL_OPTIONS.findIndex(
      (o) => o.level === initialProfile.englishLevel
    );
    return idx >= 0 ? idx : 0;
  });

  const [selectedReason, setSelectedReason] = useState<LearningReason>(
    initialProfile.learningReason || 'Rozmarra ki English'
  );
  const [selectedStruggle, setSelectedStruggle] = useState<LearningStruggle>(
    initialProfile.learningStruggle || 'Bolte waqt atak jaana'
  );
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>(
    initialProfile.preferredTimeOfDay || 'Shaam (Evening)'
  );
  const [dailyMinutes, setDailyMinutes] = useState<number>(
    initialProfile.dailyTargetMinutes || 15
  );
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>('20:00');

  const handleSpeakQuestion = () => {
    voiceService.playSfx('tap');
    if (step === 1) {
      voiceService.speak('Which language do you speak at home?');
    } else if (step === 2) {
      voiceService.speak('Hi, main Ava hoon! Aapka naam kya hai?');
    } else if (step === 3) {
      voiceService.speak('Aapka profession kya hai?');
    } else if (step === 4) {
      voiceService.speak('Aapka english level kya hai?');
    } else if (step === 5) {
      voiceService.speak('English seekhne ka aapka reason kya hai?');
    } else if (step === 6) {
      voiceService.speak('English seekhne mein sabse mushkil kya lagta hai?');
    } else if (step === 7) {
      voiceService.speak('Aapke din mein seekhne ka sabse accha samay kab hai?');
    } else if (step === 8) {
      voiceService.speak('Main aapko roz practice karne ke liye yaad dilaungi.');
    } else if (step === 9) {
      voiceService.speak('Aap bilkul ready hain! Yeh hai aapka personalized plan.');
    } else if (step === 10) {
      voiceService.speak('Meet Ava, aapki personal AI teacher. Chalo shuru karein!');
    }
  };

  const buildUpdatedProfile = (): UserProfile => {
    const chosenLevel = ENGLISH_LEVEL_OPTIONS[selectedLevelIndex];
    const chosenReasonObj = REASONS.find((r) => r.id === selectedReason);

    return {
      ...initialProfile,
      name: learnerName.trim() || 'Learner',
      gender,
      ageGroup,
      profession,
      nativeLanguage: selectedLanguage,
      englishLevel: chosenLevel.level,
      levelHinglishDesc: chosenLevel.text,
      learningReason: selectedReason,
      learningGoal: chosenReasonObj ? chosenReasonObj.goal : 'Daily Fluency',
      learningStruggle: selectedStruggle,
      preferredTimeOfDay: selectedTimeOfDay,
      dailyTargetMinutes: dailyMinutes,
      dailyReminderEnabled: reminderEnabled,
      reminderTime,
      onboarded: true,
    };
  };

  const handleNext = () => {
    voiceService.playSfx('tap');

    if (step === 2 && !learnerName.trim()) {
      setLearnerName('Dost');
    }

    if (step < totalSteps) {
      setStep(step + 1);
      if (step === 8) {
        // Confetti for completing assessment before showing road map
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } else {
      finalizeOnboarding(false);
    }
  };

  const finalizeOnboarding = (startCallNow: boolean) => {
    const updated = buildUpdatedProfile();
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}

    voiceService.playSfx('levelUp');
    voiceService.speak(
      `Shabash ${updated.name}! Main Ava hoon, aapki AI English partner. Let's make you speak fluently!`
    );
    onComplete(updated, startCallNow);
  };

  const handleBack = () => {
    voiceService.playSfx('tap');
    if (step > 1) {
      setStep(step - 1);
    } else if (canCancel && onCancel) {
      onCancel();
    }
  };

  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10] text-white overflow-hidden">
      <div className="relative w-full max-w-md h-full flex flex-col justify-between px-5 pt-3 pb-5 bg-[#0B0C10]">
        
        {/* Top Header Navigation */}
        <div>
          <div className="flex items-center gap-3 pt-2 pb-2">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : canCancel && onCancel ? (
              <button
                onClick={onCancel}
                className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white transition-colors"
                aria-label="Close"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-6" />
            )}

            {/* Progress Bar */}
            <div className="flex-1 h-1.5 bg-[#242633] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF4B26] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Audio Voice readout */}
            <button
              onClick={handleSpeakQuestion}
              title="Listen in Ava's voice"
              className="w-9 h-9 rounded-full bg-[#181B26] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#202533] transition-all shrink-0"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: Which language do you speak at home? */}
        {step === 1 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-white mt-2 mb-4 px-2">
              Which language do you speak at home?
            </h1>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setSelectedLanguage(lang.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26] shadow-lg shadow-[#FF4B26]/10'
                        : 'bg-[#161822] border border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="text-base font-semibold text-white">
                      {lang.nativeName} / {lang.name}
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Name, Gender & Age */}
        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200 pt-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl overflow-hidden">
                    👩‍🏫
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 text-sm">👋</span>
              </div>

              <div className="relative bg-white text-slate-900 font-bold px-4 py-2 rounded-2xl rounded-bl-sm text-sm shadow-lg">
                Hi, main Ava hoon!
                <div className="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Your name
              </label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="Yahan apna naam likhen"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#161822] border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF4B26] text-base transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Male', 'Female'] as Gender[]).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        voiceService.playSfx('tap');
                        setGender(g);
                      }}
                      className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#181B26] border-2 border-[#FF4B26]'
                          : 'bg-[#161822] border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-sm text-white">{g}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#00C853] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select Age
              </label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((age) => {
                  const isSelected = ageGroup === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        voiceService.playSfx('tap');
                        setAgeGroup(age);
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#FF4B26] text-white shadow-md shadow-[#FF4B26]/30'
                          : 'bg-[#161822] border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Profession */}
        {step === 3 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-white mt-2 mb-4 px-2">
              Aapka profession kya hai?
            </h1>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {PROFESSIONS.map((prof) => {
                const isSelected = profession === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setProfession(prof.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26] shadow-lg shadow-[#FF4B26]/10'
                        : 'bg-[#161822] border border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{prof.icon}</span>
                      <span className="text-sm sm:text-base font-semibold text-white">
                        {prof.label}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: English Level */}
        {step === 4 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-white mt-2 mb-4 px-2">
              Aapka english level kya hai?
            </h1>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {ENGLISH_LEVEL_OPTIONS.map((opt, index) => {
                const isSelected = selectedLevelIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setSelectedLevelIndex(index);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26] shadow-lg shadow-[#FF4B26]/10'
                        : 'bg-[#161822] border border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="text-sm font-semibold text-white leading-snug">
                        {opt.text}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">
                        CEFR: {opt.cefr} ({opt.level})
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Reason for learning */}
        {step === 5 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-white mt-2 mb-4 px-2">
              English seekhne ka aapka reason kya hai?
            </h1>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setSelectedReason(r.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26] shadow-lg shadow-[#FF4B26]/10'
                        : 'bg-[#161822] border border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <span className="text-sm font-semibold text-white">
                        {r.label}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Biggest Struggle */}
        {step === 6 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-white mt-2 mb-4 px-2 leading-tight">
              English seekhne mein sabse mushkil kya lagta hai?
            </h1>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {STRUGGLES.map((st) => {
                const isSelected = selectedStruggle === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setSelectedStruggle(st.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26] shadow-lg shadow-[#FF4B26]/10'
                        : 'bg-[#161822] border border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{st.icon}</span>
                      <span className="text-sm font-semibold text-white">
                        {st.label}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Daily Routine & Best Time */}
        {step === 7 && (
          <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200 pt-2 space-y-4">
            <h1 className="text-xl font-bold text-center text-white mb-1">
              Aapke din mein seekhne ka sabse accha samay kab hai?
            </h1>

            {/* Time of day choices */}
            <div className="grid grid-cols-2 gap-2.5">
              {TIME_OPTIONS.map((tod) => {
                const isSelected = selectedTimeOfDay === tod.id;
                return (
                  <button
                    key={tod.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setSelectedTimeOfDay(tod.id);
                    }}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-[#181B26] border-2 border-[#FF4B26]'
                        : 'bg-[#161822] border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{tod.icon}</span>
                    <span className="text-xs font-bold text-white leading-tight">
                      {tod.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Rozana kitna samay de sakte hain?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {DAILY_TIME_CHOICES.map((choice) => {
                  const isSelected = dailyMinutes === choice.minutes;
                  return (
                    <button
                      key={choice.minutes}
                      onClick={() => {
                        voiceService.playSfx('tap');
                        setDailyMinutes(choice.minutes);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#FF4B26]/10 border-2 border-[#FF4B26]'
                          : 'bg-[#161822] border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">
                        {choice.label}
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                        {choice.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Daily Habit Pledge & Notification Reminder */}
        {step === 8 && (
          <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in duration-200">
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 mb-3">
                ⏰
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-2 leading-snug">
                Main aapko roz app pe English practice karne ke liye yaad dilaungi
              </h1>
              <p className="text-xs text-slate-400 text-center max-w-xs mx-auto mb-6">
                Consistency is the secret to fluent English speaking. Din mein bas{' '}
                <strong className="text-white font-bold">{dailyMinutes} minutes</strong>{' '}
                se bolne ka confidence 10x badhega!
              </p>

              <div className="p-4 rounded-3xl bg-[#161824] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Daily Reminder
                      </div>
                      <div className="text-xs text-slate-400">
                        {reminderEnabled ? 'Enabled' : 'Muted'}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#FF4B26] rounded cursor-pointer"
                  />
                </div>

                {reminderEnabled && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">
                      Preferred Reminder Time
                    </span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-[#FF4B26]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-xs text-emerald-300 font-semibold">
                ✨ "Main roz English practice karne ka vaada karta/karti hoon!"
              </span>
            </div>
          </div>
        )}

        {/* STEP 9: Personalized Profile Ready & Roadmap */}
        {step === 9 && (
          <div className="flex-1 flex flex-col justify-between py-2 overflow-y-auto animate-in fade-in duration-200">
            <div>
              <div className="text-center mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wider inline-block mb-2">
                  Plan Ready!
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Aap bilkul ready hain!
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Yeh hai aapka personalized Fluency Roadmap
                </p>
              </div>

              {/* Fluency Trajectory Graphic */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#161928] to-[#10121C] border border-indigo-500/30 shadow-2xl space-y-4 mb-4">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Your 4-Stage Pathway</span>
                  <span className="text-amber-400">Target: Star Speaker ⭐</span>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-indigo-500/40 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#FF4B26] ring-4 ring-[#FF4B26]/30" />
                    <div className="text-xs font-black text-white">
                      Stage 1: Foundation (Aap yahan hain)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Remove hesitation ({selectedStruggle}) & master daily core phrases.
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30" />
                    <div className="text-xs font-black text-indigo-300">
                      Stage 2: Rising Voice
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Speaking without translating in head; {profession} vocabulary.
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-700" />
                    <div className="text-xs font-black text-slate-300">
                      Stage 3: Good Talker
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Fluency in meetings, interviews, and real-life phone calls.
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500" />
                    <div className="text-xs font-black text-amber-400">
                      Stage 4: Star Speaker
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Effortless, natural accent & spontaneous English expression.
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Profile Summary Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#161822] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Track</span>
                  <strong className="text-white font-bold">{profession}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#161822] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Primary Goal</span>
                  <strong className="text-white font-bold line-clamp-1">{selectedReason}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: Meet Ava / Direct Voice Call Choice */}
        {step === 10 && (
          <div className="flex-1 flex flex-col justify-between py-2 text-center animate-in zoom-in-95 duration-200">
            <div>
              {/* Ava calling photo / avatar */}
              <div className="relative w-28 h-28 mx-auto mt-2 mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-1 shadow-2xl shadow-indigo-500/20">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-6xl">
                    👩‍🏫
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider inline-block mb-1">
                Your AI Teacher is Online
              </span>

              <h1 className="text-2xl font-black text-white mb-2">
                Meet Ava!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                "Hello {learnerName || 'dost'}! Main aapki 24/7 personal English teacher hoon. Galti hone ki chinta bilkul mat kijiye, hum maze-maze mein seekhenge!"
              </p>
            </div>

            {/* Two Action Paths: Direct Voice Call or Explore Dashboard */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => finalizeOnboarding(true)}
                className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Call Ava Now (Direct Voice Call)</span>
              </button>

              <button
                onClick={() => finalizeOnboarding(false)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-[#181B26] hover:bg-[#202533] border border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Go to Learning Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Fixed Continue Button (For Steps 1 to 9) */}
        {step < 10 && (
          <div className="pt-3 border-t border-slate-900 mt-2">
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-base text-white bg-[#FF4B26] hover:bg-[#E03E1C] active:scale-[0.99] transition-all shadow-lg shadow-[#FF4B26]/20 flex items-center justify-center gap-2"
            >
              <span>{step === 9 ? 'Meet Ava →' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
