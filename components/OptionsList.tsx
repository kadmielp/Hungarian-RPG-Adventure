
import React, { useState } from 'react';
import { Scene, Difficulty } from '../types';
import DialogueText from './DialogueText';

interface OptionsListProps {
  scene: Scene;
  difficulty: Difficulty;
  onSelectOption: (optionIndex: number, text?: string) => void;
  disabled: boolean;
}

const OptionsList: React.FC<OptionsListProps> = ({ scene, difficulty, onSelectOption, disabled }) => {
  const [textInput, setTextInput] = useState('');

  if (difficulty === Difficulty.ErosPista) {
    const handleSend = () => {
      onSelectOption(-1, textInput);
      setTextInput(''); // Clear input after sending
    };

    return (
      <div>
        <label htmlFor="free-text-input" className="block mb-2 font-medium text-amber-300">{scene.question}</label>
        <textarea
          id="free-text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Válaszolj magyarul..."
          disabled={disabled}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !textInput}
          className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          Elküld (Send)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scene.options?.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelectOption(index)}
          disabled={disabled}
          className="w-full text-left p-3 bg-slate-700/80 hover:bg-slate-700 rounded-lg border border-slate-600 hover:border-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="font-medium text-white group-hover:text-amber-300">
            <DialogueText text={option.hungarian} />
          </div>
          {difficulty === Difficulty.Novice && option.english && (
            <p className="text-sm text-slate-400 italic mt-1">"{option.english}"</p>
          )}
        </button>
      ))}
    </div>
  );
};

export default OptionsList;
