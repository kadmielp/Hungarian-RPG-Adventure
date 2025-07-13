import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Scene, Difficulty, WordBreakdown } from '../types';
import { AI_MODELS } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sceneSchema = {
    type: Type.OBJECT,
    properties: {
        turn: { type: Type.INTEGER, description: "The current turn number, starting from 1." },
        narration: { type: Type.STRING, description: "The scene's narration. In English unless difficulty is Advanced or higher." },
        imagePrompt: { type: Type.STRING, description: "A highly detailed, photorealistic, vibrant visual prompt for an image generator. E.g., 'A young tourist at a bustling Budapest metro station ticket machine, looking slightly confused, high-resolution photography.'" },
        dialogue: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING, description: "The character speaking (e.g., 'Barista', 'Ticket Inspector')." },
                hungarian: { type: Type.STRING, description: "The dialogue in Hungarian." },
                english: { type: Type.STRING, description: "The English translation of the dialogue. ONLY for Novice difficulty." },
            },
        },
        options: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hungarian: { type: Type.STRING, description: "An option for the player to choose, in Hungarian." },
                    english: { type: Type.STRING, description: "The English translation of the option. ONLY for Novice difficulty." },
                },
            },
        },
        question: { type: Type.STRING, description: "A question for the player to answer in free text. ONLY for Erős Pista difficulty." },
        feedback: {type: Type.STRING, description: "On turn 2+, provide feedback on the player's previous answer. Praise correct choices, gently correct mistakes. Omit for turn 1."},
        feedbackType: { type: Type.STRING, enum: ['positive', 'negative'], description: "On turn 2+, classify the feedback. 'positive' for good choices, 'negative' for wild card choices or mistakes. Omit for turn 1."}
    },
    required: ["turn", "narration", "imagePrompt"],
};


const getSystemInstruction = (difficulty: Difficulty, customPrompt?: string): string => {
    let baseInstruction = `You are a game master for a Hungarian language learning RPG. Create an engaging, short adventure (5-7 turns) based on a modern, real-life scenario. The user is the hero, likely a tourist.
    - The story should be coherent and progress with each turn.
    - Generate one scene at a time.
    - Unless it is 'Erős Pista' difficulty, provide exactly 4 distinct options. Three should be relevant to the scene. The fourth option should be an unhelpful, awkward, or embarrassing choice that leads to a humorous but mildly negative outcome.
    - When providing feedback on a player's choice, you MUST set the 'feedbackType'. Use 'negative' for the wild card choice or mistakes, and 'positive' for good choices.
    - The theme is a modern-day scenario in Hungary (e.g., ordering food, buying a ticket, asking for directions).
    - For all Hungarian text, use common words that might have suffixes.
    - Custom user mission: ${customPrompt || 'A standard adventure to order a coffee and cake at a café.'}.`

    switch (difficulty) {
        case Difficulty.Novice:
            return baseInstruction + "\n- Difficulty: Novice. Narration is in English. Dialogue and options are in Hungarian WITH English translations.";
        case Difficulty.Intermediate:
            return baseInstruction + "\n- Difficulty: Intermediate. Narration is in English. Dialogue and options are in Hungarian. No translations.";
        case Difficulty.Superior:
            return baseInstruction + "\n- Difficulty: Superior. Narration is in English. Dialogue and options are in Hungarian. No translations.";
        case Difficulty.Advanced:
            return baseInstruction + "\n- Difficulty: Advanced. ALL text (narration, dialogue, options) is in Hungarian. No translations.";
        case Difficulty.ErosPista:
            return baseInstruction + "\n- Difficulty: Erős Pista. ALL text is in Hungarian. Instead of options, provide a 'question' for the user to answer in free text.";
    }
    return baseInstruction;
}


export const generateMissionScene = async (difficulty: Difficulty, history: Scene[], customPrompt?: string, userResponse?: string): Promise<Scene> => {
    const systemInstruction = getSystemInstruction(difficulty, customPrompt);
    const turn = history.length + 1;
    const prompt = `This is turn ${turn}. The story so far:\n${history.map(s => s.narration).join('\n')}\nPlayer's last action: ${userResponse || 'Starting the adventure.'}\nGenerate the next scene.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: AI_MODELS.TEXT,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: sceneSchema,
            },
        });
        
        let jsonStr = response.text.trim();
        const scene = JSON.parse(jsonStr) as Scene;
        
        // Ensure the scene object has the imageUrl property to be populated later
        scene.imageUrl = '';

        return scene;
    } catch (e) {
        console.error("Error generating mission scene:", e);
        throw new Error("Failed to generate the next part of the story. Please try again.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: AI_MODELS.IMAGE,
            prompt: `${prompt}, photorealistic, modern, vibrant, high-resolution photography`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (e) {
        console.error("Error generating image:", e);
        // Return a placeholder on error
        return `https://picsum.photos/seed/${prompt.replace(/\s/g,'')}/1280/720`;
    }
};

const wordBreakdownSchema = {
    type: Type.OBJECT,
    properties: {
        root: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                meaning: { type: Type.STRING, description: "English meaning of the root word." }
            },
            required: ["text", "meaning"]
        },
        suffixes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The suffix itself, including the dash (e.g., '-ban')." },
                    meaning: { type: Type.STRING, description: "The grammatical name of the suffix (e.g., 'Inessive case')." },
                    function: { type: Type.STRING, description: "A simple explanation of what the suffix does (e.g., 'Indicates location \\'in\\' something')." }
                },
                required: ["text", "meaning", "function"]
            }
        }
    }
};


export const breakdownWord = async (word: string): Promise<WordBreakdown> => {
    const systemInstruction = "You are a Hungarian linguistics expert. Your job is to break down a Hungarian word into its root and suffixes for an English-speaking learner.";
    const prompt = `Analyze the Hungarian word "${word}". Identify its root and all its suffixes. Provide the English meaning for the root, and the name and function for each suffix. If the word has no suffixes, return the root and an empty suffixes array.`;

    try {
        const response = await ai.models.generateContent({
            model: AI_MODELS.TEXT,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: wordBreakdownSchema
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as WordBreakdown;
    } catch (e) {
        console.error(`Error breaking down word "${word}":`, e);
        // Fallback for simple words or errors
        return {
            root: { text: word, meaning: 'Could not analyze word.' },
            suffixes: [],
        };
    }
}