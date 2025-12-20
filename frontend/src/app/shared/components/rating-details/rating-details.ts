import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RatingStats } from '../../../core/models/ratingsStats.model';
import { ReviewsService } from '../../../core/services/reviews.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddReview } from '../add-review/add-review';


@Component({
  selector: 'app-rating-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDividerModule, MatDialogModule],
  templateUrl: './rating-details.html',
  styleUrls: ['./rating-details.css']
})
export class RatingDetails implements OnInit {

  // @Input() productId!: number;

  productId!: number;
  ratingsStats!: RatingStats;

  constructor (
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reviewsSerice: ReviewsService
  ){}

  onWriteReview(): void {
    // console.log(this.productId);
    const dialogRef = this.dialog.open(AddReview, {
      width: '600px',
      maxWidth: '90vw',
      data: { productId: this.productId }, // On transmet l'ID au modal
      panelClass: 'custom-dialog-container' // Optionnel pour le style
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optionnel : rafraîchir les stats si un avis a été ajouté
        this.loadRatingStats(this.productId);
        console.log('Le modal a été fermé après soumission');
        
      }
    });
  }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id')); 
    this.productId = id;
    if (id) {
      this.loadRatingStats(id);
    }

  }

  loadRatingStats(productId: number){
    this.reviewsSerice.getPercentageRatingsStatsByProduct(productId).subscribe((data) => {
      this.ratingsStats = data;
      this.cdr.detectChanges();
    })
  }

  @Output() writeReview = new EventEmitter<void>();

  Math = Math; 

}
