import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleRequest } from '../models/saleInfo.model';

@Injectable({
  providedIn: 'root',
})
export class SalesService {

  private apiUrl = 'http://localhost:8080/sales';

  constructor(private http: HttpClient) { }

  saveSale(salesInfo: SaleRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/addsale`, salesInfo);
  }

}
