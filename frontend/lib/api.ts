import axios, { AxiosInstance } from "axios";
import { ChatRequest, ChatResponse, ApiError } from "@/types";

class AgentAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "https://ouwibo-agent.ouwibo.workers.dev") {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>("/api/chat", request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          error: error.response?.data?.error || error.message,
          status: error.response?.status || 500,
        } as ApiError;
      }
      throw error;
    }
  }

  async health(): Promise<{ status: string }> {
    try {
      const response = await this.client.get("/health");
      return response.data;
    } catch (error) {
      throw new Error("Health check failed");
    }
  }
}

export const agentAPI = new AgentAPI();
