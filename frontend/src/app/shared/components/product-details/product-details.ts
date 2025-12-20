import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailsModel } from '../../../core/models/productDetails.model';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, MatIconModule, MatDividerModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {

  constructor (
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private productService: ProductService
  ){}

  productDetails!: ProductDetailsModel;
  newPrice: number = 0;

  ngOnInit(): void {

    // Récupère l'ID depuis l'URL (ex: /product/5)
    const id = Number(this.route.snapshot.paramMap.get('id')); 
    if (id) {
      this.loadProductDetails(id);
    }

    // this.loadProductDetails(2);
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

  Math = Math; 

}