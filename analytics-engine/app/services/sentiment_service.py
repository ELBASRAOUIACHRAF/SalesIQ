from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

class SentimentService:
    def __init__(self):
        self.model_name = "cardiffnlp/twitter-roberta-base-sentiment"
        # On charge le modèle une seule fois au démarrage
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        self.classifier = pipeline("sentiment-analysis", model=self.model, tokenizer=self.tokenizer)
        
        self.label_map = {
            "LABEL_0": "negative",
            "LABEL_1": "neutral",
            "LABEL_2": "positive"
        }

    def analyze_all_products(self, products_list):
        results = []
        for product in products_list:
            stats = {"positive": 0, "negative": 0, "neutral": 0}
            
            if product.productReviews:
                # Analyse par lot (batch) pour plus de rapidité
                predictions = self.classifier(product.productReviews)
                for pred in predictions:
                    label = self.label_map[pred['label']]
                    stats[label] += 1
            
            results.append({
                "productId": product.productId,
                "sentimentStats": stats
            })
        return results

sentiment_service = SentimentService()