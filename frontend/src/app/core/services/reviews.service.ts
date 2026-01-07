import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Reviews } from '../models/reviews.model';
import { RatingStats } from '../models/ratingsStats.model';
import { ReviewToPost } from '../models/reviewToPost.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private apiUrl = 'http://localhost:8080/'; 

  constructor(private http: HttpClient) { }

  getReviewsByProductId(productId: number): Observable<Reviews[] | any>{
    return this.http.get<any>(`${this.apiUrl}reviews/productreviewsdetails/${productId}`);
  }

  addReview(review: Reviews, productId: number): Observable<Reviews | null> {
    // Utilisez HttpParams pour construire l'URL proprement
    const url = `http://localhost:8080/reviews/createreview`;
    return this.http.post<Reviews>(url, review, {
      params: {
        productId: productId.toString()
      }
    });
  }

  getPercentageRatingsStatsByProduct(productId: number): Observable<RatingStats> {
    return this.getReviewsByProductId(productId).pipe(
      map((safeReviews: Reviews[] | null) => {
        const reviews = safeReviews || [];
        const total = reviews.length;
        
        // Initialisation des compteurs pour chaque étoile (1 à 5)
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sumRatings = 0;

        reviews.forEach(rev => {
          const r = Math.round(rev.rating) as keyof typeof counts;
          if (counts[r] !== undefined) {
            counts[r]++;
          }
          sumRatings += rev.rating;
        });

        const average = total > 0 ? sumRatings / total : 0;

        // Transformation en tableau de pourcentages pour le composant UI
        const percentages = [5, 4, 3, 2, 1].map(star => ({
          stars: star,
          percentage: total > 0 ? Math.round((counts[star as keyof typeof counts] / total) * 100) : 0
        }));

        return {
          averageRating: Number(average.toFixed(1)), // ex: 4.8
          totalRatings: total,
          percentages: percentages
        };
      })
    );
  }

}
