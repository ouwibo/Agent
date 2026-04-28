// Reflection Agent

import { PROMPTS } from '../core/config';
import type { AgentState } from '../core/orchestrator';

export type ReflectionResult = {
  correct: boolean;
  improvement: string | null;
  final_answer: string;
};

export async function reflect(
  result: string,
  originalGoal: string,
  state: AgentState,
  callLLM: (prompt: string) => Promise<string>
): Promise<ReflectionResult> {
  const prompt = `${PROMPTS.reflection}

Original Goal: ${originalGoal}

Result to Evaluate:
${result}

Is this correct and complete? If not, provide improvements.
Respond with JSON:
{
  "correct": true/false,
  "improvement": "fix if needed or null",
  "final_answer": "final response"
}`;

  const response = await callLLM(prompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      correct: parsed.correct ?? true,
      improvement: parsed.improvement || null,
      final_answer: parsed.final_answer || result,
    };
  } catch {
    return {
      correct: true,
      improvement: null,
      final_answer: result,
    };
  }
}
