from fastapi import FastAPI

from pydantic import BaseModel
from typing import List
from datetime import date

app = FastAPI(title = "Sales Forcast Api")

@app.get("/health")
def health() :
    return (
        {
            "status" : "ok",
            "" : [1, 2, 3]
        }
    )
