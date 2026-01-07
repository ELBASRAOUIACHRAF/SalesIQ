import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReviewsService } from '../../../core/services/reviews.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-review',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule, 
    MatIconModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './add-review.html',
  styleUrl: './add-review.css',
})
export class AddReview implements OnInit {
  @Input() productId!: number; // Reçu depuis le composant parent (ProductDetailsPage)
  
  reviewForm: FormGroup;
  hoverRating = 0;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder, 
    private reviewsService: ReviewsService,
    public dialogRef: MatDialogRef<AddReview>,
    @Inject(MAT_DIALOG_DATA) public data: { productId: number }
  ) {
    this.productId = data.productId;
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      // title: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    // On récupère l'ID passé par le modal lors de l'ouverture
    if (this.data && this.data.productId) {
      this.productId = this.data.productId;
      console.log('ID Produit chargé dans le modal :', this.productId);
    } else {
      console.error('Erreur : Aucun productId fourni au modal AddReview');
    }
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      const newReview = {
        ...this.reviewForm.value,
        reviewDate: new Date(),
      };

      this.reviewsService.addReview(newReview, this.productId).subscribe({
        next: () => {
          this.snackBar.open('Thank you! Your review has been submitted.', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
          });
          this.dialogRef.close(true);
        },
        error: (err) => console.error('Error submitting review', err)
      });
    }
  }
}
