// Planner Agent

import { AGENT_CONFIG, PROMPTS } from '../core/config';
import type { AgentState, AgentStep } from '../core/orchestrator';

export type PlanResult = {
  goal: string;
  steps: string[];
  required_tools: string[];
};

export async function plan(input: string, state: AgentState, callLLM: (prompt: string) => Promise<string>): Promise<PlanResult> {
  const prompt = `${PROMPTS.planner}

User Request: ${input}

Current State:
${JSON.stringify(state, null, 2)}

Return JSON with goal, steps[], required_tools[]`;

  const response = await callLLM(prompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      goal: parsed.goal || input,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [input],
      required_tools: Array.isArray(parsed.required_tools) ? parsed.required_tools : [],
    };
  } catch {
    return {
      goal: input,
      steps: [input],
      required_tools: [],
    };
  }
}
