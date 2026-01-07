import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { BasketItem } from '../../../core/models/BasketItem.model';
import { BasketService } from '../../../core/services/basket.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-basket',
  imports: [CommonModule, RouterLink,  MatDividerModule, MatButtonModule, MatSelectModule, MatIconModule],
  templateUrl: './basket.html',
  styleUrl: './basket.css',
})
export class Basket implements OnInit{

  basketItems: BasketItem[] = [];
  basketId!: number;
  
  constructor(private cd: ChangeDetectorRef, private basketService: BasketService,private router: Router) {}
  
  ngOnInit(): void {

    this.loadBasketItems();
  }

  
  
  loadBasketItems(){
    this.basketService.getUsersBasket().subscribe((data) => {
      this.basketItems = data;
      
      this.basketService.updateCartCount();
      this.cd.detectChanges();
    })
  }



  calculateDiscountedPrice(item: BasketItem): number {
    return item.unitPrice * (1 - item.discount / 100);
  }

  get totalItems(): number {
    return this.basketItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.basketItems.reduce((acc, item) => acc + (this.calculateDiscountedPrice(item) * item.quantity), 0);
  }

  updateQuantity(id: number, qty: number) {
    const item = this.basketItems.find(i => i.id === id);
    if (item) item.quantity = qty;
  }

  

  removeItem(id: number) {
    this.basketService.deleteBasketItem(id).subscribe({
      next: () => {
        console.log('Suppression réussie pour l\'ID:', id);
        
        this.basketItems = this.basketItems.filter(i => i.id !== id);
        // this.loadBasketItems(2);
        this.basketService.updateCartCount();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression sur le serveur:', err);
        alert('Impossible de supprimer l\'article pour le moment.');
      }
    });
  }

  proceedToCheckout() {
    
    if (this.basketItems.length === 0) {
      alert('Your basket is empty');
      return;
    }

    const checkoutData = {
      items: this.basketItems,
      summary: {
        totalPrice: this.totalPrice,
        totalItems: this.totalItems
      }
    };

    this.router.navigate(['/checkout'], { 
      state: { data: checkoutData } 
    });
  }

  

}
 