import React, { useState, useRef } from 'react';
import { WordBreakdown } from '../types';
import Tooltip from './Tooltip';
import { useSharedGameLogic } from '../context/GameLogicContext';

interface DialogueTextProps {
  text: string;
}

// Keep InteractiveWord as a simple presentational component
interface InteractiveWordProps {
  word: string;
  onMouseEnter: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseLeave: () => void;
  isLoading: boolean;
}

const InteractiveWord: React.FC<InteractiveWordProps> = ({ word, onMouseEnter, onMouseLeave, isLoading }) => {
  // Simple heuristic: don't make short words interactive.
  const hasPotentialSuffix = word.length > 4;

  if (!hasPotentialSuffix) {
    return <span>{word}</span>;
  }

  return (
    <span
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative cursor-pointer underline decoration-dotted decoration-amber-400/50 hover:decoration-amber-400 transition-colors ${isLoading ? 'animate-pulse bg-amber-400/20 rounded' : ''}`}
    >
      {word}
    </span>
  );
};

const DialogueText: React.FC<DialogueTextProps> = ({ text }) => {
  const words = text.split(/(\s+)/);
  const [activeWord, setActiveWord] = useState<{
    rect: DOMRect;
    breakdown: WordBreakdown;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { analyzeAndCacheWord, wordBreakdownCache } = useSharedGameLogic();
  const hoverTimeoutRef = useRef<number | null>(null);
  const currentWordRef = useRef<string | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    const target = event.currentTarget;
    const word = target.innerText;
    currentWordRef.current = word;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = window.setTimeout(async () => {
      // Ensure the mouse is still over the same word
      if (currentWordRef.current !== word) return;

      const cleanedWord = word.toLowerCase().replace(/[.,!?]/g, '');
      if (!cleanedWord) return;

      let breakdown = wordBreakdownCache.get(cleanedWord);

      if (!breakdown) {
        setIsLoading(true);
        breakdown = await analyzeAndCacheWord(cleanedWord);
        setIsLoading(false);
      }

      // Only show tooltip if there are suffixes and the mouse is still over the word
      if (currentWordRef.current === word && breakdown && breakdown.suffixes.length > 0) {
        setActiveWord({
          rect: target.getBoundingClientRect(),
          breakdown: breakdown,
        });
      }
    }, 200); // A small delay to prevent tooltips from flashing while moving the mouse
  };

  const handleMouseLeave = () => {
    currentWordRef.current = null;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveWord(null);
  };

  return (
    <>
      <span>
        {words.map((word, index) =>
          word.trim() === '' ? (
            <span key={index}>{word}</span>
          ) : (
            <InteractiveWord
              key={index}
              word={word}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isLoading={isLoading && currentWordRef.current === word}
            />
          )
        )}
      </span>
      {activeWord && (
        <Tooltip breakdown={activeWord.breakdown} targetRect={activeWord.rect} />
      )}
    </>
  );
};

export default DialogueText;