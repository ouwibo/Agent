// Long-term Memory (Persistent KV-based)

export type LongTermMemory = {
  userId: string;
  preferences: Record<string, string>;
  history: Array<{
    timestamp: number;
    query: string;
    result: string;
  }>;
};

export async function loadLongTermMemory(kv: KVNamespace, userId: string): Promise<LongTermMemory> {
  const key = `ltm:${userId}`;
  const raw = await kv.get(key);
  
  if (!raw) {
    return {
      userId,
      preferences: {},
      history: [],
    };
  }
  
  try {
    return JSON.parse(raw) as LongTermMemory;
  } catch {
    return {
      userId,
      preferences: {},
      history: [],
    };
  }
}

export async function saveLongTermMemory(kv: KVNamespace, memory: LongTermMemory): Promise<void> {
  const key = `ltm:${memory.userId}`;
  await kv.put(key, JSON.stringify(memory), {
    expirationTtl: 60 * 60 * 24 * 365, // 1 year
  });
}

export function addHistoryEntry(memory: LongTermMemory, query: string, result: string): LongTermMemory {
  return {
    ...memory,
    history: [...memory.history, {
      timestamp: Date.now(),
      query,
      result,
    }].slice(-100), // Keep last 100 entries
  };
}

export function setPreference(memory: LongTermMemory, key: string, value: string): LongTermMemory {
  return {
    ...memory,
    preferences: { ...memory.preferences, [key]: value },
  };
}

export function getPreference(memory: LongTermMemory, key: string): string | null {
  return memory.preferences[key] || null;
}
