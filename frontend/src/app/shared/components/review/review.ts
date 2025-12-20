import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReviewsService } from '../../../core/services/reviews.service';
import { Reviews } from '../../../core/models/reviews.model';
import { ActivatedRoute } from '@angular/router';

// import { RatingStats } from '../../../core/models/ratingsStats.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class Review implements OnInit {

  productReviews: Reviews[] = [];
  // ratingsStats!: RatingStats;

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id')); 
    if (id) {
      this.loadProductReviews(id);
    }

    // this.loadProductReviews(2);
    
  }

  constructor (
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private reviewsSerice: ReviewsService
  ){}


  loadProductReviews(productId: number){
    this.reviewsSerice.getReviewsByProductId(productId).subscribe((data => {
      this.productReviews = data;
      this.cdr.detectChanges();
    }))
  }

}