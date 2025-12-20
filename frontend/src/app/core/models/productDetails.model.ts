
export interface ProductDetailsModel {
    id: number;
    name: string;
    price: number;
    rating: number;
    reviewsCount: number;
    asin: string;
    description: string;
    mark: string;
    discount: number;
    imageUrl: string;
    imagesGallery: string[]; // Tableau de chaînes pour les URLs de la galerie
    weight: number;
    length: number;
    height: number;
    stock: number;
}