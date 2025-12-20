export interface RatingStats {
    averageRating: number;
    totalRatings: number;
    percentages: {
      stars: number;
      percentage: number;
    }[];
  }