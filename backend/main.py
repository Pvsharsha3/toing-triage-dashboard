"""
Toing Discount Triage — FastAPI backend.

MOCK_MODE=true  (default when no .env): returns baked responses for 4 test orders.
MOCK_MODE=false: queries live Snowflake using externalbrowser SSO (like SAGE).

Run locally:
    uvicorn main:app --reload
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
            detail=f"Order {order_id} not in demo set. Demo orders: {', '.join(MOCK_ORDERS.keys())}",
        )

    try:
        from snowflake_client import run_order_query
        return run_order_query(order_id)
    except Exception as exc:
        msg = str(exc)
        raise HTTPException(status_code=500, detail=msg)


# ── Serve frontend static files ───────────────────────────────────────────────
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(FRONTEND_DIST / "index.html")
