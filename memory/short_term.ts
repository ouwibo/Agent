// Short-term Memory (Session-based)

export type ShortTermMemory = {
  sessionId: string;
  context: string[];
  createdAt: number;
  updatedAt: number;
};

export function createShortTermMemory(sessionId: string): ShortTermMemory {
  return {
    sessionId,
    context: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addToMemory(memory: ShortTermMemory, item: string): ShortTermMemory {
  return {
    ...memory,
    context: [...memory.context, item].slice(-20), // Keep last 20 items
    updatedAt: Date.now(),
  };
}

export function getRecentContext(memory: ShortTermMemory, limit = 5): string[] {
  return memory.context.slice(-limit);
}

export function summarizeContext(memory: ShortTermMemory): string {
  return memory.context.join('\n');
}
