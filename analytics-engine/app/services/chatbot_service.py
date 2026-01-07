import os
import re
from pathlib import Path
from typing import Dict, Optional, List
import traceback

from langchain_ollama import OllamaLLM
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.services.database_service import db_service


class AnalyticsChatbot:
    def __init__(self):
        self.llm = None
        self.embeddings = None
        self.vectorstore = None
        self.sessions: Dict[str, List[Dict]] = {}
        self.base_path = Path(__file__).resolve().parent.parent
        self._initialize()

    def _initialize(self):
        print("Initializing chatbot...")

        try:
            # Local LLM served by Ollama with timeout
            print("Connecting to Ollama LLM...")
            self.llm = OllamaLLM(
                model="gemma3:4b", 
                temperature=0.3,
                num_predict=512,  # Limit response length for faster responses
                timeout=120  # 2 minute timeout
            )
            print("Ollama LLM connected!")
        except Exception as e:
            print(f"Error connecting to Ollama: {e}")
            traceback.print_exc()
            raise

        try:
            # Multilingual embeddings for FR content
            print("Loading HuggingFace embeddings...")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={'device': 'cpu'}
            )
            print("Embeddings loaded!")
        except Exception as e:
            print(f"Error loading embeddings: {e}")
            traceback.print_exc()
            raise

        try:
            self._initialize_vectorstore()
        except Exception as e:
            print(f"Error initializing vectorstore: {e}")
            traceback.print_exc()
            raise

        print("Chatbot initialized successfully!")

    def _initialize_vectorstore(self):
        vectorstore_path = self.base_path / "knowledge" / "vectorstore"
        documents_path = self.base_path / "knowledge" / "documents"

        if vectorstore_path.exists() and any(vectorstore_path.iterdir()):
            print("Loading existing vectorstore...")
            self.vectorstore = Chroma(
                persist_directory=str(vectorstore_path),
                embedding_function=self.embeddings
            )
        else:
            print("Creating new vectorstore...")
            documents = self._load_documents(documents_path)
            if documents:
                self.vectorstore = Chroma.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    persist_directory=str(vectorstore_path)
                )
                print(f"Vectorstore created with {len(documents)} chunks")
            else:
                print("No documents found for vectorstore initialization")

    def _load_documents(self, path: Path) -> List[Document]:
        documents: List[Document] = []
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )

        path.mkdir(parents=True, exist_ok=True)

        for filename in os.listdir(path):
            filepath = path / filename
            if filename.endswith(('.md', '.txt')):
                print(f"Loading document: {filename}")
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    chunks = text_splitter.split_text(content)
                    for chunk in chunks:
                        documents.append(Document(
                            page_content=chunk,
                            metadata={"source": filename}
                        ))
        return documents

    def _get_session_history(self, session_id: str) -> List[Dict]:
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        return self.sessions[session_id]

    def _build_context(self, query: str) -> str:
        if not self.vectorstore:
            return ""

        docs = self.vectorstore.similarity_search(query, k=3)
        context = "\n\n".join([doc.page_content for doc in docs])
        return context

    def _format_history(self, history: List[Dict]) -> str:
        if not history:
            return "Aucun historique."

        formatted = []
        for msg in history[-6:]:
            role = "Utilisateur" if msg["role"] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['content']}")

        return "\n".join(formatted)

    def _build_data_context(self, real_time_data: Optional[Dict]) -> str:
        if not real_time_data:
            return "Aucune donnée temps réel disponible."

        parts = []

        if "kpis" in real_time_data:
            kpis = real_time_data["kpis"]
            parts.append(f"""
DONNÉES ACTUELLES:
- Revenu total: {kpis.get('totalRevenue', 'N/A')}€
- Nombre de commandes: {kpis.get('totalOrders', 'N/A')}
- Nombre de clients: {kpis.get('totalCustomers', 'N/A')}
- Valeur moyenne commande: {kpis.get('averageOrderValue', 'N/A')}€
- Note moyenne produits: {kpis.get('averageRating', 'N/A')}/5
- Taux de conversion: {kpis.get('conversionRate', 'N/A')}%
- Nouveaux clients: {kpis.get('newCustomers', 'N/A')}
- Clients fidèles: {kpis.get('returningCustomers', 'N/A')}
""")

        if "churn" in real_time_data:
            churn = real_time_data["churn"]
            parts.append(f"""
ANALYSE CHURN:
- Taux de churn: {churn.get('churnRate', 'N/A')}%
- Clients perdus: {churn.get('usersLost', 'N/A')}
- Clients actifs: {churn.get('activeUsers', 'N/A')}
""")

        if "topProducts" in real_time_data and real_time_data["topProducts"]:
            products = real_time_data["topProducts"][:5]
            product_lines = [f"  {i+1}. {p.get('productName', 'N/A')}: {p.get('revenue', 'N/A')}€" 
                             for i, p in enumerate(products)]
            parts.append(f"""
TOP 5 PRODUITS:
{chr(10).join(product_lines)}
""")

        if "topCategories" in real_time_data and real_time_data["topCategories"]:
            categories = real_time_data["topCategories"][:5]
            cat_lines = [f"  {i+1}. {c.get('categoryName', 'N/A')}: {c.get('revenue', 'N/A')}€" 
                         for i, c in enumerate(categories)]
            parts.append(f"""
TOP CATÉGORIES:
{chr(10).join(cat_lines)}
""")

        return "\n".join(parts) if parts else "Aucune donnée temps réel disponible."

    def _is_simple_greeting(self, message: str) -> Optional[str]:
        """Handle simple greetings without LLM for instant response"""
        msg = message.lower().strip()
        greetings = {
            "hello": "Bonjour ! Je suis votre assistant analytics avec accès à votre base de données. Comment puis-je vous aider ?",
            "hi": "Salut ! Comment puis-je vous aider avec vos analyses ?",
            "bonjour": "Bonjour ! Je suis prêt à vous aider avec vos données e-commerce.",
            "salut": "Salut ! Que souhaitez-vous analyser aujourd'hui ?",
            "hey": "Hey ! Comment puis-je vous assister ?",
            "coucou": "Coucou ! Prêt à explorer vos données ?",
            "bonsoir": "Bonsoir ! Comment puis-je vous aider ?",
        }
        for key, response in greetings.items():
            if msg == key or msg.startswith(key + " ") or msg.startswith(key + "!"):
                return response
        return None

    def _detect_intent_and_get_data(self, message: str) -> str:
        """Détecte l'intention de la question et récupère les données pertinentes de la DB"""
        msg = message.lower()
        data_parts = []

        try:
            # KPIs / Stats générales / résumé - PRIORITY CHECK
            if any(word in msg for word in ["kpi", "kpis", "résumé", "summary", "statistique", "stats", "général", "overview", "dashboard", "performance"]):
                summary = db_service.get_database_summary()
                sales = db_service.get_sales_summary(30)
                if summary or sales:
                    data_parts.append(f"""📈 KPIs & RÉSUMÉ:
- Produits actifs: {summary.get('products_count', 0)}
- Commandes totales: {summary.get('orders_count', 0)}
- Clients: {summary.get('users_count', 0)}
- Catégories: {summary.get('categories_count', 0)}
- Revenu total: {float(summary.get('total_revenue', 0)):,.2f}€
- Panier moyen: {float(summary.get('avg_order_value', 0)):,.2f}€
- Avis clients: {summary.get('reviews_count', 0)}
- Note moyenne: {float(summary.get('avg_rating', 0)):.1f}/5
- Ventes 30j: {float(sales.get('total_revenue', 0)):,.2f}€ ({sales.get('total_orders', 0)} commandes)""")

            # Ventes / Chiffre d'affaires
            elif any(word in msg for word in ["vente", "ventes", "chiffre", "revenu", "revenue", "ca", "chiffre d'affaires"]):
                sales = db_service.get_sales_summary(30)
                if sales:
                    data_parts.append(f"""📊 VENTES (30 derniers jours):
- Commandes: {sales.get('total_orders', 0)}
- Revenu total: {float(sales.get('total_revenue', 0)):,.2f}€
- Panier moyen: {float(sales.get('avg_order_value', 0)):,.2f}€
- Clients uniques: {sales.get('unique_customers', 0)}""")

            # Top produits
            if any(word in msg for word in ["top produit", "meilleur produit", "produits populaires", "best seller", "bestseller", "plus vendu"]):
                products = db_service.get_top_products(5)
                if products:
                    lines = [f"  {i+1}. {p['product_name']}: {float(p['total_revenue']):,.2f}€ ({p['total_quantity']} vendus)" 
                             for i, p in enumerate(products)]
                    data_parts.append(f"""🏆 TOP 5 PRODUITS:\n{chr(10).join(lines)}""")

            # Catégories
            if any(word in msg for word in ["catégorie", "categories", "category"]):
                cats = db_service.get_top_categories()
                if cats:
                    lines = [f"  {i+1}. {c['category']}: {float(c['total_revenue']):,.2f}€" 
                             for i, c in enumerate(cats[:5])]
                    data_parts.append(f"""📁 TOP CATÉGORIES:\n{chr(10).join(lines)}""")

            # Stock bas / Rupture
            if any(word in msg for word in ["stock", "rupture", "inventaire", "manque", "faible"]):
                low_stock = db_service.get_low_stock_products(10)
                if low_stock:
                    lines = [f"  ⚠️ {p['product_name']}: {p['stock_quantity']} en stock" 
                             for p in low_stock[:5]]
                    data_parts.append(f"""📦 PRODUITS STOCK BAS:\n{chr(10).join(lines)}""")
                else:
                    data_parts.append("✅ Aucun produit en rupture de stock!")

            # Clients
            if any(word in msg for word in ["client", "clients", "customer", "utilisateur"]):
                stats = db_service.get_customer_stats()
                if stats:
                    data_parts.append(f"""👥 CLIENTS:
- Total clients: {stats.get('total_customers', 0)}
- Nouveaux (30j): {stats.get('new_customers_30d', 0)}
- Nouveaux (7j): {stats.get('new_customers_7d', 0)}""")

            # Commandes récentes
            if any(word in msg for word in ["commande récente", "dernières commandes", "orders", "recent"]):
                orders = db_service.get_recent_orders(5)
                if orders:
                    lines = [f"  #{o['id']}: {float(o['total_amount']):,.2f}€ - {o['status']}" 
                             for o in orders]
                    data_parts.append(f"""📋 COMMANDES RÉCENTES:\n{chr(10).join(lines)}""")

            # Recherche produit spécifique
            product_match = re.search(r"produit[s]?\s+['\"]?([^'\"]+)['\"]?|['\"]([^'\"]+)['\"]", msg)
            if product_match:
                product_name = product_match.group(1) or product_match.group(2)
                products = db_service.get_product_by_name(product_name)
                if products:
                    lines = [f"  - {p['name']}: {float(p['price']):,.2f}€ (stock: {p['stock_quantity']})" 
                             for p in products]
                    data_parts.append(f"""🔍 PRODUITS TROUVÉS:\n{chr(10).join(lines)}""")

        except Exception as e:
            print(f"Error fetching DB data: {e}")
            data_parts.append(f"⚠️ Erreur accès base de données: {str(e)}")

        return "\n\n".join(data_parts) if data_parts else ""

    def chat(self, session_id: str, message: str, real_time_data: Optional[Dict] = None) -> str:
        history = self._get_session_history(session_id)
        
        # Fast path for simple greetings - no LLM needed
        greeting_response = self._is_simple_greeting(message)
        if greeting_response:
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": greeting_response})
            return greeting_response

        # Get database data based on question intent
        db_data = self._detect_intent_and_get_data(message)
        
        # Only fetch vectorstore context for real questions
        context = self._build_context(message) if len(message) > 15 else ""
        
        # Build API data context if provided
        api_data_context = self._build_data_context(real_time_data) if real_time_data else ""

        # Combine all data sources
        all_data = []
        if db_data:
            all_data.append(f"DONNÉES DE LA BASE DE DONNÉES:\n{db_data}")
        if api_data_context:
            all_data.append(f"DONNÉES API:\n{api_data_context}")
        
        data_section = "\n\n".join(all_data) if all_data else "Aucune donnée spécifique trouvée."

        # Prompt with database access
        prompt = f"""Tu es un assistant e-commerce intelligent avec accès à la base de données PostgreSQL.
Réponds en français, de façon claire et concise. Utilise les données fournies pour répondre précisément.

{data_section}

Question: {message}

Réponse (utilise les données ci-dessus si pertinentes):"""

        try:
            response = self.llm.invoke(prompt)

            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": response})

            if len(history) > 10:
                self.sessions[session_id] = history[-10:]

            return response
        except Exception as e:
            print(f"Error in chat: {e}")
            return f"Désolé, une erreur s'est produite: {str(e)}"

    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]


_chatbot_instance: Optional[AnalyticsChatbot] = None
_init_error: Optional[str] = None


def get_chatbot() -> AnalyticsChatbot:
    """Singleton-style accessor for the chatbot"""
    global _chatbot_instance, _init_error
    
    if _init_error:
        raise RuntimeError(f"Chatbot initialization failed: {_init_error}")
    
    if _chatbot_instance is None:
        try:
            _chatbot_instance = AnalyticsChatbot()
        except Exception as e:
            _init_error = str(e)
            raise RuntimeError(f"Chatbot initialization failed: {e}")
    
    return _chatbot_instance


def initialize_chatbot():
    """Pre-initialize chatbot at startup (optional)"""
    global _chatbot_instance, _init_error
    try:
        if _chatbot_instance is None:
            print("Pre-initializing chatbot...")
            _chatbot_instance = AnalyticsChatbot()
            print("Chatbot pre-initialization complete!")
    except Exception as e:
        _init_error = str(e)
        print(f"Chatbot pre-initialization failed: {e}")
