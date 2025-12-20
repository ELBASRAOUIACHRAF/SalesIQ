import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductMedia } from '../../../core/models/productMedia.model';

@Component({
  selector: 'app-product-images',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './product-images.html',
  styleUrls: ['./product-images.css']
})
export class ProductImages {
  selectedIndex = 0;

  mediaList: ProductMedia[] = [
    { url: 'https://m.media-amazon.com/images/I/71BhyfiObgL._AC_UY218_.jpg', type: 'image' },
    { url: 'https://m.media-amazon.com/images/I/61sezu7oMKL._AC_UY218_.jpg', type: 'image' },
    { url: 'https://m.media-amazon.com/images/I/61GMQi3bBNL._AC_UY218_.jpg', type: 'image' },
    { url: 'https://m.media-amazon.com/images/I/7160d34kKBL._AC_UY218_.jpg', type: 'image' },
    { url: 'https://m.media-amazon.com/images/I/61sezu7oMKL._AC_UY218_.jpg', type: 'image' },
    { url: 'https://m.media-amazon.com/images/I/61sezu7oMKL._AC_UY218_.jpg', type: 'video' }
  ];

  selectMedia(index: number) {
    this.selectedIndex = index;
  }
}