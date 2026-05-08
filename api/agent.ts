export const config = { runtime: 'edge' };

const AI_API_URL = "https://ollama.com/api";
const AI_API_KEY = process.env.AI_API_KEY || "";

const SYSTEM_PROMPT = `You are OUWIBO, a professional AI crypto analyst with access to REAL-TIME market data.

You provide accurate, data-driven insights about:
- Cryptocurrency market analysis (BTC, ETH, SOL, major altcoins)
- DeFi protocols and yield farming strategies
- Trading signals and technical analysis
- Blockchain technology and tokenomics
- Market sentiment and on-chain metrics

CRITICAL RULES:
1. When asked about current prices, use the REAL-TIME DATA provided in the user context
2. NEVER make up prices or dates from your training data - it is OUTDATED
3. Always cite the actual numbers from the real-time data provided
4. Provide balanced analysis with both bullish and bearish scenarios
5. Remind users to DYOR before investment decisions
6. Respond in the same language the user uses

You are helpful, professional, and prioritize ACCURACY above all.`;

async function getMarketData(): Promise<string> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin,polkadot&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d'
    );
    if (!response.ok) return "";
    const data = await response.json();
    const coins = data.map((c: any) => 
      `${c.name} (${c.symbol.toUpperCase()}): $${c.current_price.toLocaleString()} | 24h: ${c.price_change_percentage_24h?.toFixed(2)}% | 7d: ${c.price_change_percentage_7d_in_currency?.toFixed(2)}%`
    ).join('\n');
    return `\n\n=== REAL-TIME MARKET DATA (Updated: ${new Date().toUTCString()}) ===\n${coins}\n=== END MARKET DATA ===\n\n`;
  } catch {
    return "";
  }
}

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

    // Fetch real-time market data
    const marketData = await getMarketData();
    const systemWithMarket = SYSTEM_PROMPT + marketData;

    const messages = [
      { role: "system", content: systemWithMarket },
      ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: input.trim() }
    ];

    const response = await fetch(AI_API_URL + "/chat", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + AI_API_KEY,
      },
      body: JSON.stringify({ model: model_name, messages, stream: true }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "AI error: " + response.status }), { status: response.status });
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
            const lines = chunk.split('\n').filter((l: string) => l.trim());
            
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: 'text', content: parsed.message.content }) + "\n\n"));
                }
                if (parsed.done) {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: 'done' }) + "\n\n"));
                }
              } catch {}
            }
          }
          controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: 'done' }) + "\n\n"));
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
