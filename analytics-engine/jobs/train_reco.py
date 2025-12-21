import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
import joblib
import logging
import os

# Configuration des logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURATION BDD ---
# Pour PostgreSQL : "postgresql://user:password@host/dbname"
DB_CONNECTION_STR = os.getenv("DB_URL", "postgresql://postgres:0668856255@localhost:5432/SalesIQDB")

def fetch_data():

    logging.info("Connexion à la base de données...")
    engine = create_engine(DB_CONNECTION_STR)
    
    # On joint la table Category pour avoir le nom, plus parlant que l'ID
    query = """
    SELECT 
        p.id, 
        p.name, 
        p.mark, 
        p.price, 
        c.name as category_name
    FROM product p
    LEFT JOIN category c ON p.category_id = c.id
    """
    
    df = pd.read_sql(query, engine)
    logging.info(f"{len(df)} produits chargés.")
    
    
    # df['description'] = df['description'].fillna('')
    df['mark'] = df['mark'].fillna('Unknown')
    df['category_name'] = df['category_name'].fillna('General')
    
    return df

def build_pipeline():
    

    # text_features = 'name'
    text_transformer = TfidfVectorizer(stop_words='english', max_features=5000)
    
    # OneHotEncoder transforme "Nike" en [0, 1, 0...]
    categorical_features = ['mark', 'category_name']
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    # Le prix est important : on ne recommande pas un produit à 1000$ si on regarde un produit à 10$
    numeric_features = ['price']
    numeric_transformer = MinMaxScaler()

    # D. Assemblage du préprocesseur
    preprocessor = ColumnTransformer(
        transformers=[
            ('txt', text_transformer, 'name'),
            ('cat', categorical_transformer, categorical_features),
            ('num', numeric_transformer, numeric_features)
        ]
    )
    
    # E. Le modèle KNN
    # metric='cosine' est souvent meilleur pour le texte et la recommandation que la distance euclidienne
    model = NearestNeighbors(n_neighbors=10, algorithm='brute', metric='cosine')

    return Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])

def train():
    df = fetch_data()
    
    # Création d'une colonne combinée pour le TF-IDF
    # On donne plus de poids au nom (x2) qu'à la description
    # df['combined_text'] = (df['name'] + " ") * 2 # + df['description']

    logging.info("Début de l'entraînement du modèle...")
    pipeline = build_pipeline()
    
    # Le pipeline gère tout : transformation + fit
    pipeline.fit(df)
    
    logging.info("Entraînement terminé.")
    
    # --- SAUVEGARDE ---
    # 1. Le pipeline complet (pour pouvoir transformer les nouveaux produits à la volée si besoin)
    # 2. Les données de référence (surtout le mapping Index <-> ID BDD)
    
    artifact = {
        "pipeline": pipeline,
        "product_ids": df['id'].tolist(), # Mapping crucial : Index 0 -> Product ID 542
        "product_data": df.to_dict(orient='records') # Optionnel : pour renvoyer les détails vite
    }
    
    save_path = os.path.join(os.getcwd(), 'ml_models', 'salesiq_reco_v1.pkl')

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    joblib.dump(artifact, save_path)
    logging.info(f"Modèle sauvegardé avec succès dans : {save_path}")

if __name__ == "__main__":
    train()