import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not properly configured in .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format the conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: "System Instruction: You are CoachMind, an elite AI sports performance coach for the PlayMind AI platform. Your goal is to answer user questions about sports biomechanics, techniques, and how the PlayMind dashboard works. Always be extremely encouraging, use precise professional sports terminology, and remind the user that the PlayMind Vision Engine maps their skeletal posture frame-by-frame. Limit your responses to 2-4 concise, punchy sentences. Keep it highly relevant to their specific sport or question." }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I am CoachMind, your AI performance engine. I'm ready to break down your biomechanics and elevate your game." }]
      },
      ...messages.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    return NextResponse.json({ reply: response.text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: "Failed to generate response from CoachMind AI." },
      { status: 500 }
    );
  }
}
Pressing key...Stopping...

Stop Agent
