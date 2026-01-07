import os
import json
import traceback
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_ollama import OllamaLLM
from app.api.models.search_schema import ProductIndex

# --- CONFIGURATION (Doit matcher seed_search.py) ---

# Calcul dynamique du chemin pour atteindre le dossier "chroma_db" à la racine du projet
# Structure supposée : analytics-engine/app/services/search_service.py
current_dir = os.path.dirname(os.path.abspath(__file__))
# On remonte de 2 niveaux : services -> app -> analytics-engine
project_root = os.path.dirname(os.path.dirname(current_dir))
PERSIST_DIR = os.path.join(project_root, "chroma_db")

# IMPORTANT : Doit être STRICTEMENT le même modèle que dans seed_search.py
EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

class SearchService:
    def __init__(self):
        self.vector_db = Chroma(
            persist_directory=PERSIST_DIR,
            embedding_function=EMBEDDING_MODEL,
            collection_name="products_catalog"
        )

        # Initialize an LLM to convert free-text queries into structured search JSON (filters, metadata, k)
        try:
            print("Connecting to Ollama LLM for search parsing...")
            self.llm = OllamaLLM(
                model="gemma3:4b",
                temperature=0.0,
                num_predict=512,
                timeout=60
            )
            print("Ollama LLM connected for search!")
        except Exception as e:
            print(f"Warning: Could not initialize Ollama LLM: {e}")
            traceback.print_exc()
            self.llm = None

    def _query_llm_for_filters(self, query: str) -> dict:
        """
        Ask the LLM to return a strict JSON object describing:
        {
            "query": "<text to run against vector db (optional)>",
            "k": 5,                     # optional
            "filter": {...},            # optional, Mongo-style filter for Chroma
            "metadata": {...}           # optional free-form metadata
        }
        The LLM must return only valid JSON.
        """
        if not self.llm:
            raise RuntimeError("LLM not available for parsing search queries")

        prompt = (
            "You are a strict JSON generator that extracts search filters and metadata from a user's query. "
            "Return ONLY a valid JSON object with optional keys: 'query', 'k', 'filter', 'metadata'. "
            "The 'filter' value must be a Mongo-style filter suitable for Chroma (e.g., "
            "{\"$and\":[{\"price\":{\"$gte\":10}},{\"price\":{\"$lte\":100}}]}). "
            "Do NOT include any commentary or surrounding text.\n\n"
            f"User query: \"{query}\"\n\n"
            "Examples:\n"
            "{\"query\":\"red shoes\",\"k\":5,\"filter\":{\"$and\":[{\"price\":{\"$gte\":10}},{\"price\":{\"$lte\":100}}]},\"metadata\":{\"category\":\"shoes\"}}\n\n"
            "Now produce the JSON for the user's query."
        )

        response = self.llm.invoke(prompt)
        text = response.strip()

        # Remove triple-backtick code fences if present
        if text.startswith("```"):
            lines = text.splitlines()
            # remove first and last lines if they are backticks
            if lines[-1].startswith("```"):
                text = "\n".join(lines[1:-1])
            else:
                text = "\n".join(lines[1:])

        try:
            parsed = json.loads(text)
            return parsed
        except Exception as e:
            raise ValueError(f"Failed to parse JSON from LLM response: {e}\nResponse was: {text}")

    # def index_product(self, product: ProductIndex):
    #     """
    #     Ajoute un produit unique (appelé par Spring Boot via l'API)
    #     """
    #     # 1. Création du contenu sémantique (même logique que seed_search.py)
    #     text_content = f"{product.name} {product.category_name} {product.mark or ''} {product.description}"

    #     # 2. Création du Document
    #     doc = Document(
    #         page_content=text_content,
    #         metadata={
    #             "id": product.id,
    #             "name": product.name,
    #             "price": float(product.price),
    #             "category": product.category_name, # Note: clé 'category' comme dans le seed
    #             "imageUrl": product.image_url or "",
    #             "mark": product.mark or ""
    #         }
    #     )

        # 3. Ajout dans Chroma
        # self.vector_db.add_documents([doc])
        # print(f"✅ Produit '{product.name}' ajouté à l'index sémantique.")

    def search(self, query: str, min_price: float = 0, max_price: float = 1000000):
        """
        Search flow:
        - Send user query to LLM to obtain JSON with optional keys: 'query', 'k', 'filter', 'metadata'
        - Use returned 'query' (or original) and 'filter' in Chroma similarity_search_with_score
        - Return results with LLM-provided metadata if any
        """
        # Default fallback filters (price range)
        fallback_filters = {
            "$and": [
                {"price": {"$gte": min_price}},
                {"price": {"$lte": max_price}}
            ]
        }

        search_query = query
        k = 5
        llm_metadata = {}

        # Try to get structured search from LLM
        try:
            llm_response = self._query_llm_for_filters(query)
            search_query = llm_response.get("query", search_query)
            k = int(llm_response.get("k", k))
            filters = llm_response.get("filter", fallback_filters)
            llm_metadata = llm_response.get("metadata", {})
        except Exception as e:
            print(f"LLM parsing failed or unavailable, using fallback filters. Error: {e}")
            filters = fallback_filters

        # Perform the vector search
        results = self.vector_db.similarity_search_with_score(
            search_query,
            k=k,
            filter=filters
        )

        # Format results for the frontend, attach LLM metadata for traceability
        formatted_results = []
        for doc, score in results:
            entry = {
                "product": doc.metadata,
                "relevance_score": score
            }
            if llm_metadata:
                entry["llm_metadata"] = llm_metadata
            formatted_results.append(entry)

        return formatted_results

search_service = SearchService()