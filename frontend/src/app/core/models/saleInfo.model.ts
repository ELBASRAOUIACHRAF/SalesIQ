export interface SaleRequest {
    paymentMethod: PaymentMethod;
    status: SaleStatus;
    
 
    productOrderInfoList: SoldProductRequest[];
  }

  export enum PaymentMethod {
    CASH = 'CASH',
    CREDITCARD = 'CREDITCARD',
    PAYPAL = 'PAYPAL',
    TRANSFER = 'TRANSFER'
  }

  export enum SaleStatus {
    REFUNDED = 'REFUNDED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

  export interface SoldProductRequest {
    productId: number;
    quantity: number;
    unitPrice?: number; // Optionnel, si le backend recalcule le prix, ne pas l'envoyer
  }