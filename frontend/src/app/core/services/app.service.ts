import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<CategoryDetailsDto[]>(`${this.BASE_URL}/categoriesDetails`);
  }

  getCategoryCount(): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/category/count`);
  }

  getCategoryPerformance(startDate?: string, endDate?: string): Observable<CategoryPerformanceDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
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
