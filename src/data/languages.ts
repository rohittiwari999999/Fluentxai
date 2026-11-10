import { LanguageInfo, LevelInfo, NativeLanguage, EnglishLevel } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari', flag: '🇮🇳' },
  { id: 'Marathi', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', flag: '🇮🇳' },
  { id: 'Bengali', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', flag: '🇮🇳' },
  { id: 'Telugu', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', flag: '🇮🇳' },
  { id: 'Tamil', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', flag: '🇮🇳' },
  { id: 'Gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', flag: '🇮🇳' },
  { id: 'Kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', flag: '🇮🇳' },
  { id: 'Urdu', name: 'Urdu', nativeName: 'اردو', script: 'Arabic-Persian', flag: '🇮🇳' },
  { id: 'Odia', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', flag: '🇮🇳' },
  { id: 'Malayalam', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', flag: '🇮🇳' },
  { id: 'English', name: 'English', nativeName: 'English', script: 'Latin', flag: '🌐' },
];

export const ENGLISH_LEVELS: LevelInfo[] = [
  {
    id: 'Absolute Beginner',
    cefr: 'A1-',
    title: 'Absolute Beginner',
    description: 'Starting from scratch with alphabet, basic words, and simple greetings.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'Beginner',
    cefr: 'A1',
    title: 'Beginner',
    description: 'Know basic words, want to build simple sentences and introduce myself.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'Elementary',
    cefr: 'A2',
    title: 'Elementary',
    description: 'Can understand basic questions and want to express daily activities.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'Intermediate',
    cefr: 'B1',
    title: 'Intermediate',
    description: 'Can hold casual conversations, want to overcome hesitation and grammar gaps.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'Upper Intermediate',
    cefr: 'B2',
    title: 'Upper Intermediate',
    description: 'Speak fairly fluently, need professional polish, idioms, and natural flow.',
    color: 'from-violet-500 to-pink-500',
  },
  {
    id: 'Advanced',
    cefr: 'C1',
    title: 'Advanced',
    description: 'Master debates, executive presentations, nuanced idioms, and high confidence.',
    color: 'from-purple-600 to-rose-600',
  },
];
