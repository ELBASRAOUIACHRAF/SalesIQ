export interface Reviews {
    id?: number;               // Le ? car l'ID est généré par la DB
    comment: string;
    rating: number;
    reviewDate?: Date | string; 
    
    // Relations
    userName?: string;    
    product?: number;  // Ou remplacez par l'interface 'Product' si elle existe
  }