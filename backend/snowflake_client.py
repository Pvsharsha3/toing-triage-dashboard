"""
Snowflake connector — OAuth token auth (user's Personal Access Token).

Each request passes the user's PAT via the X-SF-Token header.
The backend uses it with authenticator='oauth' — no stored credentials.

How users get their PAT:
  Snowflake UI → top-right avatar → My Profile → Programmatic Access Tokens → Add Token
"""

import os
import snowflake.connector
from logic import process_raw_order

SF_ACCOUNT   = os.getenv("SF_ACCOUNT",   "GZAVXAB-SWIGGY_MUMBAI")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE", "ANALYST_SCHEDULES_WH_02")
SF_ROLE      = os.getenv("SF_ROLE",      "FOOD_RANDG")
SF_DATABASE  = os.getenv("SF_DATABASE",  "ANALYTICS")
SF_SCHEMA    = os.getenv("SF_SCHEMA",    "PUBLIC")


def run_order_query(order_id: str, sf_token: str) -> dict:
    """Query Snowflake using the user's Personal Access Token."""
    conn = snowflake.connector.connect(
        account=SF_ACCOUNT,
        authenticator="oauth",
        token=sf_token,
        warehouse=SF_WAREHOUSE,
        role=SF_ROLE,
        database=SF_DATABASE,
        schema=SF_SCHEMA,
    )
    try:
        return process_raw_order(conn, order_id)
    finally:
        conn.close()
