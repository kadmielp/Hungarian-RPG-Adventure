import React, { useCallback } from 'react';
import { GameState, Difficulty } from './types';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import RecapModal from './components/RecapModal';
import { useGameLogic } from './hooks/useGameLogic';
import { GameLogicContext } from './context/GameLogicContext';

const App: React.FC = () => {
  const gameLogic = useGameLogic();
  const { 
    gameState, 
    mission, 
    currentScene, 
    loading, 
    error, 
    startGame, 
    selectOption,
    resetGame,
    encounteredWords,
  } = gameLogic;

  const handleStartGame = useCallback((difficulty: Difficulty, customPrompt?: string) => {
    startGame(difficulty, customPrompt);
  }, [startGame]);
  
  const handleEndGame = () => {
    // Logic to show recap modal is handled inside this component
  };

  const renderContent = () => {
    if (gameState === GameState.Finished && mission && currentScene) {
      return (
        <RecapModal 
          mission={mission} 
          encounteredWords={encounteredWords}
          onClose={resetGame} 
        />
      );
    }

    if ((gameState === GameState.Playing || gameState === GameState.Loading) && mission && currentScene) {
      return (
        <GameScreen 
          mission={mission} 
          scene={currentScene} 
          onSelectOption={selectOption}
          loading={gameState === GameState.Loading}
          error={error}
        />
      );
    }
    
    return <StartScreen onStart={handleStartGame} loading={loading} error={error} />;
  };

  return (
    <GameLogicContext.Provider value={gameLogic}>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center justify-center p-4">
        <header className="w-full max-w-5xl text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black text-amber-300 tracking-wider">Hungarian RPG Adventure</h1>
          <p className="text-slate-400 mt-2">Kalandra fel! (To adventure!)</p>
        </header>
        <main className="w-full max-w-5xl flex-grow">
          {renderContent()}
        </main>
        <footer className="w-full max-w-5xl text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Gemini & Imagen. Created for immersive language learning.</p>
          {gameState !== GameState.Start && <button onClick={resetGame} className="mt-2 text-amber-400 hover:text-amber-300 transition-colors">Restart Game</button>}
        </footer>
      </div>
    </GameLogicContext.Provider>
  );
};

export default App;