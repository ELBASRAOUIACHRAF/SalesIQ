import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, BehaviorSubject, tap } from 'rxjs';
import { BasketItem } from '../models/BasketItem.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private apiUrl = 'http://localhost:8080/'; 

  // BehaviorSubject garde la dernière valeur en mémoire (0 par défaut)
  private cartCountSubject = new BehaviorSubject<number>(0);
  
  // Observable que les composants vont écouter
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  getUsersBasket(): Observable<BasketItem[] | any>{
    return this.http.get<any>(`${this.apiUrl}basket/usersBasket`);
  }

  addToBasket(quantity: number, productId: number): Observable<boolean> {
    const url = `${this.apiUrl}basket/add`;
    
    const params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('productId', productId.toString());
    
  
      return this.http.post<boolean>(url, {}, { params }).pipe(
        tap((success) => {
          if (success) {
            // On rafraîchit automatiquement le compteur si l'ajout a réussi
            this.updateCartCount();
            console.log("ca marche trés bien");
          }
        }))
  }

  updateCartCount() {
    
    this.http.get<number>(`${this.apiUrl}basket/itemscount`).subscribe({
      next: (count) => {
        // console.log('Nouveau compte reçu du serveur :', count);
        this.cartCountSubject.next(count);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du compte panier', err);
        this.cartCountSubject.next(0);
      }
    });
  }

  deleteBasketItem(basketItemId: number): Observable<boolean> {

    const url = `${this.apiUrl}basket/deleteBasketItem`;

    const params = new HttpParams()
      .set('basketItemId', basketItemId.toString());  
  
    return this.http.delete<boolean>(url, { params }).pipe(
      tap(() => {
        this.updateCartCount();
      })
    );
  }
}
