import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  sessionId: string;
  response: string;
}

@Component({
  selector: 'app-analytics-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-chatbot.html',
  styleUrls: ['./analytics-chatbot.css']
})
export class AnalyticsChatbot implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private apiUrl = 'http://localhost:8000/api/v1/chatbot';
  private sessionId: string;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isLoading = false;
  includeRealTimeData = true;

  // Questions rapides orientées analyse
  quickQuestions = [
    '📊 Résumé des KPIs',
    '📈 Tendance des ventes',
    '🏆 Top 10 produits',
    '⚠️ Produits en rupture de stock',
    '👥 Analyse des clients',
    '📁 Performance par catégorie',
    '💡 Recommandations business'
  ];

  // Suggestions contextuelles pour l'analyste
  analyticsSuggestions = [
    { icon: '📊', label: 'KPIs', query: 'Donne-moi tous les KPIs importants' },
    { icon: '📈', label: 'Croissance', query: 'Quelle est la croissance des ventes ce mois?' },
    { icon: '🎯', label: 'Objectifs', query: 'Sommes-nous sur la bonne voie pour atteindre nos objectifs?' },
    { icon: '⚡', label: 'Alertes', query: 'Y a-t-il des alertes ou anomalies à signaler?' },
    { icon: '🔮', label: 'Prévisions', query: 'Quelles sont les prévisions de ventes?' },
    { icon: '💰', label: 'Revenus', query: 'Analyse détaillée des revenus' }
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.sessionId = 'analytics-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit(): void {
    // Message de bienvenue
    this.addAssistantMessage(
      "👋 Bonjour ! Je suis votre assistant analytique avec accès direct à votre base de données PostgreSQL.\n\n" +
      "Je peux vous aider à :\n" +
      "• Analyser les KPIs et métriques\n" +
      "• Explorer les tendances de ventes\n" +
      "• Identifier les produits performants\n" +
      "• Détecter les anomalies et alertes\n" +
      "• Générer des insights business\n\n" +
      "Posez-moi vos questions ! 📊"
    );
  }

  ngOnDestroy(): void {}

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addMessage(msg: ChatMessage): void {
    this.messages = [...this.messages, msg];
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private addAssistantMessage(content: string): void {
    const msg: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    this.addMessage(msg);
  }

  private addUserMessage(content: string): void {
    const msg: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    this.addMessage(msg);
  }

  sendMessage(): void {
    if (!this.inputMessage.trim() || this.isLoading) return;

    const message = this.inputMessage.trim();
    this.inputMessage = '';
    this.isLoading = true;

    // Add user message
    this.addUserMessage(message);

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const request = {
      sessionId: this.sessionId,
      message: message,
      includeRealTimeData: this.includeRealTimeData,
      dataFilters: this.includeRealTimeData ? {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: today.toISOString()
      } : undefined
    };

    this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request)
      .subscribe({
        next: (response: ChatResponse) => {
          this.ngZone.run(() => {
            this.addAssistantMessage(response.response);
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error: any) => {
          this.ngZone.run(() => {
            console.error('Chat error:', error);
            this.addAssistantMessage("❌ Désolé, une erreur s'est produite. Veuillez réessayer.");
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  askQuickQuestion(q: string): void {
    // Remove emoji prefix if present
    this.inputMessage = q.replace(/^[\p{Emoji}]\s*/u, '').trim();
    if (!this.inputMessage) {
      this.inputMessage = q;
    }
    this.sendMessage();
  }

  askSuggestion(suggestion: { query: string }): void {
    this.inputMessage = suggestion.query;
    this.sendMessage();
  }

  resetChat(): void {
    this.sessionId = 'analytics-' + Math.random().toString(36).substr(2, 9);
    this.messages = [];
    this.addAssistantMessage("🔄 Nouvelle session démarrée. Comment puis-je vous aider dans votre analyse ?");
  }

  clearSession(): void {
    this.http.post(`${this.apiUrl}/clear-session`, { sessionId: this.sessionId }).subscribe();
    this.resetChat();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
