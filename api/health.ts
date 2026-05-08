export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const apiKey = globalThis.process?.env?.AI_API_KEY || "";
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    serverKeys: { ai: !!apiKey },
    defaultModel: "gemma3:4b",
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
