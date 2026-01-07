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
            print("Connecting to Ollama LLM...")
            self.llm = OllamaLLM(
                model="gemma3:4b", 
                temperature=0.4,
                num_predict=1024,
                timeout=180
            )
            print("Ollama LLM connected!")
        except Exception as e:
            print(f"Error connecting to Ollama: {e}")
            traceback.print_exc()
            raise

        try:
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
            return ""
        formatted = []
        for msg in history[-4:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['content'][:200]}")
        return "\n".join(formatted)

    def _is_simple_greeting(self, message: str) -> Optional[str]:
        """Handle simple greetings instantly"""
        msg = message.lower().strip()
        greetings = {
            "hello": "👋 Bonjour ! Je suis votre assistant analytique avec accès direct à votre base de données PostgreSQL.\n\n📊 **Ce que je peux faire:**\n• Analyser vos KPIs et métriques\n• Explorer les ventes et tendances\n• Identifier les produits performants\n• Détecter les alertes (stock bas, avis négatifs)\n• Segmenter vos clients\n\n💡 Essayez: \"Donne-moi les KPIs\" ou \"Top produits\"",
            "hi": "👋 Salut ! Comment puis-je vous aider avec vos analyses aujourd'hui?",
            "bonjour": "👋 Bonjour ! Je suis prêt à analyser vos données e-commerce. Que souhaitez-vous savoir?",
            "salut": "👋 Salut ! Posez-moi vos questions sur les ventes, produits, clients ou KPIs!",
            "hey": "👋 Hey ! Comment puis-je vous aider?",
            "bonsoir": "👋 Bonsoir ! Comment puis-je vous assister ce soir?",
        }
        for key, response in greetings.items():
            if msg == key or msg.startswith(key + " ") or msg.startswith(key + "!"):
                return response
        return None

    def _format_number(self, value, decimals=2, suffix="") -> str:
        """Format numbers nicely"""
        try:
            num = float(value) if value else 0
            if num >= 1000000:
                return f"{num/1000000:,.1f}M{suffix}"
            elif num >= 1000:
                return f"{num/1000:,.1f}K{suffix}"
            elif decimals == 0:
                return f"{int(num):,}{suffix}"
            else:
                return f"{num:,.{decimals}f}{suffix}"
        except:
            return str(value)

    def _detect_intent_and_get_data(self, message: str) -> str:
        """Intelligent intent detection with comprehensive data retrieval"""
        msg = message.lower()
        data_parts = []

        try:
            # ============ KPIs / Dashboard / Résumé général ============
            if any(word in msg for word in ["kpi", "kpis", "résumé", "summary", "statistique", "stats", 
                                            "général", "overview", "dashboard", "performance", "tableau de bord"]):
                summary = db_service.get_database_summary()
                sales = db_service.get_sales_summary(30)
                comparison = db_service.get_kpi_comparison()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    📊 TABLEAU DE BORD KPIs                    ║
╚══════════════════════════════════════════════════════════════╝

📈 **MÉTRIQUES GLOBALES**
┌─────────────────────────────────────────┐
│ 🛍️  Produits actifs    : {self._format_number(summary.get('products_count', 0), 0)}
│ 📦  Commandes totales  : {self._format_number(summary.get('orders_count', 0), 0)}
│ 👥  Clients            : {self._format_number(summary.get('users_count', 0), 0)}
│ 📁  Catégories         : {self._format_number(summary.get('categories_count', 0), 0)}
│ 💰  Revenu total       : {self._format_number(summary.get('total_revenue', 0))}€
│ 🛒  Panier moyen       : {self._format_number(summary.get('avg_order_value', 0))}€
│ ⭐  Note moyenne       : {self._format_number(summary.get('avg_rating', 0), 1)}/5
│ 💬  Avis clients       : {self._format_number(summary.get('reviews_count', 0), 0)}
└─────────────────────────────────────────┘

📅 **PERFORMANCE 30 DERNIERS JOURS**
┌─────────────────────────────────────────┐
│ 💵  Revenu période     : {self._format_number(sales.get('total_revenue', 0))}€
│ 📦  Commandes          : {self._format_number(sales.get('total_orders', 0), 0)}
│ 👤  Clients uniques    : {self._format_number(sales.get('unique_customers', 0), 0)}
│ 📊  Articles vendus    : {self._format_number(sales.get('total_items_sold', 0), 0)}
└─────────────────────────────────────────┘""")

                if comparison:
                    growth = float(comparison.get('revenue_growth', 0))
                    arrow = "📈" if growth >= 0 else "📉"
                    data_parts.append(f"""
