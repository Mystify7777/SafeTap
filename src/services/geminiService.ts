/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { EmergencyAnalysis, EmergencyCategory, UrgencyLevel, NextStep } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const SYSTEM_INSTRUCTION = `You are the SafeTap Emergency Intelligence Engine, a core component of a real-time emergency response PWA for hotels and venues. Your task is to analyze user-submitted text or voice transcriptions to provide rapid, safe, and structured classification for staff and immediate safety guidance for users.

OBJECTIVE:
Process the input string and return a strictly formatted JSON object. Prioritize conservative safety, speed, and clarity.

OPERATIONAL RULES:
1. SAFETY FIRST: Never provide specific medical diagnoses or treatment instructions (e.g., do not say "perform CPR" or "give aspirin"). Use generic advice like "Wait for trained responders" or "Stay calm and still."
2. AMBIGUITY: If the text is vague (e.g., "help"), classify as "Other/Unclear" with "Medium" urgency and "Low" confidence.
3. PRANKS/NONSENSE: If input contains emojis used jokingly or slang suggesting a prank (e.g., "lol", "🔥😂"), mark as "Other/Unclear", set confidence below 0.4, and flag the reason as "Suspected non-serious input."
4. HIGH-RISK TRIGGERS: If keywords like "gun," "knife," "fire," or "can't breathe" are detected, urgency MUST be "High." 
5. NO MARKDOWN: Return ONLY the raw JSON string.`;

export async function analyzeEmergency(userInput: string): Promise<EmergencyAnalysis> {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userInput,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: Object.values(EmergencyCategory),
            description: "The primary category of the emergency.",
          },
          urgency: {
            type: Type.STRING,
            enum: Object.values(UrgencyLevel),
            description: "The urgency level of the situation.",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence in the classification (0.0 to 1.0).",
          },
          reason: {
            type: Type.STRING,
            description: "Concise logic for the classification.",
          },
          immediate_action: {
            type: Type.STRING,
            description: "1-2 sentence safe, generic instruction.",
          },
          recommended_next_step: {
            type: Type.STRING,
            enum: Object.values(NextStep),
            description: "Recommended immediate next step for the user.",
          },
        },
        required: ["category", "urgency", "confidence", "reason", "immediate_action", "recommended_next_step"],
      },
    },
  });

  const result = response.text;
  if (!result) {
    throw new Error("No response from AI engine.");
  }

  return JSON.parse(result) as EmergencyAnalysis;
}
