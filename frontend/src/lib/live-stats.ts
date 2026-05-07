type HealthResponse = {
  ok: boolean;
  uptimeSec?: number;
  requestsHandled?: number;
  serverKeys?: {
    ai?: boolean;
  };
  availableProviders?: string[];
  defaultModel?: string;
};

export async function fetchLiveStats() {
  const response = await fetch("/api/health", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }

  const data = (await response.json()) as HealthResponse;

  return {
    ok: !!data.ok,
    uptimeSec: data.uptimeSec ?? 0,
    requestsHandled: data.requestsHandled ?? 0,
    serverKeys: {
      ai: !!data.serverKeys?.ai,
    },
    availableProviders: data.availableProviders ?? (data.serverKeys?.ai ? ["ai"] : []),
    defaultModel: data.defaultModel ?? "GPT-5.4 mini",
  };
}
