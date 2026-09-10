"""
Snowflake connector — key-pair auth (no SSO, so this works server-side).

Required env vars:
  SF_USER, SF_ACCOUNT, SF_WAREHOUSE, SF_ROLE,
  SF_DATABASE, SF_SCHEMA,
  SF_PRIVATE_KEY_PATH  (path to unencrypted RSA private key)
  OR
  SF_PRIVATE_KEY_B64   (base64-encoded private key, for Render/Railway secrets)

To generate a key pair:
  openssl genrsa -out rsa_key.pem 2048
  openssl rsa -in rsa_key.pem -pubout -out rsa_key.pub
  # Register rsa_key.pub with Snowflake:
  #   ALTER USER <user> SET RSA_PUBLIC_KEY='<contents of rsa_key.pub without header/footer>';
"""

import os
import base64
from datetime import date, timedelta

import snowflake.connector
from cryptography.hazmat.primitives import serialization

from logic import process_raw_order


def _get_private_key():
    key_b64 = os.getenv("SF_PRIVATE_KEY_B64")
    if key_b64:
        key_bytes = base64.b64decode(key_b64)
    else:
        key_path = os.getenv("SF_PRIVATE_KEY_PATH", "rsa_key.pem")
        with open(key_path, "rb") as f:
            key_bytes = f.read()

    private_key = serialization.load_pem_private_key(key_bytes, password=None)
    return private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )


def _connect():
    return snowflake.connector.connect(
        user=os.environ["SF_USER"],
        account=os.environ["SF_ACCOUNT"],
        warehouse=os.environ["SF_WAREHOUSE"],
        role=os.environ["SF_ROLE"],
        database=os.getenv("SF_DATABASE", "ANALYTICS"),
        schema=os.getenv("SF_SCHEMA", "PUBLIC"),
        private_key=_get_private_key(),
    )


def run_order_query(order_id: str) -> dict:
    """
    Runs all Snowflake queries for the given order_id and returns
    the structured triage response.

    Falls back to the realtime transformer table for same-day / cancelled orders.
    """
    conn = _connect()
    try:
        return process_raw_order(conn, order_id)
    finally:
        conn.close()
