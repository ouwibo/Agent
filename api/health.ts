let requestCount = 0

export default function handler(req: any, res: any) {
  requestCount += 1
  const serverKeys = {
    ai: !!process.env.ZO_API_KEY,
  }
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    requestsHandled: requestCount,
    serverKeys,
    availableProviders: serverKeys.ai ? ['ai'] : [],
    defaultModel: 'zo:openai/gpt-5.4-mini',
  })
}
