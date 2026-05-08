export const config = { runtime: 'edge' };

const AI_API_URL = "https://ollama.com/api";
const AI_API_KEY = process.env.AI_API_KEY || "";

const SYSTEM_PROMPT = `You are OUWIBO, an autonomous AI agent. You help users with:
- Coding and programming tasks
- Research and analysis
- Problem solving and planning
- Technical explanations

Be concise, accurate, and helpful. Use markdown formatting for code blocks and structured responses.
Always respond in the same language the user uses.

When showing code, use proper markdown code blocks with language specification.`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { input, model_name = "gemma3:4b", history = [] } = body;

    if (!input || !input.trim()) {
      return new Response(JSON.stringify({ error: 'Input is required' }), { status: 400 });
    }

    if (!AI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI API key not configured' }), { status: 401 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      { role: "user", content: input.trim() }
    ];

    const response = await fetch(`${AI_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({ model: model_name, messages, stream: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `AI error: ${response.status}` }), { status: response.status });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: 'No response body' }), { status: 500 });
    }

    const encoder = new TextEncoder();
    const reader = response.body.getReader();
    
    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((l: string) => l.trim());
            
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                // Only use 'content', ignore 'thinking' (internal reasoning)
                const content = parsed.message?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content })}\n\n`));
                }
                if (parsed.done) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                }
              } catch {}
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
