export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Model {
  id: string;
  label: string;
  description?: string;
}

export interface ChatState {
  messages: Message[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
}