📊 **COMPARAISON MENSUELLE**
┌─────────────────────────────────────────┐
│ Ce mois   : {self._format_number(comparison.get('current_revenue', 0))}€ ({comparison.get('current_orders', 0)} commandes)
│ Mois préc.: {self._format_number(comparison.get('previous_revenue', 0))}€ ({comparison.get('previous_orders', 0)} commandes)
│ {arrow} Évolution: {growth:+.1f}%
└─────────────────────────────────────────┘""")

            # ============ Ventes / Chiffre d'affaires ============
            elif any(word in msg for word in ["vente", "ventes", "chiffre", "revenu", "revenue", "ca", 
                                               "chiffre d'affaires", "recette"]):
                sales = db_service.get_sales_summary(30)
                trend = db_service.get_sales_trend("day")[:7]
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    💰 ANALYSE DES VENTES                      ║
╚══════════════════════════════════════════════════════════════╝

📊 **RÉSUMÉ 30 JOURS**
┌─────────────────────────────────────────┐
│ 💵  Revenu total       : {self._format_number(sales.get('total_revenue', 0))}€
│ 📦  Commandes          : {self._format_number(sales.get('total_orders', 0), 0)}
│ 🛒  Panier moyen       : {self._format_number(sales.get('avg_order_value', 0))}€
│ 👥  Clients uniques    : {self._format_number(sales.get('unique_customers', 0), 0)}
│ 📊  Articles vendus    : {self._format_number(sales.get('total_items_sold', 0), 0)}
└─────────────────────────────────────────┘""")

                if trend:
                    data_parts.append("\n📈 **TENDANCE (7 derniers jours)**")
                    for t in trend[:7]:
                        date_str = t['period'].strftime('%d/%m') if t.get('period') else 'N/A'
                        data_parts.append(f"  • {date_str}: {self._format_number(t.get('revenue', 0))}€ ({t.get('order_count', 0)} cmd)")

            # ============ Top Produits ============
            elif any(word in msg for word in ["top produit", "meilleur produit", "produits populaires", 
                                               "best seller", "bestseller", "plus vendu", "top 10", "top 5"]):
                products = db_service.get_top_products(10)
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    🏆 TOP PRODUITS (30j)                      ║
╚══════════════════════════════════════════════════════════════╝
""")
                if products:
                    for i, p in enumerate(products, 1):
                        medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
                        data_parts.append(f"""{medal} **{p['product_name']}**
   └─ 💰 {self._format_number(p['total_revenue'])}€ | 📦 {p['total_quantity']} vendus | 📊 {p['times_ordered']} commandes | Stock: {p['current_stock']}
""")
                else:
                    data_parts.append("❌ Aucune vente enregistrée sur cette période.")

            # ============ Catégories ============
            elif any(word in msg for word in ["catégorie", "categories", "category", "catégories"]):
                cats = db_service.get_top_categories()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    📁 PERFORMANCE CATÉGORIES                  ║
╚══════════════════════════════════════════════════════════════╝
""")
                if cats:
                    for i, c in enumerate(cats, 1):
                        data_parts.append(f"""{i}. **{c['category'] or 'Sans catégorie'}**
   └─ 💰 {self._format_number(c['total_revenue'])}€ | 📦 {c['total_quantity']} articles | 🛒 {c['order_count']} commandes
""")
                else:
                    data_parts.append("❌ Aucune donnée de catégorie disponible.")

            # ============ Stock / Inventaire ============
            elif any(word in msg for word in ["stock", "rupture", "inventaire", "manque", "faible", 
                                               "épuisé", "réapprovisionner"]):
                low_stock = db_service.get_low_stock_products(10)
                out_of_stock = db_service.get_out_of_stock_products()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    📦 ÉTAT DES STOCKS                         ║
