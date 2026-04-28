// Orchestrator - Agent Flow Controller

import { AGENT_CONFIG, PROMPTS } from './config';

export type AgentStep = {
  thought: string;
  plan: string[];
  action: string;
  tool: string | null;
  input: string | null;
  result: string | null;
  final_answer: string | null;
};

export type AgentState = {
  steps: AgentStep[];
  currentStep: number;
  memory: string[];
  status: 'planning' | 'executing' | 'reflecting' | 'complete' | 'error';
};

export function createInitialState(): AgentState {
  return {
    steps: [],
    currentStep: 0,
    memory: [],
    status: 'planning',
  };
}

export function addMemory(state: AgentState, context: string): AgentState {
  return {
    ...state,
    memory: [...state.memory, context].slice(-10),
  };
}

export function addStep(state: AgentState, step: AgentStep): AgentState {
  return {
    ...state,
    steps: [...state.steps, step],
    currentStep: state.currentStep + 1,
  };
}

export function setStatus(state: AgentState, status: AgentState['status']): AgentState {
  return { ...state, status };
}

export function isComplete(state: AgentState): boolean {
  return state.status === 'complete' || state.currentStep >= AGENT_CONFIG.maxSteps;
}

export function getLatestResult(state: AgentState): string | null {
  const lastStep = state.steps[state.steps.length - 1];
  return lastStep?.final_answer || lastStep?.result || null;
}

export function formatForLLM(state: AgentState): string {
  const history = state.steps
    .map((s, i) => `Step ${i + 1}: ${s.action}\nResult: ${s.result || 'pending'}`)
    .join('\n\n');
  
  const memory = state.memory.join('\n');
  
  return `Current State: ${state.status}
Step: ${state.currentStep}/${AGENT_CONFIG.maxSteps}

Memory:
${memory || 'None'}

History:
${history || 'None'}`;
}
