import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Path to chroma_db (same as seed_search.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
PERSIST_DIR = os.path.join(project_root, "chroma_db")

# Must match seed_search.py embedding model
EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

class SearchService:
    def __init__(self):
        self.vector_db = Chroma(
            persist_directory=PERSIST_DIR,
            embedding_function=EMBEDDING_MODEL,
            collection_name="products_catalog"
        )
        print(f"SearchService initialized with chroma at: {PERSIST_DIR}")

    def search(self, query: str, min_price: float = 0, max_price: float = 1000000):
        """
        Semantic search: uses the user's sentence to find similar products.
        """
        k = 10
        
        # Build price filter if specified
        filters = None
        if min_price > 0 or max_price < 1000000:
            filters = {
                "$and": [
                    {"price": {"$gte": min_price}},
                    {"price": {"$lte": max_price}}
                ]
            }

        # Perform semantic search
        try:
            if filters:
                results = self.vector_db.similarity_search_with_score(query, k=k, filter=filters)
            else:
                results = self.vector_db.similarity_search_with_score(query, k=k)
        except Exception as e:
            print(f"Search error: {e}")
            return []

        # Format results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "product": doc.metadata,
                "relevance_score": round(score, 4)  # Lower distance = more relevant
            })

        return formatted_results

search_service = SearchService()