╚══════════════════════════════════════════════════════════════╝
""")
                
                if out_of_stock:
                    data_parts.append("🚨 **RUPTURES DE STOCK (Action urgente!)**")
                    for p in out_of_stock[:5]:
                        data_parts.append(f"   • ❌ {p['product_name']} ({p['category'] or 'N/A'}) - Demande récente: {p['recent_demand']}")
                
                if low_stock:
                    data_parts.append("\n⚠️ **STOCK CRITIQUE (≤10 unités)**")
                    for p in low_stock[:10]:
                        emoji = "🔴" if p['stock_quantity'] <= 3 else "🟠" if p['stock_quantity'] <= 5 else "🟡"
                        data_parts.append(f"   {emoji} {p['product_name']}: **{p['stock_quantity']}** restant(s)")
                
                if not low_stock and not out_of_stock:
                    data_parts.append("✅ **Excellent!** Tous les stocks sont à un niveau satisfaisant.")

            # ============ Clients ============
            elif any(word in msg for word in ["client", "clients", "customer", "utilisateur", "user"]):
                stats = db_service.get_customer_stats()
                segments = db_service.get_customer_segments()
                top_customers = db_service.get_top_customers(5)
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    👥 ANALYSE CLIENTS                         ║
╚══════════════════════════════════════════════════════════════╝

📊 **STATISTIQUES GÉNÉRALES**
┌─────────────────────────────────────────┐
│ 👥  Total clients      : {self._format_number(stats.get('total_customers', 0), 0)}
│ 🆕  Nouveaux (30j)     : {self._format_number(stats.get('new_customers_30d', 0), 0)}
│ 📅  Nouveaux (7j)      : {self._format_number(stats.get('new_customers_7d', 0), 0)}
│ ✅  Actifs             : {self._format_number(stats.get('active_customers', 0), 0)}
└─────────────────────────────────────────┘""")

                if segments:
                    data_parts.append("\n📊 **SEGMENTATION CLIENTS**")
                    for seg in segments:
                        emoji = {"VIP": "👑", "Régulier": "⭐", "Nouveau": "🆕", "Occasionnel": "👤", "Inactif": "😴"}.get(seg['segment'], "📊")
                        data_parts.append(f"   {emoji} {seg['segment']}: {seg['customer_count']} clients (moy: {self._format_number(seg['avg_revenue'])}€)")

                if top_customers:
                    data_parts.append("\n🏆 **TOP 5 CLIENTS (par CA)**")
                    for i, c in enumerate(top_customers, 1):
                        data_parts.append(f"   {i}. {c['customer_name']}: {self._format_number(c['total_spent'])}€ ({c['order_count']} cmd)")

            # ============ Commandes récentes ============
            elif any(word in msg for word in ["commande", "commandes", "order", "orders", "récent"]):
                orders = db_service.get_recent_orders(10)
                status = db_service.get_orders_by_status()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    📋 GESTION COMMANDES                       ║
╚══════════════════════════════════════════════════════════════╝
""")

                if status:
                    data_parts.append("📊 **RÉPARTITION PAR STATUT**")
                    status_emoji = {"COMPLETED": "✅", "PENDING": "⏳", "CANCELLED": "❌", "SHIPPED": "🚚", "PROCESSING": "⚙️"}
                    for s in status:
                        emoji = status_emoji.get(s['status'], "📦")
                        data_parts.append(f"   {emoji} {s['status']}: {s['order_count']} commandes ({self._format_number(s.get('total_value', 0))}€)")

                if orders:
                    data_parts.append("\n📋 **10 DERNIÈRES COMMANDES**")
                    for o in orders:
                        date_str = o['date_of_sale'].strftime('%d/%m %H:%M') if o.get('date_of_sale') else 'N/A'
                        status_emoji = {"COMPLETED": "✅", "PENDING": "⏳", "CANCELLED": "❌"}.get(o.get('status'), "📦")
                        data_parts.append(f"   {status_emoji} #{o['id']} | {date_str} | {self._format_number(o.get('total_amount', 0))}€ | {o['customer_name']}")

            # ============ Avis / Reviews / Satisfaction ============
            elif any(word in msg for word in ["avis", "review", "note", "satisfaction", "rating", "évaluation"]):
                reviews_summary = db_service.get_reviews_summary()
                recent_reviews = db_service.get_recent_reviews(5)
                worst = db_service.get_worst_rated_products()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⭐ SATISFACTION CLIENTS                    ║
╚══════════════════════════════════════════════════════════════╝

📊 **RÉSUMÉ DES AVIS**
┌─────────────────────────────────────────┐
│ 💬  Total avis         : {self._format_number(reviews_summary.get('total_reviews', 0), 0)}
│ ⭐  Note moyenne       : {self._format_number(reviews_summary.get('avg_rating', 0), 2)}/5
│ 😊  Positifs (≥4⭐)    : {reviews_summary.get('positive_reviews', 0)}
│ 😐  Neutres (3⭐)      : {reviews_summary.get('neutral_reviews', 0)}
│ 😞  Négatifs (≤2⭐)    : {reviews_summary.get('negative_reviews', 0)}
│ 📅  Cette semaine      : {reviews_summary.get('reviews_last_7d', 0)}
└─────────────────────────────────────────┘""")

                if worst:
                    data_parts.append("\n⚠️ **PRODUITS À SURVEILLER (notes basses)**")
                    for p in worst[:5]:
                        stars = "⭐" * int(float(p.get('avg_rating', 0)))
                        data_parts.append(f"   • {p['product_name']}: {stars} ({p['avg_rating']}/5 - {p['review_count']} avis)")

                if recent_reviews:
                    data_parts.append("\n💬 **DERNIERS AVIS**")
                    for r in recent_reviews[:5]:
                        stars = "⭐" * int(r.get('rating', 0))
                        comment = (r.get('comment', 'Pas de commentaire') or 'Pas de commentaire')[:50]
                        data_parts.append(f"   • {r['product_name']}: {stars} - \"{comment}...\"")

            # ============ Alertes ============
            elif any(word in msg for word in ["alerte", "alert", "problème", "issue", "attention", "warning"]):
                alerts = db_service.get_alerts()
                insights = db_service.get_business_insights()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    🔔 ALERTES & INSIGHTS                      ║
