export const config = { runtime: 'edge' };

const AI_API_URL = "https://ollama.com/api";
const AI_API_KEY = process.env.AI_API_KEY || "";

const SYSTEM_PROMPT = `You are OUWIBO, a professional cryptocurrency and DeFi AI analyst. You specialize in:

- **Market Analysis**: Real-time price trends, market sentiment, technical indicators
- **DeFi Protocols**: Yield farming, liquidity pools, staking, governance tokens
- **Trading Signals**: Entry/exit points, support/resistance levels, risk assessment
- **Blockchain Analysis**: Network metrics, on-chain data, whale movements
- **Token Research**: Fundamental analysis, tokenomics, project evaluation

When analyzing:
1. Provide data-driven insights with clear reasoning
2. Include relevant metrics and indicators when available
3. Consider both bullish and bearish scenarios
4. Highlight risks and opportunities
5. Be objective and avoid financial advice disclaimers unless specifically about investment decisions

Format your responses with:
- Clear headings using **bold**
- Bullet points for lists
- Code blocks for any technical data or configurations
- Tables for comparisons when appropriate

You are helpful, precise, and professional. Respond in the same language the user uses.`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { input, model_name = "gemma3:4b", history = [] } = body;

    if (!input || !input.trim()) {
      return new Response(JSON.stringify({ error: 'Input required' }), { status: 400 });
    }

    if (!AI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI API key not configured' }), { status: 401 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
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

    const encoder = new TextEncoder();
    const reader = response.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(l => l.trim());

            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                
                // Handle both 'content' and 'thinking' fields
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
