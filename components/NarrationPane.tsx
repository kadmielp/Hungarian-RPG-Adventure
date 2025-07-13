
import React from 'react';
import { Scene, Difficulty } from '../types';
import DialogueText from './DialogueText';

interface NarrationPaneProps {
  scene: Scene;
  difficulty: Difficulty;
}

const NarrationPane: React.FC<NarrationPaneProps> = ({ scene, difficulty }) => {
  const isNegativeFeedback = scene.feedbackType === 'negative';

  const feedbackContainerClasses = isNegativeFeedback
    ? 'bg-red-500/10 border border-red-500/30 p-3 rounded-lg'
    : 'bg-green-500/10 border border-green-500/30 p-3 rounded-lg';

  const feedbackTextClasses = isNegativeFeedback
    ? 'text-red-300 italic'
    : 'text-green-300 italic';

  return (
    <div className="space-y-4">
      {scene.feedback && (
        <div className={feedbackContainerClasses}>
          <p className={feedbackTextClasses}>{scene.feedback}</p>
        </div>
      )}
      <div className="text-slate-300 leading-relaxed italic">
        <p>{scene.narration}</p>
      </div>

      {scene.dialogue && (
        <div className="border-l-4 border-amber-400 pl-4 py-2">
          <p className="font-bold text-amber-300 text-lg">{scene.dialogue.speaker}:</p>
          <div className="text-xl text-white my-2">
            <DialogueText text={scene.dialogue.hungarian} />
          </div>
          {difficulty === Difficulty.Novice && scene.dialogue.english && (
            <p className="text-sm text-slate-400 italic">"{scene.dialogue.english}"</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NarrationPane;