import React, { useState } from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_DESCRIPTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface StartScreenProps {
  onStart: (difficulty: Difficulty, customPrompt?: string) => void;
  loading: boolean;
  error: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, loading, error }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Novice);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleStart = () => {
    onStart(selectedDifficulty, customPrompt);
  };

  return (
    <div className="bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-2xl max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-amber-300 mb-4 text-center">Choose Your Path</h2>
      <p className="text-slate-300 mb-6 text-center">Select a difficulty level to begin your Hungarian language quest.</p>
      
      <div className="space-y-4 mb-6">
        {Object.values(Difficulty).map((level) => (
          <div
            key={level}
            onClick={() => setSelectedDifficulty(level)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedDifficulty === level
                ? 'border-amber-400 bg-amber-400/10 shadow-lg'
                : 'border-slate-600 hover:border-amber-400 hover:bg-slate-700/50'
            }`}
          >
            <h3 className="font-bold text-lg text-amber-400">{level}</h3>
            <p className="text-sm text-slate-300">{DIFFICULTY_DESCRIPTIONS[level]}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label htmlFor="custom-prompt" className="block text-slate-300 font-medium mb-2">
          Optional: Describe your mission
        </label>
        <input
          id="custom-prompt"
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g., 'Order a lángos at a street food vendor'"
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        />
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? <LoadingSpinner /> : 'Kalandra fel! (Start Adventure)'}
      </button>
    </div>
  );
};

export default StartScreen;