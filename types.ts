export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}

export interface Message {
  role: Role;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  groundingChunks?: GroundingChunk[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatHistory {
  activeChatId: string | null;
  sessions: Record<string, ChatSession>;
}
