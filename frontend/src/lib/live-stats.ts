export async function fetchLiveStats() {
  const res = await fetch('/api/health', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json() as Promise<{
    ok: boolean;
    uptimeSec?: number;
    requestsHandled?: number;
    serverKeys?: Record<string, boolean>;
    availableProviders?: string[];
  }>;
}
