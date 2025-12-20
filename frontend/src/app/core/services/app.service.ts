import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}
  
  getAllProducts(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.BASE_URL}/products/getAll`
  );
}
}
