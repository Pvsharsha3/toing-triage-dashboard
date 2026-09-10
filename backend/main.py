"""
Toing Discount Triage — FastAPI backend.

MOCK_MODE=true  (default): returns baked responses for the 4 test orders.
MOCK_MODE=false: queries live Snowflake using the user's PAT from X-SF-Token header.

Run:
    uvicorn main:app --reload
"""

import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
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
def get_order(
    req: OrderRequest,
    x_sf_token: Optional[str] = Header(default=None),
):
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
    if not x_sf_token:
        raise HTTPException(
            status_code=401,
            detail="No Snowflake token provided. Add your PAT via X-SF-Token header.",
        )

    try:
        from snowflake_client import run_order_query
        return run_order_query(order_id, x_sf_token)
    except Exception as exc:
        msg = str(exc)
        if "Authentication" in msg or "token" in msg.lower():
            raise HTTPException(status_code=401, detail="Snowflake token invalid or expired. Please re-enter your PAT.")
        raise HTTPException(status_code=500, detail=msg)
