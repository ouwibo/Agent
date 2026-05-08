export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    serverKeys: { ai: !!process.env.AI_API_KEY },
    defaultModel: "gemma3:4b",
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
