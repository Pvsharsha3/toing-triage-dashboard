"""
Snowflake connector — externalbrowser SSO (same as SAGE).

First run opens a browser for Swiggy Google SSO.
Subsequent runs use the cached token from Windows Credential Manager.
"""

import os
import snowflake.connector
from logic import process_raw_order

SF_ACCOUNT   = os.getenv("SF_ACCOUNT",   "GZAVXAB-SWIGGY_MUMBAI")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE", "ANALYST_SCHEDULES_WH_02")
SF_ROLE      = os.getenv("SF_ROLE",      "FOOD_RANDG")
SF_DATABASE  = os.getenv("SF_DATABASE",  "ANALYTICS")
SF_SCHEMA    = os.getenv("SF_SCHEMA",    "PUBLIC")
SF_USER      = os.getenv("SF_USER",      "")  # set in .env


def get_connection():
    return snowflake.connector.connect(
        account=SF_ACCOUNT,
        user=SF_USER,
        authenticator="externalbrowser",
        warehouse=SF_WAREHOUSE,
        role=SF_ROLE,
        database=SF_DATABASE,
        schema=SF_SCHEMA,
        client_store_temporary_credential=True,  # cache SSO token in OS keyring
        client_session_keep_alive=True,
    )


def run_order_query(order_id: str) -> dict:
    conn = get_connection()
    try:
        return process_raw_order(conn, order_id)
    finally:
        conn.close()
