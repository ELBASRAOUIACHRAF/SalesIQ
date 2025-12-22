from itertools import combinations
from app.api.models.mba_model import (
    MarketBasketRequest,
    AssociationRule
)
 

def market_basket_analysis(request: MarketBasketRequest):
    transactions = request.transactions
    minSupport = request.minSupport
    minConfidence = request.minConfidence
    total_transactions = len(transactions)

    product_count = {}
    pair_count = {}

    for t in transactions:
        product_ids = list(t.keys())
        for pid in product_ids:
            product_count[pid] = product_count.get(pid, 0) + 1
        for a, b in combinations(sorted(product_ids), 2):
            key = (a, b)
            pair_count[key] = pair_count.get(key, 0) + 1

    rules = []
    for (a, b), count in pair_count.items():
        support = count / total_transactions
        confidence_ab = count / product_count[a]
        confidence_ba = count / product_count[b]

        if support >= minSupport and confidence_ab >= minConfidence:
            rules.append(AssociationRule(productA=str(a), productB=str(b), support=support, confidence=confidence_ab))
        if support >= minSupport and confidence_ba >= minConfidence:
            rules.append(AssociationRule(productA=str(b), productB=str(a), support=support, confidence=confidence_ba))

    return rules