import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { CategoryInfo } from '../models/categoryInfo.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  
  private apiUrl = 'http://localhost:8080/'; 

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}categories`);
  }

  getCategoryDetails(): Observable<CategoryInfo[]>{
    return this.http.get<CategoryInfo[]>(`${this.apiUrl}categories`);
  }

}
