
import { Difficulty } from './types';

export const AI_MODELS = {
  TEXT: 'gemini-2.5-flash',
  IMAGE: 'imagen-3.0-generate-002',
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  [Difficulty.Novice]: "English narration. Hungarian dialogue & options with inline English translations.",
  [Difficulty.Intermediate]: "English narration. Hungarian dialogue & options. A glossary sidebar helps with key words.",
  [Difficulty.Superior]: "English narration. Pure Hungarian dialogue and options, no translations provided.",
  [Difficulty.Advanced]: "Full immersion. Narration, dialogue, and options are all in Hungarian.",
  [Difficulty.ErosPista]: "The ultimate challenge. Full Hungarian immersion with free-text input instead of multiple choice."
};
