import React from 'react';
import { Mission, Scene } from '../types';
import SceneImage from './SceneImage';
import NarrationPane from './NarrationPane';
import OptionsList from './OptionsList';
import LoadingSpinner from './LoadingSpinner';

interface GameScreenProps {
  mission: Mission;
  scene: Scene;
  onSelectOption: (optionIndex: number, textInput?: string) => void;
  loading: boolean;
  error: string | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ mission, scene, onSelectOption, loading, error }) => {
  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
      <SceneImage imageUrl={scene.imageUrl || ''} prompt={scene.imagePrompt} loading={!scene.imageUrl} />
      
      <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg shadow-lg flex flex-col justify-between flex-1 min-h-0">
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading && !scene.narration && (
            <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Forging your destiny...</p>
            </div>
        )}
        {scene.narration && (
            <>
                <div className="flex-grow overflow-y-auto pr-2">
                    <NarrationPane scene={scene} difficulty={mission.difficulty} />
                </div>
                <div className="mt-4 flex-shrink-0">
                    <OptionsList
                        scene={scene}
                        difficulty={mission.difficulty}
                        onSelectOption={onSelectOption}
                        disabled={loading}
                    />
                </div>
                 {loading && <div className="mt-4 flex items-center justify-center text-slate-400"><LoadingSpinner size="sm" /> <span className="ml-2">Awaiting next chapter...</span></div>}
            </>
        )}
      </div>
    </div>
  );
};

export default GameScreen;