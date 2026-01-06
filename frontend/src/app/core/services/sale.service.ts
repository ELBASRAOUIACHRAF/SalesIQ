import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface SaleDto {
  id: number;
  dateOfSale: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = 'http://localhost:8080/sales';

  constructor(private http: HttpClient) {}

  getSales(): Observable<SaleDto[]> {
    return this.http.get<SaleDto[]>(`${this.apiUrl}/getsales`).pipe(
      map(res => res ?? [])
    );
  }

  getSaleById(saleId: number): Observable<SaleDto> {
    return this.http.get<SaleDto>(`${this.apiUrl}/gatsale/${saleId}`);
  }

  getSalesByUser(userId: number): Observable<SaleDto[]> {
    return this.http.get<SaleDto[]>(`${this.apiUrl}/usersale/${userId}`).pipe(
      map(res => res ?? [])
    );
  }

  getSalesByStatus(status: string): Observable<SaleDto[]> {
    return this.http.get<SaleDto[]>(`${this.apiUrl}/statussales/${status}`).pipe(
      map(res => res ?? [])
    );
  }

  getSalesByPaymentMethod(paymentMethod: string): Observable<SaleDto[]> {
    return this.http.get<SaleDto[]>(`${this.apiUrl}/pymethodsales/${paymentMethod}`).pipe(
      map(res => res ?? [])
    );
  }

  getSalesByDateRange(startDate: string, endDate: string): Observable<SaleDto[]> {
    return this.http.get<SaleDto[]>(`${this.apiUrl}/salesbydate`, {
      params: { startDate, endDate }
    }).pipe(
      map(res => res ?? [])
    );
  }
}