╚══════════════════════════════════════════════════════════════╝
""")
                
                if alerts.get('critical'):
                    data_parts.append("🚨 **ALERTES CRITIQUES**")
                    for a in alerts['critical']:
                        data_parts.append(f"   {a}")
                
                if alerts.get('warning'):
                    data_parts.append("\n⚠️ **AVERTISSEMENTS**")
                    for a in alerts['warning']:
                        data_parts.append(f"   {a}")
                
                if alerts.get('info'):
                    data_parts.append("\nℹ️ **INFORMATIONS**")
                    for a in alerts['info']:
                        data_parts.append(f"   {a}")
                
                if insights.get('insights'):
                    data_parts.append("\n💡 **INSIGHTS BUSINESS**")
                    for i in insights['insights']:
                        data_parts.append(f"   {i}")
                
                if not any([alerts.get('critical'), alerts.get('warning'), alerts.get('info')]):
                    data_parts.append("✅ **Aucune alerte!** Tout fonctionne bien.")

            # ============ Tendances / Croissance ============
            elif any(word in msg for word in ["tendance", "trend", "évolution", "croissance", "growth", "progression"]):
                comparison = db_service.get_kpi_comparison()
                trend = db_service.get_sales_trend("week")[:8]
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    📈 TENDANCES & CROISSANCE                  ║
╚══════════════════════════════════════════════════════════════╝
""")
                
                if comparison:
                    revenue_growth = float(comparison.get('revenue_growth', 0))
                    orders_growth = float(comparison.get('orders_growth', 0))
                    
                    data_parts.append(f"""📊 **COMPARAISON MENSUELLE**
┌─────────────────────────────────────────┐
│ 💰 Revenu ce mois     : {self._format_number(comparison.get('current_revenue', 0))}€
│ 💰 Revenu mois préc.  : {self._format_number(comparison.get('previous_revenue', 0))}€
│ {"📈" if revenue_growth >= 0 else "📉"} Évolution revenu  : {revenue_growth:+.1f}%
│ {"📈" if orders_growth >= 0 else "📉"} Évolution commandes: {orders_growth:+.1f}%
└─────────────────────────────────────────┘""")

                if trend:
                    data_parts.append("\n📅 **TENDANCE HEBDOMADAIRE (8 dernières semaines)**")
                    for t in trend:
                        week_str = t['period'].strftime('Sem %W') if t.get('period') else 'N/A'
                        data_parts.append(f"   • {week_str}: {self._format_number(t.get('revenue', 0))}€ ({t.get('order_count', 0)} cmd, {t.get('unique_customers', 0)} clients)")

            # ============ Recommandations ============
            elif any(word in msg for word in ["recommandation", "conseil", "suggestion", "améliorer", "optimiser"]):
                alerts = db_service.get_alerts()
                slow_moving = db_service.get_slow_moving_products()
                worst_rated = db_service.get_worst_rated_products()
                
                data_parts.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    💡 RECOMMANDATIONS                         ║
