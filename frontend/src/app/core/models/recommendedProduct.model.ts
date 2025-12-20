export interface RecommendedProduct {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    rating?: number; // Optionnel
    discount?: number; // Optionnel
  }