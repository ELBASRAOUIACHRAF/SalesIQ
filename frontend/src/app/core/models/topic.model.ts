export interface TopicDto {
  topicId: number;
  topicName: string;
  keywords: string[];
  weight: number;
  reviewCount: number;
  avgSentiment: number;
  sentimentLabel: string;
}

export const defaultTopics: TopicDto[] = [];
