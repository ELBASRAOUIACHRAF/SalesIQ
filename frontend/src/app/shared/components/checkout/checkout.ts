import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Router, ActivatedRoute } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service'; 
import { 
  SaleRequest, 
  PaymentMethod, 
  SaleStatus, 
  SoldProductRequest 
} from '../../../core/models/saleInfo.model';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatRadioModule
  ],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit {
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  isProcessing = false;

  // Données simulées du panier (à remplacer par votre CartService)
  cartItems: any[] = [];

  orderSummary = {
    subtotal: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  };

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private salesService: SalesService) {    
      // Récupération des données via history.state (navigation state)
      const state = history.state;
    
      if (state && state['data']) {
        const stateData = state['data'];
        
        
        if (stateData) {
          this.cartItems = stateData.items || [];
          
          if (stateData.summary) {
            this.orderSummary.total = stateData.summary.totalPrice; // Corrigé en 'summary'
            this.orderSummary.subtotal = stateData.summary.totalPrice;
            this.orderSummary.itemCount = stateData.summary.totalItems;
          }
        }
      }
    }

  ngOnInit(): void {
    // Le formulaire d'expédition reste pour la validation visuelle (UI),
    
    if (!this.cartItems || this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      method: [PaymentMethod.CREDITCARD, Validators.required], // Utilisation de l'Enum
      cardNumber: [''],
      expiry: [''],
      cvv: ['']
    });

    this.setupPaymentValidators();
  }

  setupPaymentValidators(): void {
    const methodControl = this.paymentForm.get('method');
    this.updateValidators(methodControl?.value);
    methodControl?.valueChanges.subscribe(method => this.updateValidators(method));
  }

  updateValidators(method: string): void {
    const cardControls = ['cardNumber', 'expiry', 'cvv'];
    if (method === PaymentMethod.CREDITCARD) {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{16}$/)]);
      this.paymentForm.get('expiry')?.setValidators([Validators.required]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
    } else {
      cardControls.forEach(control => {
        const ctrl = this.paymentForm.get(control);
        ctrl?.clearValidators();
        ctrl?.updateValueAndValidity();
      });
    }
  }

  onSubmitOrder(): void {
    if (this.shippingForm.valid && this.paymentForm.valid) {
      this.isProcessing = true;

      const soldProducts: SoldProductRequest[] = this.cartItems.map(item => ({
        productId: item.product ? item.product.id : item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice * (1 - ((item.discount || 0) / 100))
      }));

      const request: SaleRequest = {
        paymentMethod: this.paymentForm.get('method')?.value as PaymentMethod,
        status: SaleStatus.COMPLETED, 
        productOrderInfoList: soldProducts
      };


      this.salesService.saveSale(request).subscribe({
        next: (response) => {
          console.log('Succès:', response);
          this.isProcessing = false;
          // alert('Commande validée !');
          this.router.navigate(['/success']);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.isProcessing = false;
          if (err?.status === 401) {
            this.router.navigate(['/auth']);
          } else {
            // alert('Erreur lors de la commande.');
            this.router.navigate(['/error']);
          }
        }
      });

    } else {
      this.shippingForm.markAllAsTouched();
      this.paymentForm.markAllAsTouched();
    }
  }
}