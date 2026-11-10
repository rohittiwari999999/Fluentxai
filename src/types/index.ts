export type NativeLanguage =
  | 'Hindi'
  | 'English'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Marathi'
  | 'Gujarati'
  | 'Urdu'
  | 'Odia';

export interface LanguageInfo {
  id: NativeLanguage;
  name: string;
  nativeName: string;
  script: string;
  flag: string;
}

export type EnglishLevel =
  | 'Absolute Beginner'
  | 'Beginner'
  | 'Elementary'
  | 'Intermediate'
  | 'Upper Intermediate'
  | 'Advanced';

export interface LevelInfo {
  id: EnglishLevel;
  cefr: string;
  title: string;
  description: string;
  color: string;
}

export type Profession =
  | 'Business Owner'
  | 'Working Professional'
  | 'Home Maker'
  | 'Student'
  | 'Teacher'
  | 'Job Seeker'
  | 'Other';

export type Gender = 'Male' | 'Female' | 'Other';

export type AgeGroup = '<18' | '18-25' | '26-30' | '31-40' | '41-50' | '50+';

export type LearningGoal =
  | 'Daily Fluency'
  | 'Job Interview'
  | 'Travel & Tourism'
  | 'Office & Business'
  | 'Exam & Academics'
  | 'Social Confidence';

export type LearningStyle =
  | 'Voice & Speaking First'
  | 'Structured Grammar'
  | 'Flashcards & Vocab'
  | 'Real-life Roleplay';

export type LearningReason =
  | 'Rozmarra ki English'
  | 'Job interviews'
  | 'Office promotion & career'
  | 'Higher education'
  | 'Social confidence & family'
  | 'Videsh jaana'
  | 'Bas maze ke liye';

export type LearningStruggle =
  | 'Bolte waqt atak jaana'
  | 'Words bhool jaana'
  | 'Grammar rules & tenses'
  | 'Sahi sentence banana'
  | 'Bolne walon ko samajhna';

export type TimeOfDay =
  | 'Subah (Morning)'
  | 'Din mein (Afternoon)'
  | 'Lunch ke baad (Lunch)'
  | 'Shaam (Evening)'
  | 'Sone se pehle (Night)'
  | 'Flexible (Kabhi bhi)';

export type LearningMode =
  | 'voice_call'
  | 'fun_games'
  | 'career_focus'
  | 'structured_course';

export interface UserProfile {
  id: string;
  name: string;
  gender?: Gender;
  ageGroup?: AgeGroup;
  profession?: Profession;
  nativeLanguage: NativeLanguage;
  englishLevel: EnglishLevel;
  levelHinglishDesc?: string;
  learningGoal: LearningGoal;
  learningReason?: LearningReason;
  learningStruggle?: LearningStruggle;
  preferredTimeOfDay?: TimeOfDay;
  dailyTargetMinutes: number;
  dailyReminderEnabled?: boolean;
  reminderTime?: string; // e.g. "20:00"
  preferredStyle: LearningStyle;
  activeLearningMode?: LearningMode;
  xp: number;
  streak: number;
  lastActiveDate: string;
  activeDates: string[]; // YYYY-MM-DD
  completedLessons: string[];
  masteredVocabCount: number;
  totalSpeakingMinutes: number;
  unlockedBadges: string[];
  currentUnitId: string;
  currentLessonId: string;
  onboarded?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'speaking' | 'vocab' | 'lessons' | 'mastery';
  unlockedAt?: string;
  progress: number; // 0 - 100
  targetCount: number;
  currentCount: number;
}

export type NativeTranslations = Partial<Record<NativeLanguage, string>> & {
  Hindi: string;
  English: string;
  [key: string]: string | undefined;
};

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  level: EnglishLevel;
  durationMinutes: number;
  xpReward: number;
  nativeExplanation: NativeTranslations;
  grammarRule: string;
  examples: {
    english: string;
    nativeTranslation: NativeTranslations;
    phonetic?: string;
  }[];
  speakingExercise: {
    targetSentence: string;
    hint: string;
    nativeTranslation: NativeTranslations;
  };
  quiz: {
    question: string;
    nativeQuestion?: NativeTranslations;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  level: EnglishLevel;
  icon: string;
  lessons: Lesson[];
}

export type ConversationScenario =
  | 'Free Talk'
  | 'Daily Life'
  | 'Shopping'
  | 'Restaurant'
  | 'Travel'
  | 'School'
  | 'Office'
  | 'Job Interview'
  | 'Public Speaking'
  | 'Group Discussion';

export interface ScenarioMeta {
  id: ConversationScenario;
  title: string;
  description: string;
  characterName: string;
  characterRole: string;
  avatar: string;
  starterMessage: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  suggestedPhrases: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  feedback?: string;
  translation?: string;
  suggestedResponse?: string;
  audioDurationSeconds?: number;
}

export interface GrammarAnalysis {
  original: string;
  corrected: string;
  hasError: boolean;
  errorType?: string;
  explanation: string;
  nativeExplanation: string;
  grammarRules: string[];
  alternativeExpressions: string[];
  spokenPracticeTip?: string;
}

export interface TranslateSpeakItem {
  id: string;
  category: string;
  nativeText: NativeTranslations;
  englishTranslation: string;
  structureBreakdown: string;
  grammarRule: string;
  nativeExplanation: NativeTranslations;
  phoneticGuide: string;
  alternativeExpressions: string[];
  speakingTips: string;
}

export interface PronunciationResult {
  score: number;
  targetText: string;
  userSpokenText: string;
  wordDiff: {
    word: string;
    status: 'correct' | 'needs_practice' | 'missed';
    phonemeTip?: string;
  }[];
  phoneticFocus: string;
  mouthPlacementTip: string;
  improvementAreas: string[];
  encouragement: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  level: EnglishLevel;
  phonetic: string;
  meaningInNative: NativeTranslations;
  definition: string;
  exampleSentence: string;
  nativeExample: NativeTranslations;
  synonyms: string[];
  antonyms: string[];
  box: number; // Leitner box 1 to 5
  nextReviewDate: string;
  timesPracticed: number;
}

export interface SpeakingAssessmentReport {
  id: string;
  date: string;
  overallScore: number;
  cefrLevel: string;
  scenario: string;
  durationMinutes: number;
  metrics: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    sentenceFormation: number;
    confidence: number;
  };
  strengths: string[];
  weaknesses: string[];
  notableMistakes: {
    said: string;
    corrected: string;
    reason: string;
  }[];
  suggestions: string[];
  nextRecommendedPractice: string;
}
