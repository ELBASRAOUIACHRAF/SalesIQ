// src/app/product.model.ts

export interface Product {
    id: number;
    name: string;
    imageUrl: string;
    optionsText: string;
    rating: number;
    reviewsCount: string; // Ex: "(110.2K)"
    purchaseCount: string; // Ex: "10K+ bought in past month"
    price: number;
    stock: number; // last
    listPrice: number;
    saleText?: string; // Ex: "Save 5% on 2 select item(s)"
    deliveryDate: string; // Ex: "Delivery Fri, Dec 26"
    shipsTo: string; // Ex: "Ships to Morocco"
    saferChemicals: boolean;
    discount: number;
    categoryId?: number; // Catégorie du produit
    brand?: string; // Marque du produit
  }