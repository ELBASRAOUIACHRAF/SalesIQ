import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
from datetime import datetime, timedelta

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "SalesIQDB",
    "user": "postgres",
    "password": "Aa123890"
}


@contextmanager
def get_connection():
    """Context manager for database connections"""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        yield conn
    finally:
        if conn:
            conn.close()


def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return results as list of dicts"""
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]


def execute_single(query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
    """Execute a query and return single result"""
    results = execute_query(query, params)
    return results[0] if results else None


class DatabaseQueryService:
    """Service pour exécuter des requêtes de données pour le chatbot analytique"""

    # ========== KPIs & RÉSUMÉ ==========
    
    @staticmethod
    def get_database_summary() -> Dict[str, Any]:
        """Résumé complet de la base de données"""
        query = """
        SELECT 
            (SELECT COUNT(*) FROM product WHERE is_active = true) as products_count,
            (SELECT COUNT(*) FROM sale) as orders_count,
            (SELECT COUNT(*) FROM users WHERE role = 'USER' OR role IS NULL) as users_count,
            (SELECT COUNT(*) FROM category WHERE is_active = true) as categories_count,
            (SELECT COALESCE(SUM(sp.quantity * sp.unit_price), 0) FROM sold_product sp) as total_revenue,
            (SELECT COALESCE(AVG(sp.quantity * sp.unit_price), 0) FROM sold_product sp) as avg_order_value,
            (SELECT COUNT(*) FROM reviews) as reviews_count,
            (SELECT COALESCE(AVG(rating), 0) FROM reviews) as avg_rating
        """
        return execute_single(query) or {}

    @staticmethod
    def get_sales_summary(days: int = 30) -> Dict[str, Any]:
        """Résumé des ventes des X derniers jours"""
        query = """
        SELECT 
            COUNT(DISTINCT s.id) as total_orders,
            COALESCE(SUM(sp.quantity * sp.unit_price), 0) as total_revenue,
            COALESCE(AVG(sp.quantity * sp.unit_price), 0) as avg_order_value,
            COUNT(DISTINCT s.users_id) as unique_customers,
            SUM(sp.quantity) as total_items_sold
        FROM sale s
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '%s days'
        """
        return execute_single(query, (days,)) or {}

    @staticmethod
    def get_kpi_comparison() -> Dict[str, Any]:
        """Compare les KPIs ce mois vs mois précédent"""
        query = """
        WITH current_month AS (
            SELECT 
                COUNT(DISTINCT s.id) as orders,
                COALESCE(SUM(sp.quantity * sp.unit_price), 0) as revenue,
                COUNT(DISTINCT s.users_id) as customers
            FROM sale s
            JOIN sold_product sp ON s.id = sp.sale_id
            WHERE DATE_TRUNC('month', s.date_of_sale) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        previous_month AS (
            SELECT 
                COUNT(DISTINCT s.id) as orders,
                COALESCE(SUM(sp.quantity * sp.unit_price), 0) as revenue,
                COUNT(DISTINCT s.users_id) as customers
            FROM sale s
            JOIN sold_product sp ON s.id = sp.sale_id
            WHERE DATE_TRUNC('month', s.date_of_sale) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        )
        SELECT 
            cm.orders as current_orders,
            cm.revenue as current_revenue,
            cm.customers as current_customers,
            pm.orders as previous_orders,
            pm.revenue as previous_revenue,
            pm.customers as previous_customers,
            CASE WHEN pm.revenue > 0 THEN ROUND(((cm.revenue - pm.revenue) / pm.revenue * 100)::numeric, 1) ELSE 0 END as revenue_growth,
            CASE WHEN pm.orders > 0 THEN ROUND(((cm.orders - pm.orders)::numeric / pm.orders * 100)::numeric, 1) ELSE 0 END as orders_growth
        FROM current_month cm, previous_month pm
        """
        return execute_single(query) or {}

    # ========== PRODUITS ==========

    @staticmethod
    def get_top_products(limit: int = 10) -> List[Dict]:
        """Top produits par revenus"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            COUNT(sp.id) as times_ordered,
            SUM(sp.quantity) as total_quantity,
            SUM(sp.quantity * sp.unit_price) as total_revenue,
            p.price as unit_price,
            p.stock as current_stock
        FROM sold_product sp
        JOIN product p ON sp.product_id = p.id
        JOIN sale s ON sp.sale_id = s.id
        LEFT JOIN category c ON p.category_id = c.id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.id, p.name, c.name, p.price, p.stock
        ORDER BY total_revenue DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_product_performance(product_name: str = None) -> List[Dict]:
        """Analyse détaillée des performances produit"""
        if product_name:
            query = """
            SELECT 
                p.name as product_name,
                c.name as category,
                p.price,
                p.stock,
                COALESCE(SUM(sp.quantity), 0) as total_sold,
                COALESCE(SUM(sp.quantity * sp.unit_price), 0) as total_revenue,
                COUNT(DISTINCT sp.sale_id) as order_count,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(DISTINCT r.id) as review_count
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN sold_product sp ON p.id = sp.product_id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE LOWER(p.name) LIKE LOWER(%s) AND p.is_active = true
            GROUP BY p.id, p.name, c.name, p.price, p.stock
            ORDER BY total_revenue DESC
            LIMIT 5
            """
            return execute_query(query, (f"%{product_name}%",))
        else:
            query = """
            SELECT 
                p.name as product_name,
                c.name as category,
                p.price,
                p.stock,
                COALESCE(SUM(sp.quantity), 0) as total_sold,
                COALESCE(SUM(sp.quantity * sp.unit_price), 0) as total_revenue,
                COUNT(DISTINCT sp.sale_id) as order_count,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(DISTINCT r.id) as review_count
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN sold_product sp ON p.id = sp.product_id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.is_active = true
            GROUP BY p.id, p.name, c.name, p.price, p.stock
            ORDER BY total_revenue DESC
            LIMIT 10
            """
            return execute_query(query)

    @staticmethod
    def get_low_stock_products(threshold: int = 10) -> List[Dict]:
        """Produits avec stock bas"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            p.stock as stock_quantity,
            p.price,
            COALESCE(AVG(sp.quantity), 0) as avg_daily_sales
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        LEFT JOIN sold_product sp ON p.id = sp.product_id
        WHERE p.stock <= %s AND p.is_active = true
        GROUP BY p.id, p.name, c.name, p.stock, p.price
        ORDER BY p.stock ASC
        LIMIT 20
        """
        return execute_query(query, (threshold,))

    @staticmethod
    def get_out_of_stock_products() -> List[Dict]:
        """Produits en rupture de stock"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            p.price,
            COALESCE(SUM(sp.quantity), 0) as recent_demand
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        LEFT JOIN sold_product sp ON p.id = sp.product_id
        LEFT JOIN sale s ON sp.sale_id = s.id AND s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
        WHERE p.stock <= 0 AND p.is_active = true
        GROUP BY p.id, p.name, c.name, p.price
        ORDER BY recent_demand DESC
        """
        return execute_query(query)

    @staticmethod
    def get_slow_moving_products() -> List[Dict]:
        """Produits à rotation lente (peu vendus)"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            p.stock,
            p.price,
            COALESCE(SUM(sp.quantity), 0) as total_sold_30d
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        LEFT JOIN sold_product sp ON p.id = sp.product_id
        LEFT JOIN sale s ON sp.sale_id = s.id AND s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
        WHERE p.is_active = true AND p.stock > 0
        GROUP BY p.id, p.name, c.name, p.stock, p.price
        HAVING COALESCE(SUM(sp.quantity), 0) < 3
        ORDER BY total_sold_30d ASC, p.stock DESC
        LIMIT 10
        """
        return execute_query(query)

    # ========== CATÉGORIES ==========

    @staticmethod
    def get_top_categories() -> List[Dict]:
        """Top catégories par revenus"""
        query = """
        SELECT 
            c.name as category,
            COUNT(DISTINCT p.id) as product_count,
            COUNT(DISTINCT s.id) as order_count,
            SUM(sp.quantity) as total_quantity,
            SUM(sp.quantity * sp.unit_price) as total_revenue,
            AVG(sp.quantity * sp.unit_price) as avg_order_value
        FROM sold_product sp
        JOIN product p ON sp.product_id = p.id
        JOIN sale s ON sp.sale_id = s.id
        LEFT JOIN category c ON p.category_id = c.id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
        LIMIT 10
        """
        return execute_query(query)

    @staticmethod
    def get_category_details(category_name: str = None) -> List[Dict]:
        """Détails d'une catégorie spécifique"""
        if category_name:
            query = """
            SELECT 
                c.name as category,
                c.description,
                COUNT(p.id) as product_count,
                SUM(p.stock) as total_stock,
                AVG(p.price) as avg_price,
                MIN(p.price) as min_price,
                MAX(p.price) as max_price
            FROM category c
            LEFT JOIN product p ON c.id = p.category_id AND p.is_active = true
            WHERE c.is_active = true AND LOWER(c.name) LIKE LOWER(%s)
            GROUP BY c.id, c.name, c.description
            """
            return execute_query(query, (f"%{category_name}%",))
        else:
            query = """
            SELECT 
                c.name as category,
                c.description,
                COUNT(p.id) as product_count,
                SUM(p.stock) as total_stock,
                AVG(p.price) as avg_price
            FROM category c
            LEFT JOIN product p ON c.id = p.category_id AND p.is_active = true
            WHERE c.is_active = true
            GROUP BY c.id, c.name, c.description
            ORDER BY product_count DESC
            """
            return execute_query(query)

    # ========== CLIENTS ==========

    @staticmethod
    def get_customer_stats() -> Dict[str, Any]:
        """Statistiques clients détaillées"""
        query = """
        SELECT 
            COUNT(DISTINCT id) as total_customers,
            COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN id END) as new_customers_30d,
            COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN id END) as new_customers_7d,
            COUNT(DISTINCT CASE WHEN active = true THEN id END) as active_customers
        FROM users
        WHERE role = 'USER' OR role IS NULL
        """
        return execute_single(query) or {}

    @staticmethod
    def get_top_customers(limit: int = 10) -> List[Dict]:
        """Meilleurs clients par revenu généré"""
        query = """
        SELECT 
            COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Client #' || u.id::text) as customer_name,
            u.email,
            COUNT(DISTINCT s.id) as order_count,
            SUM(sp.quantity * sp.unit_price) as total_spent,
            AVG(sp.quantity * sp.unit_price) as avg_order_value,
            MAX(s.date_of_sale) as last_order_date
        FROM users u
        JOIN sale s ON u.id = s.users_id
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE u.role = 'USER' OR u.role IS NULL
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY total_spent DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_customer_segments() -> List[Dict]:
        """Segmentation clients (RFM simplifié)"""
        query = """
        WITH customer_metrics AS (
            SELECT 
                u.id,
                COALESCE(u.first_name || ' ' || u.last_name, u.email) as customer_name,
                COUNT(DISTINCT s.id) as frequency,
                COALESCE(SUM(sp.quantity * sp.unit_price), 0) as monetary,
                MAX(s.date_of_sale) as last_purchase
            FROM users u
            LEFT JOIN sale s ON u.id = s.users_id
            LEFT JOIN sold_product sp ON s.id = sp.sale_id
            WHERE u.role = 'USER' OR u.role IS NULL
            GROUP BY u.id, u.first_name, u.last_name, u.email
        )
        SELECT 
            CASE 
                WHEN monetary >= 500 AND frequency >= 3 THEN 'VIP'
                WHEN monetary >= 200 OR frequency >= 2 THEN 'Régulier'
                WHEN last_purchase >= CURRENT_DATE - INTERVAL '30 days' THEN 'Nouveau'
                WHEN last_purchase < CURRENT_DATE - INTERVAL '90 days' THEN 'Inactif'
                ELSE 'Occasionnel'
            END as segment,
            COUNT(*) as customer_count,
            ROUND(AVG(monetary)::numeric, 2) as avg_revenue,
            ROUND(AVG(frequency)::numeric, 1) as avg_orders
        FROM customer_metrics
        GROUP BY 
            CASE 
                WHEN monetary >= 500 AND frequency >= 3 THEN 'VIP'
                WHEN monetary >= 200 OR frequency >= 2 THEN 'Régulier'
                WHEN last_purchase >= CURRENT_DATE - INTERVAL '30 days' THEN 'Nouveau'
                WHEN last_purchase < CURRENT_DATE - INTERVAL '90 days' THEN 'Inactif'
                ELSE 'Occasionnel'
            END
        ORDER BY avg_revenue DESC
        """
        return execute_query(query)

    # ========== COMMANDES ==========

    @staticmethod
    def get_recent_orders(limit: int = 10) -> List[Dict]:
        """Commandes récentes avec détails"""
        query = """
        SELECT 
            s.id,
            s.date_of_sale,
            SUM(sp.quantity * sp.unit_price) as total_amount,
            SUM(sp.quantity) as item_count,
            s.status,
            COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Client') as customer_name
        FROM sale s
        LEFT JOIN sold_product sp ON s.id = sp.sale_id
        LEFT JOIN users u ON s.users_id = u.id
        GROUP BY s.id, s.date_of_sale, s.status, u.first_name, u.last_name, u.email
        ORDER BY s.date_of_sale DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_orders_by_status() -> List[Dict]:
        """Répartition des commandes par statut"""
        query = """
        SELECT 
            COALESCE(s.status, 'UNKNOWN') as status,
            COUNT(*) as order_count,
            SUM(sp.quantity * sp.unit_price) as total_value
        FROM sale s
        LEFT JOIN sold_product sp ON s.id = sp.sale_id
        GROUP BY s.status
        ORDER BY order_count DESC
        """
        return execute_query(query)

    @staticmethod
    def get_sales_trend(period: str = "day") -> List[Dict]:
        """Tendance des ventes par période"""
        if period == "week":
            date_trunc = "week"
            interval = "12 weeks"
        elif period == "month":
            date_trunc = "month"
            interval = "12 months"
        else:
            date_trunc = "day"
            interval = "30 days"

        query = f"""
        SELECT 
            DATE_TRUNC('{date_trunc}', s.date_of_sale) as period,
            COUNT(DISTINCT s.id) as order_count,
            SUM(sp.quantity * sp.unit_price) as revenue,
            SUM(sp.quantity) as items_sold,
            COUNT(DISTINCT s.users_id) as unique_customers
        FROM sale s
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '{interval}'
        GROUP BY DATE_TRUNC('{date_trunc}', s.date_of_sale)
        ORDER BY period DESC
        """
        return execute_query(query)

    # ========== AVIS & SATISFACTION ==========

    @staticmethod
    def get_reviews_summary() -> Dict[str, Any]:
        """Résumé des avis clients"""
        query = """
        SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(rating)::numeric, 2) as avg_rating,
            COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
            COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews,
            COUNT(CASE WHEN rating = 3 THEN 1 END) as neutral_reviews,
            COUNT(CASE WHEN review_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as reviews_last_7d
        FROM reviews
        """
        return execute_single(query) or {}

    @staticmethod
    def get_recent_reviews(limit: int = 10) -> List[Dict]:
        """Avis récents"""
        query = """
        SELECT 
            p.name as product_name,
            r.rating,
            r.comment,
            r.review_date,
            COALESCE(u.first_name || ' ' || u.last_name, 'Anonyme') as reviewer
        FROM reviews r
        JOIN product p ON r.product_id = p.id
        LEFT JOIN users u ON r.users_id = u.id
        ORDER BY r.review_date DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_products_by_rating(min_rating: float = 4.0) -> List[Dict]:
        """Produits par note moyenne"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
            COUNT(r.id) as review_count,
            p.price
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        JOIN reviews r ON p.id = r.product_id
        WHERE p.is_active = true
        GROUP BY p.id, p.name, c.name, p.price
        HAVING AVG(r.rating) >= %s
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT 10
        """
        return execute_query(query, (min_rating,))

    @staticmethod
    def get_worst_rated_products() -> List[Dict]:
        """Produits les moins bien notés"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
            COUNT(r.id) as review_count,
            p.price
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        JOIN reviews r ON p.id = r.product_id
        WHERE p.is_active = true
        GROUP BY p.id, p.name, c.name, p.price
        HAVING COUNT(r.id) >= 1
        ORDER BY avg_rating ASC
        LIMIT 10
        """
        return execute_query(query)

    # ========== ALERTES & INSIGHTS ==========

    @staticmethod
    def get_alerts() -> Dict[str, Any]:
        """Génère des alertes basées sur les données"""
        alerts = {
            "critical": [],
            "warning": [],
            "info": []
        }
        
        try:
            # Stock critique
            low_stock = execute_query("""
                SELECT COUNT(*) as count FROM product 
                WHERE stock <= 5 AND stock > 0 AND is_active = true
            """)
            if low_stock and low_stock[0]['count'] > 0:
                alerts['warning'].append(f"⚠️ {low_stock[0]['count']} produit(s) avec stock très bas (≤5)")
            
            # Ruptures
            out_of_stock = execute_query("""
                SELECT COUNT(*) as count FROM product 
                WHERE stock <= 0 AND is_active = true
            """)
            if out_of_stock and out_of_stock[0]['count'] > 0:
                alerts['critical'].append(f"🚨 {out_of_stock[0]['count']} produit(s) en rupture de stock!")
            
            # Avis négatifs récents
            bad_reviews = execute_query("""
                SELECT COUNT(*) as count FROM reviews 
                WHERE rating <= 2 AND review_date >= CURRENT_DATE - INTERVAL '7 days'
            """)
            if bad_reviews and bad_reviews[0]['count'] > 0:
                alerts['warning'].append(f"⚠️ {bad_reviews[0]['count']} avis négatif(s) cette semaine")
            
            # Commandes en attente
            pending = execute_query("""
                SELECT COUNT(*) as count FROM sale WHERE status = 'PENDING'
            """)
            if pending and pending[0]['count'] > 5:
                alerts['info'].append(f"📋 {pending[0]['count']} commandes en attente de traitement")
        except Exception as e:
            print(f"Error getting alerts: {e}")
        
        return alerts

    @staticmethod
    def get_business_insights() -> Dict[str, Any]:
        """Génère des insights business"""
        insights = []
        
        try:
            # Comparaison mois en cours vs précédent
            comparison = execute_single("""
                WITH current_month AS (
                    SELECT COALESCE(SUM(sp.quantity * sp.unit_price), 0) as revenue
                    FROM sale s JOIN sold_product sp ON s.id = sp.sale_id
                    WHERE DATE_TRUNC('month', s.date_of_sale) = DATE_TRUNC('month', CURRENT_DATE)
                ),
                previous_month AS (
                    SELECT COALESCE(SUM(sp.quantity * sp.unit_price), 0) as revenue
                    FROM sale s JOIN sold_product sp ON s.id = sp.sale_id
                    WHERE DATE_TRUNC('month', s.date_of_sale) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                )
                SELECT cm.revenue as current, pm.revenue as previous
                FROM current_month cm, previous_month pm
            """)
            
            if comparison and comparison['previous'] and float(comparison['previous']) > 0:
                growth = ((float(comparison['current']) - float(comparison['previous'])) / float(comparison['previous'])) * 100
                if growth > 0:
                    insights.append(f"📈 Croissance de {growth:.1f}% ce mois vs mois précédent")
                elif growth < 0:
                    insights.append(f"📉 Baisse de {abs(growth):.1f}% ce mois vs mois précédent")
            
            # Meilleur jour de la semaine
            best_day = execute_single("""
                SELECT 
                    TO_CHAR(s.date_of_sale, 'Day') as day_name,
                    SUM(sp.quantity * sp.unit_price) as revenue
                FROM sale s
                JOIN sold_product sp ON s.id = sp.sale_id
                WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY TO_CHAR(s.date_of_sale, 'Day'), EXTRACT(DOW FROM s.date_of_sale)
                ORDER BY revenue DESC
                LIMIT 1
            """)
            if best_day and best_day.get('day_name'):
                insights.append(f"📅 Meilleur jour de vente: {best_day['day_name'].strip()}")
        except Exception as e:
            print(f"Error getting insights: {e}")
        
        return {"insights": insights}


# Singleton instance
db_service = DatabaseQueryService()
