import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductDetailsModel } from '../models/productDetails.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/'; 
  
  constructor(private http: HttpClient) { }

  getSimilarProducts(productId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}api/v1/analytics/similarProducts/${productId}`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}products/getAll`);
  }

  getBrands(): Observable<string[]>{
    return this.http.get<string[]>(`${this.apiUrl}marks`);
  }

  getProductsByMultipleCategories(categoryIds: number[]): Observable<Product[]> {
    return this.http.post<Product[]>(
      `${this.apiUrl}products/by-categories`,
      categoryIds
    );
  }

  getProductDetailsById(productId: number): Observable<ProductDetailsModel>{
    return this.http.get<ProductDetailsModel>(`${this.apiUrl}products/productDetails/${productId}`);
  }


}

