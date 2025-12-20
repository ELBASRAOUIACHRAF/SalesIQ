export interface Users {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string; 
    hoursLoggedIn: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastLogin: Date | string;
    
    // imageUrl?: string; 
    
    sales?: any[];
    reviews?: any[];
    searchHistory?: any[];
  }
