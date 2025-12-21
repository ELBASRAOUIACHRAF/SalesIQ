import joblib
import os
import logging
import pandas as pd
import numpy as np

# Configuration des chemins
# analytics-engine/app/services/recommendation_service.py -> on remonte à analytics-engine/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "ml_models", "salesiq_reco_v1.pkl")

class RecommendationService:
    def __init__(self):
        self.pipeline = None
        self.product_ids = []
        self.df_products = None  # Pour stocker les données brutes (prix, cat, etc.)
        self.load_model()

    def load_model(self):
        """Charge le modèle et les données de référence en mémoire."""
        if os.path.exists(MODEL_PATH):
            try:
                artifact = joblib.load(MODEL_PATH)
                self.pipeline = artifact["pipeline"]
                self.product_ids = artifact["product_ids"]
                # On charge les données produits dans un DataFrame pour faciliter la recherche
                self.df_products = pd.DataFrame(artifact["product_data"])
                
                logging.info(f"✅ Modèle chargé depuis : {MODEL_PATH}")
                logging.info(f"📊 {len(self.df_products)} produits indexés en mémoire.")
            except Exception as e:
                logging.error(f"❌ Erreur critique lors du chargement du modèle : {e}")
        else:
            logging.warning(f"⚠️ Fichier modèle introuvable : {MODEL_PATH}")

    def get_recommendations(self, product_id: int, n_neighbors: int = 5):
        """
        Retourne une liste d'IDs de produits recommandés.
        """
        # 1. Vérifications de base
        if self.pipeline is None or self.df_products is None:
            logging.warning("Tentative de recommandation sans modèle chargé.")
            return []

        # 2. Récupérer les données du produit cible (Target)
        # On cherche la ligne correspondant à l'ID dans notre DataFrame en mémoire
        target_product = self.df_products[self.df_products['id'] == product_id]

        if target_product.empty:
            logging.warning(f"Produit ID {product_id} inconnu dans les données d'entraînement.")
            return []

        try:
            # 3. Accéder aux étapes du pipeline
            # 'preprocessor' transforme les données brutes en vecteur numérique
            # 'model' est le NearestNeighbors qui calcule les distances
            preprocessor = self.pipeline.named_steps['preprocessor']
            knn_model = self.pipeline.named_steps['model']

            # 4. Transformer le produit cible en vecteur (Vectorization)
            # Le preprocessor attend un DataFrame, on lui passe la ligne trouvée
            query_vector = preprocessor.transform(target_product)

            # 5. Trouver les voisins (Inference)
            # On demande n_neighbors + 1 car le voisin le plus proche est toujours le produit lui-même (distance 0)
            distances, indices = knn_model.kneighbors(query_vector, n_neighbors=n_neighbors + 1)

            # 6. Convertir les indices (0, 1, 2...) en Product IDs (504, 202, 110...)
            # flatten() aplatit le tableau numpy. [1:] exclut le premier résultat (le produit lui-même)
            recommended_indices = indices.flatten()[1:]
            
            # On map les indices trouvés vers les vrais IDs stockés dans self.product_ids
            recommended_ids = [self.product_ids[i] for i in recommended_indices]

            return recommended_ids

        except Exception as e:
            logging.error(f"Erreur lors du calcul des recommandations : {e}")
            return []

# Singleton pour être importé ailleurs
reco_service = RecommendationService()

if __name__ == "__main__":
    
    # ⚠️ IMPORTANT : Mettez ici un ID qui existe vraiment dans votre base de données !
    test_id = 30  
    
    print(f"--- Test manuel pour le produit ID {test_id} ---")
    
    recos = reco_service.get_recommendations(test_id)
    
    print(f"Résultat : {recos}")