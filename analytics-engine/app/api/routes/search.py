from fastapi import APIRouter
from app.api.models.search_schema import ProductIndex
from app.services.search_service import search_service

router = APIRouter()

# @router.post("/index-product")
# def index_product_endpoint(product: ProductIndex):
#     """
#     Appelé par Spring Boot lors de la création/modif d'un produit
#     """
#     search_service.index_product(product)
#     return {"status": "indexed", "id": product.id}

@router.get("/search")
def search_endpoint(q: str, min_price: float = 0, max_price: float = 1000000):
    """
    Appelé par Angular pour la barre de recherche
    """
    return search_service.search(q, min_price, max_price)