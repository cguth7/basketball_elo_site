import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Player, GamePrediction } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const predictMatch = async (
  teamA: Player[],
  teamB: Player[]
): Promise<GamePrediction | null> => {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `
    Analyze this basketball matchup.
    Team A: ${teamA.map(p => `${p.name} (ELO: ${p.elo}, W/L: ${p.wins}/${p.losses})`).join(', ')}.
    Team B: ${teamB.map(p => `${p.name} (ELO: ${p.elo}, W/L: ${p.wins}/${p.losses})`).join(', ')}.
    
    Predict who is most likely to win based on the stats. Provide a win probability (0-100) for the favored team and a short fun "trash talk" style reasoning.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            favoredTeam: { type: Type.STRING, enum: ["A", "B"] },
            winProbability: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["favoredTeam", "winProbability", "reasoning"],
        } as Schema,
      },
    });

    const json = response.text ? JSON.parse(response.text) : null;
    return json as GamePrediction;
  } catch (error) {
    console.error("Prediction failed", error);
    return null;
  }
};

export const generateGameSummary = async (
  teamA: Player[],
  teamB: Player[],
  scoreA: number,
  scoreB: number,
  winner: 'A' | 'B'
): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  const winningTeam = winner === 'A' ? 'Team A' : 'Team B';
  const prompt = `
    Write a 2-sentence high-energy sportscaster summary for this game.
    ${winningTeam} won ${winner === 'A' ? scoreA : scoreB} to ${winner === 'A' ? scoreB : scoreA}.
    
    Team A Roster: ${teamA.map(p => p.name).join(', ')}.
    Team B Roster: ${teamB.map(p => p.name).join(', ')}.
    
    Make it sound like a streetball highlight reel.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Summary generation failed", error);
    return null;
  }
};