import { useState, useCallback, useMemo } from 'react';
import { GameState, Mission, Scene, Difficulty, EncounteredWord, WordBreakdown } from '../types';
import { generateMissionScene, generateImage, breakdownWord } from '../services/geminiService';

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Start);
    const [mission, setMission] = useState<Mission | null>(null);
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [wordBreakdownCache, setWordBreakdownCache] = useState<Map<string, WordBreakdown>>(new Map());

    const encounteredWords = useMemo(() => {
        if (!mission) return [];
        const wordMap = new Map<string, EncounteredWord>();

        mission.scenes.forEach(scene => {
            const textsToParse: string[] = [];
            if (scene.dialogue?.hungarian) {
                textsToParse.push(scene.dialogue.hungarian);
            }
            if (scene.options) {
                textsToParse.push(...scene.options.map(o => o.hungarian));
            }
            const textToParse = textsToParse.join(' ');

            const words: string[] = textToParse.match(/\b(\w+)\b/g) || [];
            words.forEach(word => {
                const cleanedWord = word.toLowerCase();
                const breakdown = wordBreakdownCache.get(cleanedWord);
                if (breakdown && (breakdown.suffixes.length > 0)) {
                    if (wordMap.has(cleanedWord)) {
                        wordMap.get(cleanedWord)!.count++;
                    } else {
                        wordMap.set(cleanedWord, { word: cleanedWord, breakdown, count: 1 });
                    }
                }
            });
        });
        return Array.from(wordMap.values());
    }, [mission, wordBreakdownCache]);

    const fetchAndSetScene = useCallback(async (difficulty: Difficulty, history: Scene[], customPrompt?: string, userResponse?: string) => {
        setError(null);
        setGameState(GameState.Loading);
        try {
            const scene = await generateMissionScene(difficulty, history, customPrompt, userResponse);
            
            // Shuffle options to make the wild card unpredictable
            if (scene.options) {
                scene.options = shuffleArray(scene.options);
            }

            setCurrentScene({ ...scene, imageUrl: `https://picsum.photos/seed/${scene.imagePrompt.slice(0,10)}/1280/720` }); // Placeholder while image loads
            setMission(prev => prev ? { ...prev, scenes: [...history, scene] } : { title: customPrompt || "A Day in Budapest", difficulty, scenes: [scene] });
            setGameState(GameState.Playing);

            const imageUrl = await generateImage(scene.imagePrompt);
            
            const finalScene = { ...scene, imageUrl };

            setCurrentScene(prev => prev ? { ...prev, imageUrl } : null);
            setMission(prev => {
                if (!prev) return null;
                const newScenes = [...prev.scenes];
                newScenes[newScenes.length - 1] = finalScene;
                return { ...prev, scenes: newScenes };
            });

        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
            setGameState(GameState.Start);
        }
    }, []);

    const startGame = useCallback(async (difficulty: Difficulty, customPrompt?: string) => {
        const newMission: Mission = { title: customPrompt || "A Day in Budapest", difficulty, scenes: [] };
        setMission(newMission);
        await fetchAndSetScene(difficulty, [], customPrompt);
    }, [fetchAndSetScene]);

    const selectOption = useCallback(async (optionIndex: number, textInput?: string) => {
        if (!mission || !currentScene) return;

        let userResponse: string;
        if (mission.difficulty === Difficulty.ErosPista) {
            userResponse = textInput || "No response.";
        } else {
            userResponse = currentScene.options?.[optionIndex]?.hungarian || "No option selected";
        }
        
        if (currentScene.turn >= 5) {
             setGameState(GameState.Finished);
             return;
        }

        await fetchAndSetScene(mission.difficulty, mission.scenes, mission.title, userResponse);
    }, [mission, currentScene, fetchAndSetScene]);
    
    const analyzeAndCacheWord = useCallback(async (word: string): Promise<WordBreakdown> => {
        const cleanedWord = word.toLowerCase().replace(/[.,!?]/g, '');
        if (wordBreakdownCache.has(cleanedWord)) {
            return wordBreakdownCache.get(cleanedWord)!;
        }
        const breakdown = await breakdownWord(cleanedWord);
        setWordBreakdownCache(prev => new Map(prev).set(cleanedWord, breakdown));
        return breakdown;
    }, [wordBreakdownCache]);


    const resetGame = useCallback(() => {
        setGameState(GameState.Start);
        setMission(null);
        setCurrentScene(null);
        setError(null);
        setWordBreakdownCache(new Map());
    }, []);

    return {
        gameState,
        mission,
        currentScene,
        loading: gameState === GameState.Loading,
        error,
        startGame,
        selectOption,
        resetGame,
        analyzeAndCacheWord,
        wordBreakdownCache,
        encounteredWords
    };
};