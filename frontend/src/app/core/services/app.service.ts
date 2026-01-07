import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CategoryDetailsDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
}

export interface CategoryPerformanceDto {
  categoryId: number;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalSales: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}
  
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/products/getAll`);
  }

  // Category endpoints
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.BASE_URL}/categories`);
  }

  getCategoriesDetails(): Observable<CategoryDetailsDto[]> {
    return this.http.get<CategoryDto[]>(`${this.BASE_URL}/categories`).pipe(
      map(categories => categories.map(cat => ({
        ...cat,
        productCount: 0 // Will be merged with performance data
      } as CategoryDetailsDto)))
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.BASE_URL}/products/getAll`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.BASE_URL}/products/categoryproducts/${categoryId}`);
  }

  getCategoryCount(): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/category/count`);
  }

  getCategoryPerformance(startDate?: string, endDate?: string): Observable<CategoryPerformanceDto[]> {
    let params = new HttpParams();
    // Default to last 2 years if no date range provided
    if (!startDate) {
      const defaultStart = new Date();
      defaultStart.setFullYear(defaultStart.getFullYear() - 2);
      startDate = defaultStart.toISOString().split('T')[0];
    }
    if (!endDate) {
      endDate = new Date().toISOString().split('T')[0];
    }
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    return this.http.get<CategoryPerformanceDto[]>(`${this.BASE_URL}/api/v1/analytics/category-performance`, { params });
  }

  createCategory(category: Partial<CategoryDto>): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${this.BASE_URL}/addCategory`, category);
  }

  updateCategory(categoryId: number, category: Partial<CategoryDto>): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.BASE_URL}/updateCategory/${categoryId}`, category);
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/deleteCat/${categoryId}`);
  }

  canDeleteCategory(categoryId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.BASE_URL}/canDeleteCategory/${categoryId}`);
  }

  activateCategory(categoryId: number): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.BASE_URL}/category/${categoryId}/activate`, {});
  }

  deactivateCategory(categoryId: number): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.BASE_URL}/category/${categoryId}/deactivate`, {});
  }
}
