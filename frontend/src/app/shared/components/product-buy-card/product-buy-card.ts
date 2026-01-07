import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf, *ngFor, date, number
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProductDetailsModel } from '../../../core/models/productDetails.model';
import { ProductService } from '../../../core/services/product.service';
import { BasketService } from '../../../core/services/basket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-buy-card',
  imports: [
    CommonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './product-buy-card.html',
  styleUrls: ['./product-buy-card.css']
})
export class ProductBuyCard implements OnInit{

  productDetails!: ProductDetailsModel;
  newPrice: number = 0;
  // @Input() product: any = {
  //   price: 169.99,
  //   stockQuantity: 12
  // };

  selectedQuantity = 1;
  userLocation = 'Phoenix 85001';
  deliveryDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private basketService: BasketService,
    private cdr: ChangeDetectorRef,
    private productService: ProductService
  ) {
    // Simulation d'une date de livraison dans 3 jours
    this.deliveryDate.setDate(this.deliveryDate.getDate() + 3);
  }

  loadProductDetails(productId: number){
    this.productService.getProductDetailsById(productId).subscribe((data) => {
      this.productDetails = data;
      // On vérifie si discount existe, sinon on garde le prix initial
      if (this.productDetails && this.productDetails.discount > 0) {
        this.newPrice = this.productDetails.price * (1 - this.productDetails.discount / 100);
      } else {
        this.newPrice = this.productDetails.price;
      }
      this.cdr.detectChanges();
    });
  }
  

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProductDetails(productId);
  }

  getStockStatus(): string {
    if (this.productDetails.stock > 5) return 'In Stock';
    if (this.productDetails.stock > 0) return `Only ${this.productDetails.stock} left in stock - order soon`;
    return 'Currently Unavailable';
  }

  addToCart() {
    // console.log(`Adding ${this.selectedQuantity} item(s) to cart.`);
    // console.log(      this.selectedQuantity, this.productDetails.id)
    
    this.basketService.addToBasket(
      this.selectedQuantity, 
      this.productDetails.id
      
    ).subscribe({
      next: (success) => {
        if (success) {
          // Optionnel : Afficher un message de succès (SnackBar)
          console.log('Produit ajouté au panier !');
          this.basketService.updateCartCount();
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout au panier', err);
      }
    });
  }

  buyNow() {
    console.log('Proceeding to checkout...');
  }
}