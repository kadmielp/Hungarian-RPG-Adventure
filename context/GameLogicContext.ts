
import React, { createContext, useContext } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

export type GameLogicContextType = ReturnType<typeof useGameLogic>;

export const GameLogicContext = createContext<GameLogicContextType | null>(null);

export const useSharedGameLogic = (): GameLogicContextType => {
    const context = useContext(GameLogicContext);
    if (!context) {
        throw new Error('useSharedGameLogic must be used within a GameLogicProvider');
    }
    return context;
};
