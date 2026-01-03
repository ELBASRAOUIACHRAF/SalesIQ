import pandas as pd
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
        df = pd.DataFrame([p.dict() for p in payload])
        today = date.today()

        # --- RFM computation ---
        df["recency"] = (today - df["lastPurchaseDate"]).dt.days
        df["frequency"] = df["purchaseCount"]
        df["monetary"] = df["totalAmount"]

        # --- Scoring (Quantiles) ---
        df["rScore"] = pd.qcut(
            df["recency"],
            5,
            labels=[5, 4, 3, 2, 1]
        ).astype(int)

        df["fScore"] = pd.qcut(
            df["frequency"],
            5,
            labels=[1, 2, 3, 4, 5]
        ).astype(int)

        df["mScore"] = pd.qcut(
            df["monetary"],
            5,
            labels=[1, 2, 3, 4, 5]
        ).astype(int)

        # --- Segmentation ---
        df["segment"] = df.apply(
            self._assign_segment,
            axis=1
        )

        # Convert back to DTOs
        results = [
            RFMSegment(
                customerId=row.customerId,
                recency=row.recency,
                frequency=row.frequency,
                monetary=row.monetary,
                rScore=row.rScore,
                fScore=row.fScore,
                mScore=row.mScore,
                segment=row.segment
            )
            for row in df.itertuples(index=False)
        ]

        return results

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
