
export enum Difficulty {
  Novice = "Novice",
  Intermediate = "Intermediate",
  Superior = "Superior",
  Advanced = "Advanced",
  ErosPista = "Erős Pista"
}

export enum GameState {
  Start = "Start",
  Loading = "Loading",
  Playing = "Playing",
  Finished = "Finished"
}

export interface WordBreakdown {
  root: {
    text: string;
    meaning: string;
  };
  suffixes: Array<{
    text: string;
    meaning: string;
    function: string;
  }>;
}

export interface Scene {
  turn: number;
  narration: string;
  imagePrompt: string;
  dialogue?: {
    speaker: string;
    hungarian: string;
    english?: string; // For Novice level
  };
  options?: Array<{
    hungarian: string;
    english?: string; // For Novice level
  }>;
  question?: string; // For Erős Pista level
  imageUrl?: string;
  feedback?: string;
  feedbackType?: 'positive' | 'negative';
}

export interface Mission {
  title: string;
  difficulty: Difficulty;
  scenes: Scene[];
  glossary?: string[];
}

export interface EncounteredWord {
  word: string;
  breakdown: WordBreakdown;
  count: number;
}