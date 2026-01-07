import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';

export interface CsvImportResponse {
  success: boolean;
  message: string;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private readonly API_URL = 'http://localhost:8080/api/csv';
  private readonly EXPORT_TIMEOUT = 30000; // 30 seconds timeout

  constructor(private http: HttpClient) {}

  private withTimeout<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      timeout(this.EXPORT_TIMEOUT),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => new Error('Export timed out. Please try again.'));
        }
        return throwError(() => err);
      })
    );
  }

  // ============ USERS ============
  
  exportUsers(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/users/export`, {
      responseType: 'blob'
    }));
  }

  importUsers(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/users/import`, formData);
  }

  // ============ PRODUCTS ============
  
  exportProducts(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/products/export`, {
      responseType: 'blob'
    }));
  }

  importProducts(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/products/import`, formData);
  }

  // ============ CATEGORIES ============
  
  exportCategories(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/categories/export`, {
      responseType: 'blob'
    }));
  }

  importCategories(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/categories/import`, formData);
  }

  // ============ SALES ============
  
  exportSales(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/sales/export`, {
      responseType: 'blob'
    }));
  }

  importSales(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/sales/import`, formData);
  }

  // ============ REVIEWS ============
  
  exportReviews(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/reviews/export`, {
      responseType: 'blob'
    }));
  }

  importReviews(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/reviews/import`, formData);
  }

  // ============ SOLD PRODUCTS ============
  
  exportSoldProducts(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/sold-products/export`, {
      responseType: 'blob'
    }));
  }

  importSoldProducts(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/sold-products/import`, formData);
  }

  // ============ BASKETS ============
  
  exportBaskets(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/baskets/export`, {
      responseType: 'blob'
    }));
  }

  importBaskets(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/baskets/import`, formData);
  }

  // ============ SEARCH HISTORY ============
  
  exportSearchHistory(): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.API_URL}/search-history/export`, {
      responseType: 'blob'
    }));
  }

  importSearchHistory(file: File): Observable<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvImportResponse>(`${this.API_URL}/search-history/import`, formData);
  }

  // ============ HELPER ============
  
  /**
   * Triggers download of a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
