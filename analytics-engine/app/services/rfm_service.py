import pandas as pd
import numpy as np
import logging
from datetime import date
from typing import List
from app.api.models.rfm import RFMRequest, RFMSegment


class RFMService:

    def __init__(self):
        logging.info("✅ RFM Service initialized")

    def perform_rfm_analysis(
        self,
        payload: List[RFMRequest]
    ) -> List[RFMSegment]:

        if not payload:
            return []

        # Convert input to DataFrame
        df = pd.DataFrame([p.model_dump() for p in payload])
        today = pd.Timestamp(date.today())

        # --- RFM computation ---
        # Convert lastPurchaseDate to datetime for proper calculation
        df["lastPurchaseDate"] = pd.to_datetime(df["lastPurchaseDate"])
        df["recency"] = (today - df["lastPurchaseDate"]).dt.days
        df["frequency"] = df["purchaseCount"]
        df["monetary"] = df["totalAmount"]

        # --- Scoring (Quantiles with duplicates handling) ---
        # Use qcut with duplicates='drop' to handle cases with few unique values
        df["rScore"] = self._safe_qcut(df["recency"], 5, ascending=False)
        df["fScore"] = self._safe_qcut(df["frequency"], 5, ascending=True)
        df["mScore"] = self._safe_qcut(df["monetary"], 5, ascending=True)

        # --- Segmentation ---
        df["segment"] = df.apply(
            self._assign_segment,
            axis=1
        )

        # Convert back to DTOs
        results = [
            RFMSegment(
                customerId=int(row.customerId),
                recency=int(row.recency),
                frequency=int(row.frequency),
                monetary=float(row.monetary),
                rScore=int(row.rScore),
                fScore=int(row.fScore),
                mScore=int(row.mScore),
                segment=str(row.segment)
            )
            for row in df.itertuples(index=False)
        ]

        return results

    def _safe_qcut(self, series: pd.Series, q: int, ascending: bool = True) -> pd.Series:
        """
        Safely apply qcut, handling edge cases like too few unique values.
        For recency: lower is better (ascending=False means label 5 for lowest recency)
        For frequency/monetary: higher is better (ascending=True means label 5 for highest)
        """
        try:
            if len(series) < q:
                # Not enough data points for q bins, use simple ranking
                if ascending:
                    return pd.Series([3] * len(series), index=series.index)  # Default mid score
                else:
                    return pd.Series([3] * len(series), index=series.index)
            
            labels = [1, 2, 3, 4, 5] if ascending else [5, 4, 3, 2, 1]
            result = pd.qcut(series, q=q, labels=labels, duplicates='drop')
            
            # If qcut returned fewer bins than expected, fill NaN with middle score
            result = result.fillna(3).astype(int)
            return result
            
        except ValueError:
            # If qcut still fails (e.g., all same values), assign middle score
            return pd.Series([3] * len(series), index=series.index)

    def _assign_segment(self, row) -> str:
        score = row.rScore + row.fScore + row.mScore

        if score >= 13:
            return "Champions"
        elif score >= 10:
            return "Loyal Customers"
        elif score >= 7:
            return "Potential Customers"
        else:
            return "At Risk"


# Singleton (same pattern as reco_service)
rfm_service = RFMService()
