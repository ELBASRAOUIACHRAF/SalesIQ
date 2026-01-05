import numpy as np
from typing import List
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from textblob import TextBlob
import re
from app.api.models.topic_model import TopicExtractionRequest, TopicResponse, ReviewText

STOP_WORDS = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
    'they', 'what', 'which', 'who', 'whom', 'this', 'that', 'am', 'is',
    'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'having', 'he', 'she', 'it', 'its', 'they',
    'them', 'their', 'my', 'your', 'his', 'her', 'our', 'its', 'me',
    'him', 'her', 'us', 'very', 'just', 'also', 'so', 'than', 'too',
    'only', 'same', 'into', 'each', 'own', 'such', 'much', 'more', 'most',
    'other', 'some', 'any', 'no', 'not', 'all', 'both', 'one', 'two',
    'product', 'item', 'bought', 'buy', 'got', 'get', 'really', 'like',
    'would', 'thing', 'things', 'way', 'even', 'well', 'back', 'also'
]

TOPIC_LABELS = {
    'quality': ['quality', 'material', 'build', 'durable', 'sturdy', 'solid', 'cheap', 'flimsy', 'broken'],
    'price': ['price', 'value', 'money', 'worth', 'expensive', 'cheap', 'cost', 'affordable', 'budget'],
    'delivery': ['delivery', 'shipping', 'arrived', 'package', 'fast', 'slow', 'days', 'late', 'quick'],
    'size': ['size', 'fit', 'small', 'large', 'big', 'tight', 'loose', 'perfect', 'sizing'],
    'appearance': ['look', 'looks', 'color', 'design', 'beautiful', 'nice', 'ugly', 'style', 'appearance'],
    'performance': ['works', 'working', 'performance', 'function', 'effective', 'efficient', 'powerful'],
    'ease_of_use': ['easy', 'simple', 'complicated', 'difficult', 'use', 'setup', 'install', 'instructions'],
    'customer_service': ['service', 'support', 'help', 'response', 'return', 'refund', 'customer', 'seller']
}

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

def get_sentiment(text: str) -> tuple:
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        if polarity > 0.1:
            return polarity, "POSITIVE"
        elif polarity < -0.1:
            return polarity, "NEGATIVE"
        else:
            return polarity, "NEUTRAL"
    except:
        return 0.0, "NEUTRAL"

def assign_topic_name(keywords: List[str]) -> str:
    best_match = "general_feedback"
    best_score = 0
    
    for topic_name, topic_keywords in TOPIC_LABELS.items():
        score = sum(1 for kw in keywords if kw in topic_keywords)
        if score > best_score:
            best_score = score
            best_match = topic_name
    
    if best_score == 0:
        return keywords[0] + "_related" if keywords else "general_feedback"
    
    return best_match

def extract_topics(request: TopicExtractionRequest) -> List[TopicResponse]:
    if not request.reviews or len(request.reviews) < 3:
        return []

    documents = [clean_text(r.comment) for r in request.reviews]
    documents = [doc for doc in documents if len(doc.split()) >= 3]

    if len(documents) < 3:
        return []

    try:
        vectorizer = CountVectorizer(
            max_df=0.95,
            min_df=2,
            stop_words=STOP_WORDS,
            max_features=1000
        )
        doc_term_matrix = vectorizer.fit_transform(documents)
        feature_names = vectorizer.get_feature_names_out()

        if doc_term_matrix.shape[1] < request.numTopics:
            return []

        num_topics = min(request.numTopics, len(documents) // 2, 5)
        num_topics = max(2, num_topics)

        lda = LatentDirichletAllocation(
            n_components=num_topics,
            random_state=42,
            max_iter=20,
            learning_method='online'
        )
        lda.fit(doc_term_matrix)

        doc_topics = lda.transform(doc_term_matrix)

    except Exception as e:
        print(f"LDA failed: {e}")
        return []

    results = []

    for topic_idx, topic in enumerate(lda.components_):
        top_word_indices = topic.argsort()[:-11:-1]
        keywords = [feature_names[i] for i in top_word_indices]
        
        topic_weight = float(np.mean(topic[top_word_indices]))
        
        topic_docs = []
        topic_ratings = []
        
        for doc_idx, doc_topic_dist in enumerate(doc_topics):
            if doc_topic_dist[topic_idx] > 0.3:
                topic_docs.append(doc_idx)
                if doc_idx < len(request.reviews):
                    topic_ratings.append(request.reviews[doc_idx].rating)

        review_count = len(topic_docs)
        
        sentiments = []
        for doc_idx in topic_docs[:20]:
            if doc_idx < len(documents):
                sentiment_score, _ = get_sentiment(documents[doc_idx])
                sentiments.append(sentiment_score)

        avg_sentiment = np.mean(sentiments) if sentiments else 0.0
        
        if avg_sentiment > 0.1:
            sentiment_label = "POSITIVE"
        elif avg_sentiment < -0.1:
            sentiment_label = "NEGATIVE"
        else:
            sentiment_label = "NEUTRAL"

        topic_name = assign_topic_name(keywords)

        results.append(TopicResponse(
            topicId=topic_idx + 1,
            topicName=topic_name,
            keywords=keywords[:8],
            weight=round(topic_weight, 4),
            reviewCount=review_count,
            avgSentiment=round(avg_sentiment, 2),
            sentimentLabel=sentiment_label
        ))

    results.sort(key=lambda x: x.reviewCount, reverse=True)

    return results