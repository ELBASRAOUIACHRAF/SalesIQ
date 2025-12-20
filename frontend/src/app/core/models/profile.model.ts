export interface ProfileModel {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string; 
    bio: string;
    hoursLoggedIn: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastLogin: Date | string;
    
    // imageUrl?: string; 

    country: string;
    city: string;
    postalCode: string;

  }
