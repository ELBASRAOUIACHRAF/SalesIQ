import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatbotService, ChatMessage } from '../../../services/chatbot.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chatbot-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chatbot-assistant.html',
  styleUrls: ['./chatbot-assistant.css']
})
export class ChatbotAssistant implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isLoading = false;
  includeRealTimeData = true;
  subscription?: Subscription;

  quickQuestions = [
    "Qu'est-ce que le taux de churn?",
    'Comment améliorer la rétention client?',
    'Explique-moi la matrice BCG',
    'Quelles actions pour réduire le churn?',
    'Comment interpréter la classification ABC?'
  ];

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.subscription = this.chatbotService.messages$.subscribe(msgs => {
      this.ngZone.run(() => {
        this.messages = msgs;
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  sendMessage(): void {
    if (!this.inputMessage.trim() || this.isLoading) return;

    const message = this.inputMessage.trim();
    this.inputMessage = '';
    this.isLoading = true;

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filters = this.includeRealTimeData ? {
      startDate: thirtyDaysAgo.toISOString(),
      endDate: today.toISOString()
    } : undefined;

    this.chatbotService.sendMessage(message, this.includeRealTimeData, filters)
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.chatbotService.addAssistantMessage(response.response);
            this.isLoading = false;
            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Chat error:', error);
            this.chatbotService.addAssistantMessage("Désolé, une erreur s'est produite.");
            this.isLoading = false;
            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        }
      });
  }

  askQuickQuestion(q: string): void {
    this.inputMessage = q;
    this.sendMessage();
  }

  resetChat(): void {
    this.chatbotService.resetChat();
    this.messages = [];
  }

  clearSession(): void {
    this.chatbotService.clearSession().subscribe();
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
