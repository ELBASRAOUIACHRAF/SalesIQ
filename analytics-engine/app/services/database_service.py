import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

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
    """Service pour exécuter des requêtes de données pour le chatbot"""

    @staticmethod
    def get_sales_summary(days: int = 30) -> Dict[str, Any]:
        """Résumé des ventes des X derniers jours"""
        query = """
        SELECT 
            COUNT(DISTINCT s.id) as total_orders,
            COALESCE(SUM(sp.quantity * sp.unit_price), 0) as total_revenue,
            COALESCE(AVG(sp.quantity * sp.unit_price), 0) as avg_order_value,
            COUNT(DISTINCT s.users_id) as unique_customers
        FROM sale s
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '%s days'
        """
        return execute_single(query, (days,)) or {}

    @staticmethod
    def get_top_products(limit: int = 10) -> List[Dict]:
        """Top produits par revenus"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            COUNT(sp.id) as times_ordered,
            SUM(sp.quantity) as total_quantity,
            SUM(sp.quantity * sp.unit_price) as total_revenue
        FROM sold_product sp
        JOIN product p ON sp.product_id = p.id
        JOIN sale s ON sp.sale_id = s.id
        LEFT JOIN category c ON p.category_id = c.id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.id, p.name, c.name
        ORDER BY total_revenue DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_top_categories() -> List[Dict]:
        """Top catégories par revenus"""
        query = """
        SELECT 
            c.name as category,
            COUNT(DISTINCT s.id) as order_count,
            SUM(sp.quantity) as total_quantity,
            SUM(sp.quantity * sp.unit_price) as total_revenue
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
    def get_customer_stats() -> Dict[str, Any]:
        """Statistiques clients"""
        query = """
        SELECT 
            COUNT(DISTINCT id) as total_customers,
            COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN id END) as new_customers_30d,
            COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN id END) as new_customers_7d
        FROM users
        WHERE role = 'USER' OR role IS NULL
        """
        return execute_single(query) or {}

    @staticmethod
    def get_low_stock_products(threshold: int = 10) -> List[Dict]:
        """Produits avec stock bas"""
        query = """
        SELECT 
            p.name as product_name,
            c.name as category,
            p.stock as stock_quantity,
            p.price
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        WHERE p.stock <= %s AND p.is_active = true
        ORDER BY p.stock ASC
        LIMIT 20
        """
        return execute_query(query, (threshold,))

    @staticmethod
    def get_recent_orders(limit: int = 10) -> List[Dict]:
        """Commandes récentes"""
        query = """
        SELECT 
            s.id,
            s.date_of_sale,
            SUM(sp.quantity * sp.unit_price) as total_amount,
            s.status,
            COALESCE(u.first_name || ' ' || u.last_name, 'Client') as customer_name
        FROM sale s
        LEFT JOIN sold_product sp ON s.id = sp.sale_id
        LEFT JOIN users u ON s.users_id = u.id
        GROUP BY s.id, s.date_of_sale, s.status, u.first_name, u.last_name
        ORDER BY s.date_of_sale DESC
        LIMIT %s
        """
        return execute_query(query, (limit,))

    @staticmethod
    def get_product_by_name(name: str) -> List[Dict]:
        """Rechercher un produit par nom"""
        query = """
        SELECT 
            p.name,
            c.name as category,
            p.price,
            p.stock as stock_quantity,
            p.description
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        WHERE LOWER(p.name) LIKE LOWER(%s)
        LIMIT 5
        """
        return execute_query(query, (f"%{name}%",))

    @staticmethod
    def get_sales_by_period(period: str = "day") -> List[Dict]:
        """Ventes par période (day, week, month)"""
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
            SUM(sp.quantity * sp.unit_price) as revenue
        FROM sale s
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE s.date_of_sale >= CURRENT_DATE - INTERVAL '{interval}'
        GROUP BY DATE_TRUNC('{date_trunc}', s.date_of_sale)
        ORDER BY period DESC
        """
        return execute_query(query)

    @staticmethod
    def get_customer_orders(customer_name: str) -> List[Dict]:
        """Commandes d'un client spécifique"""
        query = """
        SELECT 
            s.id,
            s.date_of_sale,
            SUM(sp.quantity * sp.unit_price) as total_amount,
            s.status
        FROM sale s
        JOIN users u ON s.users_id = u.id
        JOIN sold_product sp ON s.id = sp.sale_id
        WHERE LOWER(u.first_name || ' ' || u.last_name) LIKE LOWER(%s)
           OR LOWER(u.email) LIKE LOWER(%s)
        GROUP BY s.id, s.date_of_sale, s.status
        ORDER BY s.date_of_sale DESC
        LIMIT 10
        """
        pattern = f"%{customer_name}%"
        return execute_query(query, (pattern, pattern))

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
    def get_product_reviews(product_name: str = None) -> List[Dict]:
        """Avis sur les produits"""
        if product_name:
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
            WHERE LOWER(p.name) LIKE LOWER(%s)
            ORDER BY r.review_date DESC
            LIMIT 10
            """
            return execute_query(query, (f"%{product_name}%",))
        else:
            query = """
            SELECT 
                p.name as product_name,
                r.rating,
                r.comment,
                r.review_date
            FROM reviews r
            JOIN product p ON r.product_id = p.id
            ORDER BY r.review_date DESC
            LIMIT 10
            """
            return execute_query(query)

    @staticmethod
    def get_all_categories() -> List[Dict]:
        """Liste de toutes les catégories"""
        query = """
        SELECT 
            c.name,
            c.description,
            COUNT(p.id) as product_count
        FROM category c
        LEFT JOIN product p ON c.id = p.category_id AND p.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id, c.name, c.description
        ORDER BY product_count DESC
        """
        return execute_query(query)


# Singleton instance
db_service = DatabaseQueryService()
