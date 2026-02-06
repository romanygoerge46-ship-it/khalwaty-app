import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDailySpiritualMessage(userStreak: number): Promise<string> {
  try {
    const prompt = `
      You are an expert in Coptic Orthodox Patristics (Aqwal Abaa).
      Generate a short, deep quote or saying from one of the Desert Fathers or Church Fathers (like St. Anthony, St. Macarius, St. Athanasius, Pope Kyrillos VI).
      The text must be in Arabic.
      It should be comforting, spiritual, and relevant to daily life.
      Just provide the quote and the name of the saint.
      Max 40 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "الصلاة هي مفتاح السماء. - البابا كيرلس السادس";
  } catch (error) {
    console.error("Error generating message:", error);
    return "لا تكن قليل الإيمان بل مؤمناً.";
  }
}