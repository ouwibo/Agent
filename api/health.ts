let requestCount = 0;

export default function handler(req: any, res: any) {
  requestCount += 1;

  const serverKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    requestsHandled: requestCount,
    serverKeys,
    availableProviders: Object.entries(serverKeys)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name),
  });
}
