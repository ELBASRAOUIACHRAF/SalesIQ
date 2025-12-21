export interface CategoryInfo{
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Propriété optionnelle pour l'UI (non présente dans votre classe Java mais utile pour l'affichage)
    imageUrl?: string; 
    productCount?: number;
}