╚══════════════════════════════════════════════════════════════╝
""")
                
                recommendations = []
                
                if alerts.get('critical'):
                    recommendations.append("🚨 **URGENT**: " + "; ".join(alerts['critical']))
                
                if alerts.get('warning'):
                    recommendations.append("⚠️ **ATTENTION**: " + "; ".join(alerts['warning']))
                
                if slow_moving:
                    recommendations.append(f"📦 **Stock dormant**: {len(slow_moving)} produit(s) avec peu de ventes. Envisagez des promotions.")
                
                if worst_rated:
                    recommendations.append(f"⭐ **Qualité**: {len(worst_rated)} produit(s) avec notes basses. Analysez les avis négatifs.")
                
                if not recommendations:
                    recommendations.append("✅ Votre boutique performe bien! Continuez ainsi.")
                
                for i, r in enumerate(recommendations, 1):
                    data_parts.append(f"{i}. {r}")

        except Exception as e:
            print(f"Error fetching DB data: {e}")
            traceback.print_exc()
            data_parts.append(f"⚠️ Erreur lors de la récupération des données: {str(e)}")

        return "\n".join(data_parts) if data_parts else ""

    def chat(self, session_id: str, message: str, real_time_data: Optional[Dict] = None) -> str:
        history = self._get_session_history(session_id)
        
        # Fast path for simple greetings
        greeting_response = self._is_simple_greeting(message)
        if greeting_response:
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": greeting_response})
            return greeting_response

        # Get database data based on question intent
        db_data = self._detect_intent_and_get_data(message)
        
        # If we got structured data, return it directly for better formatting
        if db_data and len(db_data) > 100:
            # Add a brief LLM-generated insight at the end
            try:
                insight_prompt = f"""Basé sur ces données business, donne UNE recommandation courte et actionable (max 2 phrases):

{db_data[:1500]}

Question initiale: {message}

Recommandation:"""
                
                insight = self.llm.invoke(insight_prompt)
                
                # Clean up the insight
                insight = insight.strip()
                if insight and len(insight) > 10:
                    db_data += f"\n\n💡 **Insight**: {insight}"
            except Exception as e:
                print(f"Error generating insight: {e}")
            
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": db_data})
            return db_data

        # For more open-ended questions, use the LLM with context
        context = self._build_context(message) if len(message) > 15 else ""
        history_text = self._format_history(history)
        
        # Get some basic stats for context
        try:
            summary = db_service.get_database_summary()
            basic_context = f"""Contexte actuel de la boutique:
- {summary.get('products_count', 0)} produits, {summary.get('orders_count', 0)} commandes, {summary.get('users_count', 0)} clients
- Revenu total: {self._format_number(summary.get('total_revenue', 0))}€, Note moyenne: {self._format_number(summary.get('avg_rating', 0), 1)}/5"""
        except:
            basic_context = ""

        prompt = f"""Tu es un assistant analytique expert e-commerce avec accès à la base de données PostgreSQL.
Réponds en français de manière professionnelle mais accessible.
Utilise des emojis pour rendre la réponse plus visuelle.
Sois concis mais informatif.

{basic_context}

{f"Contexte documentaire: {context}" if context else ""}

{f"Historique récent: {history_text}" if history_text else ""}

Question: {message}

Réponse (si tu n'as pas les données spécifiques, suggère les questions que l'utilisateur peut poser):"""

        try:
            response = self.llm.invoke(prompt)
            
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": response})

            if len(history) > 10:
                self.sessions[session_id] = history[-10:]

            return response
        except Exception as e:
            print(f"Error in chat: {e}")
            return f"❌ Désolé, une erreur s'est produite: {str(e)}\n\n💡 Essayez de reformuler votre question ou demandez les KPIs pour commencer."

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
    """Pre-initialize chatbot at startup"""
    global _chatbot_instance, _init_error
    try:
        if _chatbot_instance is None:
            print("Pre-initializing chatbot...")
            _chatbot_instance = AnalyticsChatbot()
            print("Chatbot pre-initialization complete!")
    except Exception as e:
        _init_error = str(e)
        print(f"Chatbot pre-initialization failed: {e}")
