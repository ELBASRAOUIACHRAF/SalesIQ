import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';

// Report data interfaces
export interface UserReportData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  hoursLoggedIn: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  bio: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface ProductReportData {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  asin: string;
  description: string;
  mark: string;
  stock: number;
  discount: number;
  imageUrl: string;
  weight: number;
  length: number;
  height: number;
}

export interface SaleReportData {
  id: number;
  dateOfSale: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  userId: number;
  userName?: string;
  productCount?: number;
}

export interface ReviewReportData {
  id: number;
  comment: string;
  rating: number;
  reviewDate: string;
  userName?: string;
  productName?: string;
  productId?: number;
  userId?: number;
}

export interface ReportSummary {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Get all users for report
  getUsers(): Observable<UserReportData[]> {
    return this.http.get<UserReportData[]>(`${this.apiUrl}/getUsersList`).pipe(
      catchError(err => {
        console.error('Failed to fetch users:', err);
        return of([]);
      })
    );
  }

  // Get all products for report
  getProducts(): Observable<ProductReportData[]> {
    return this.http.get<ProductReportData[]>(`${this.apiUrl}/products/getAll`).pipe(
      catchError(err => {
        console.error('Failed to fetch products:', err);
        return of([]);
      })
    );
  }

  // Get all sales for report
  getSales(): Observable<SaleReportData[]> {
    return this.http.get<SaleReportData[]>(`${this.apiUrl}/sales/getsales`).pipe(
      map(sales => sales || []),
      catchError(err => {
        console.error('Failed to fetch sales:', err);
        return of([]);
      })
    );
  }

  // Get all reviews for report
  // NOTE: Requires backend restart to enable /reviews/getallreviews endpoint
  getReviews(): Observable<ReviewReportData[]> {
    // Temporarily return empty until backend is restarted with new endpoint
    return of([]);
  }

  // Get comprehensive summary for dashboard report
  getReportSummary(): Observable<ReportSummary> {
    return forkJoin({
      users: this.getUsers(),
      products: this.getProducts(),
      sales: this.getSales(),
      reviews: this.getReviews()
    }).pipe(
      map(data => {
        const totalRevenue = data.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const avgRating = data.reviews.length > 0 
          ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length 
          : 0;

        return {
          totalUsers: data.users.length,
          activeUsers: data.users.filter(u => u.active).length,
          totalProducts: data.products.length,
          lowStockProducts: data.products.filter(p => p.stock < 10).length,
          totalSales: data.sales.length,
          totalRevenue: totalRevenue,
          totalReviews: data.reviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
          generatedAt: new Date().toISOString()
        };
      })
    );
  }
}
