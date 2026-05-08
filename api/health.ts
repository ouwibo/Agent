export const config = { runtime: 'edge' };

const AI_API_KEY = process.env.AI_API_KEY || "";

export default async function handler(req: Request) {
  const hasKey = !!AI_API_KEY;
  
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    serverKeys: { ai: hasKey },
    defaultModel: "gemma3:4b",
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
