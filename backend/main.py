"""
Toing Discount Triage — FastAPI backend.

MOCK_MODE=true  (default): returns baked responses for the 4 test orders.
MOCK_MODE=false: queries live Snowflake via key-pair auth.

Run:
    uvicorn main:app --reload
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mock_data import MOCK_ORDERS

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"

app = FastAPI(title="Toing Triage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrderRequest(BaseModel):
    order_id: str


@app.get("/api/health")
def health():
    return {"status": "ok", "mock_mode": MOCK_MODE}


@app.post("/api/order")
def get_order(req: OrderRequest):
    order_id = req.order_id.strip()
    if not order_id:
        raise HTTPException(status_code=400, detail="order_id is required")

    if MOCK_MODE:
        if order_id in MOCK_ORDERS:
            return MOCK_ORDERS[order_id]
        raise HTTPException(
            status_code=404,
            detail=(
                f"Order {order_id} not in demo set. "
                f"Demo orders: {', '.join(MOCK_ORDERS.keys())}"
            ),
        )

    # ── Live Snowflake path ───────────────────────────────────────────────────
    try:
        from snowflake_client import run_order_query
        return run_order_query(order_id)
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Snowflake connector not configured. Set MOCK_MODE=false only when snowflake_client.py is set up.",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
