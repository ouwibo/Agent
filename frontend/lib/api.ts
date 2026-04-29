const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

export interface ChatResponse {
  ok?: boolean;
  answer?: string;
  reply?: string;
  model?: string;
  error?: string;
}

export async function chat(message: string, model?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model }),
  });
  return res.json();
}

export async function getModels() {
  const res = await fetch(`${API_URL}/api/models`);
  return res.json();
}
