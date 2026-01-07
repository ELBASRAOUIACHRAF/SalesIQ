import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  includeRealTimeData: boolean;
  dataFilters?: { startDate?: string; endDate?: string };
}

export interface ChatResponse {
  sessionId: string;
  response: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://localhost:8000/api/v1/chatbot';
  private sessionId: string;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);

  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.sessionId = this.generateId();
  }

  private generateId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  }

  sendMessage(message: string, includeData: boolean = false, filters?: any): Observable<ChatResponse> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    this.addMessage(userMessage);

    const request: ChatRequest = {
      sessionId: this.sessionId,
      message,
      includeRealTimeData: includeData,
      dataFilters: filters
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
  }

  addMessage(message: ChatMessage): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  addAssistantMessage(content: string): void {
    const msg: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    this.addMessage(msg);
  }

  resetChat(): void {
    this.sessionId = this.generateId();
    this.messagesSubject.next([]);
  }

  clearSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear-session`, { sessionId: this.sessionId });
  }
}
