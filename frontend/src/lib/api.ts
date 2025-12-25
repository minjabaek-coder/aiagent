const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Article {
  id: number;
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  imageUrl?: string;
  author?: string;
  magazineId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Magazine {
  id: number;
  issue: number;
  title: string;
  coverImage?: string;
  publishedAt: string;
  articles?: Article[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function fetchArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_URL}/articles`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function fetchArticle(id: number): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/articles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function fetchMagazines(): Promise<Magazine[]> {
  try {
    const res = await fetch(`${API_URL}/magazines`);
    if (!res.ok) throw new Error('Failed to fetch magazines');
    return res.json();
  } catch (error) {
    console.error('Error fetching magazines:', error);
    return [];
  }
}

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<{ sessionId: string; message: string }> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function sendChatMessageStream(
  sessionId: string,
  message: string,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!res.ok) {
    onError('Failed to send message');
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response body');
    return;
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'delta') {
            onDelta(data.content);
          } else if (data.type === 'done') {
            onDone();
          } else if (data.type === 'error') {
            onError(data.message);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
