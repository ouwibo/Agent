// Executor Agent

import { PROMPTS } from '../core/config';
import type { AgentState, AgentStep } from '../core/orchestrator';

export type ExecuteResult = {
  success: boolean;
  result: string;
  tool_used: string | null;
};

export async function execute(
  step: string,
  state: AgentState,
  callLLM: (prompt: string) => Promise<string>,
  callTool: (tool: string, input: string) => Promise<string>
): Promise<ExecuteResult> {
  const prompt = `${PROMPTS.executor}

Step to Execute: ${step}

Current State:
${JSON.stringify(state, null, 2)}

Execute this step. If you need a tool, respond with:
{"tool": "tool_name", "input": "tool input"}
Otherwise respond with:
{"result": "your result"}`;

  const response = await callLLM(prompt);
  
  try {
    const parsed = JSON.parse(response);
    
    if (parsed.tool && typeof parsed.tool === 'string') {
      const toolResult = await callTool(parsed.tool, parsed.input || '');
      return {
        success: true,
        result: toolResult,
        tool_used: parsed.tool,
      };
    }
    
    return {
      success: true,
      result: parsed.result || response,
      tool_used: null,
    };
  } catch {
    return {
      success: true,
      result: response,
      tool_used: null,
    };
  }
}
