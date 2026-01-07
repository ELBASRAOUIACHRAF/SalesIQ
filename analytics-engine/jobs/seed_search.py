import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document


current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
chroma_path = os.path.join(project_root, "chroma_db")



# Modèle qui comprend le Français, l'Anglais, l'Espagnol, etc.
# EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
# 2. Configuration IA
EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

DB_CONNECTION_STR = os.getenv("DB_URL", "postgresql://postgres:0668856255@localhost:5432/SalesIQDB")


def get_db_connection():
    try:
        return psycopg2.connect(
            host="localhost",
            port="5432",
            database="SalesIQDB",
            user="postgres",
            password="Aa123890"
        )
    except Exception as e:
        print(f"Erreur de connexion DB: {e}")
        sys.exit(1)

def fetch_products():
    query = """
    SELECT 
        p.id, p.name, p.description, p.price, p.mark, p.image_url,
        c.name as category_name
    FROM product p
    LEFT JOIN category c ON p.category_id = c.id
    WHERE p.is_active = true
    """
    conn = get_db_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query)
        products = cur.fetchall()
    conn.close()
    return products

def seed_chroma():
    print(f"Démarrage de l'indexation dans : {chroma_path}")
    
    products = fetch_products()
    print(f"{len(products)} produits trouvés dans PostgreSQL.")

    if not products:
        print("Aucun produit à indexer.")
        return

    # 2. Préparer les Documents pour LangChain
    documents = []
    for p in products:
        
        text_content = f"{p['name']} {p['category_name'] or ''} {p['mark'] or ''} {p['description'] or ''}"
        
        doc = Document(
            page_content=text_content,
            metadata={
                "id": p["id"],
                "name": p["name"],
                "price": float(p["price"]) if p["price"] else 0.0,
                "category": p["category_name"] or "General",
                "imageUrl": p["image_url"] or ""
            }
        )
        documents.append(doc)

    # 3. Initialiser ChromaDB (et effacer l'ancienne collection pour éviter les doublons)
    vector_db = Chroma(
        persist_directory=chroma_path,
        embedding_function=EMBEDDING_MODEL,
        collection_name="products_catalog"
    )
    
    # ids_to_delete = vector_db.get()['ids']
    # if ids_to_delete:
    #     vector_db.delete(ids_to_delete)
    
    print("Vectorisation et insertion en cours (cela peut prendre quelques secondes)...")
    
    vector_db.add_documents(documents)
    
    print("Indexation terminée avec succès !")

if __name__ == "__main__":
    seed_chroma()