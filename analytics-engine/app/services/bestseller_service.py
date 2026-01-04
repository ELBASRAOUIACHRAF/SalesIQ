import numpy as np
from typing import List
from app.api.models.bestseller_model import BestSellerInput, PotentialBestSellerResponse

def calculate_growth_rate(sales: List[float]) -> float:
    if len(sales) < 2:
        return 0.0
    
    mid = len(sales) // 2
    first_half = sum(sales[:mid]) if mid > 0 else 0
    second_half = sum(sales[mid:]) if mid < len(sales) else 0
    
    if first_half == 0:
        return 100.0 if second_half > 0 else 0.0
    
    return ((second_half - first_half) / first_half) * 100

def calculate_potential_score(product: BestSellerInput, growth_rate: float, total_sales: float) -> float:
    score = 0.0
    
    if growth_rate > 50:
        score += 30
    elif growth_rate > 25:
        score += 20
    elif growth_rate > 10:
        score += 10
    elif growth_rate > 0:
        score += 5
    
    if product.avgRating >= 4.5:
        score += 25
    elif product.avgRating >= 4.0:
        score += 20
    elif product.avgRating >= 3.5:
        score += 10
    
    if product.totalReviews >= 50:
        score += 20
    elif product.totalReviews >= 20:
        score += 15
    elif product.totalReviews >= 10:
        score += 10
    elif product.totalReviews >= 5:
        score += 5
    
    if product.daysOnMarket <= 30:
        score += 15
    elif product.daysOnMarket <= 60:
        score += 10
    elif product.daysOnMarket <= 90:
        score += 5
    
    sales_velocity = total_sales / max(product.daysOnMarket, 1)
    if sales_velocity > 100:
        score += 10
    elif sales_velocity > 50:
        score += 5
    
    return min(score, 100)

def identify_bestsellers(products: List[BestSellerInput]) -> List[PotentialBestSellerResponse]:
    if not products:
        return []
    
    results = []
    
    for product in products:
        sales_values = [s.sales for s in product.recentSales]
        total_sales = sum(sales_values) if sales_values else 0.0
        growth_rate = calculate_growth_rate(sales_values)
        potential_score = calculate_potential_score(product, growth_rate, total_sales)
        
        if potential_score >= 70:
            potential_level = "HIGH"
        elif potential_score >= 50:
            potential_level = "MEDIUM"
        elif potential_score >= 30:
            potential_level = "LOW"
        else:
            potential_level = "UNLIKELY"
        
        results.append(PotentialBestSellerResponse(
            productId=product.productId,
            productName=product.productName,
            categoryName=product.categoryName,
            currentSales=round(total_sales, 2),
            salesGrowthRate=round(growth_rate, 2),
            potentialScore=round(potential_score, 2),
            potentialLevel=potential_level,
            totalReviews=product.totalReviews,
            avgRating=round(product.avgRating, 2),
            daysOnMarket=product.daysOnMarket
        ))
    
    results.sort(key=lambda x: x.potentialScore, reverse=True)
    
    return results