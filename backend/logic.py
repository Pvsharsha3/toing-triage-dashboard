"""
Core triage logic: runs Snowflake queries and classifies discount root causes.

Discount classification:
  ANCHOR_PRICE  → discount_type = 'ANCHOR_PRICE'         → Case 1 (Toing anchor-price POC)
  SWIGGY_FLOW   → discount_type = 'FINAL_PRICE' AND business_line_category != 1
                                                          → Case 2 (stop on Swiggy)
  NATIVE_FVO    → discount_type = 'FINAL_PRICE' AND business_line_category = 1
                                                          → Case 3 (Toing discounting owner)

Active-offer check: match on (item_id, final_price, restaurant_share_pct) — not offer_id.
An offer is live only if: active flag = true AND valid_till >= today.
"""

from datetime import date


# ── SQL templates ─────────────────────────────────────────────────────────────

_ORDER_FACT_SQL = """
SELECT
    order_id,
    restaurant_id,
    discount,
    RDPO,
    SDPO,
    anchor_total_offer_discount,
    anchor_store_discount,
    anchor_swiggy_discount,
    post_status
FROM analytics.public.pockethero_order_fact_v1
WHERE order_id = %s
  AND toing_order_flag = '1'
LIMIT 1
"""

_TRANSFORMER_SQL = """
SELECT
    order_id,
    restaurant_id,
    order_status,
    TRADEDISCOUNTBREAKUP,
    ITEMS_JSON,
    TD_OFFER_ID,
    TD_DISCOUNT_TYPE
FROM transformer.dp.uoms_food_orders
WHERE order_id = %s
LIMIT 1
"""

_RESTAURANT_SQL = """
SELECT
    restaurant_id,
    name,
    area,
    city,
    business_food_classification AS classifier
FROM analytics.public.restaurant_attributes
WHERE restaurant_id = %s
"""

_ITEMS_SQL = """
SELECT TO_CHAR(item_id) AS item_id, quantity, selling_price
FROM analytics.public.item_sales
WHERE order_id = %s
"""

_OFFERS_ON_ORDER_SQL = """
SELECT
    offer_id,
    item_id,
    discount_type,
    burn_type,
    discount,
    business_line_category,
    swiggy_discount,
    restaurant_discount
FROM analytics.public.cp_order_offer
WHERE order_id = %s
  AND toing_order_flag = '1'
  AND discount_type != 'PERCENTAGE'
"""

_FVO_CONFIG_SQL = """
SELECT
    offer_id,
    item_id,
    final_price,
    store_id,
    eligible_groups,
    burn_type,
    swiggy_share_pct,
    restaurant_share_pct,
    start_date,
    end_date,
    active
FROM analytics.public.items_99store_fvo_items_v1
WHERE item_id IN ({placeholders})
  AND discount_type = 'FINAL_PRICE'
"""

_OFFER_MASTER_SQL = """
SELECT offer_id, burn_type, swiggy_share_pct, restaurant_share_pct
FROM analytics.public.rng_affordability_offers_v1
WHERE offer_id IN ({placeholders})
"""

_TOING_PRICE_SQL = """
SELECT DISTINCT item_id, toing_anchor_price, toing_lowest_price, swiggy_lowest_price
FROM analytics.public.toing_item_log_v1
WHERE item_id IN ({placeholders})
  AND active = true
QUALIFY ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY dt DESC) = 1
"""

_ITEM_NAMES_SQL = """
SELECT TO_CHAR(id) AS item_id, name
FROM cms.swiggy.items
WHERE id IN ({placeholders})
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fetchone(cur, sql, params=None):
    cur.execute(sql, params or ())
    row = cur.fetchone()
    if row is None:
        return None
    cols = [c[0].lower() for c in cur.description]
    return dict(zip(cols, row))


def _fetchall(cur, sql, params=None):
    cur.execute(sql, params or ())
    cols = [c[0].lower() for c in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def _in_placeholders(items):
    return ", ".join(["%s"] * len(items)), list(items)


def _classify_offer(discount_type: str, business_line_category) -> str:
    if discount_type == "ANCHOR_PRICE":
        return "ANCHOR_PRICE"
    if str(business_line_category) == "1":
        return "NATIVE_FVO"
    return "SWIGGY_FLOW"


def _offer_status(active: bool, valid_till) -> str:
    if not active:
        return "INACTIVE"
    if valid_till and valid_till < date.today():
        return "INACTIVE"
    return "ACTIVE"


# ── Main entry ────────────────────────────────────────────────────────────────

def process_raw_order(conn, order_id: str) -> dict:
    cur = conn.cursor()

    # 1. Try analytics fact table (completed orders)
    fact = _fetchone(cur, _ORDER_FACT_SQL, (order_id,))
    order_status = "completed"
    source = "analytics"

    if fact is None:
        # 2. Fall back to transformer (same-day / cancelled)
        rt = _fetchone(cur, _TRANSFORMER_SQL, (order_id,))
        if rt is None:
            raise ValueError(f"Order {order_id} not found in analytics or transformer tables")
        source = "transformer"
        order_status = "cancelled" if rt.get("order_status", "").lower() == "cancelled" else "completed"
        # Derive approximate metrics from TRADEDISCOUNTBREAKUP; simplified here
        fact = {
            "restaurant_id": rt["restaurant_id"],
            "discount": 0,
            "rdpo": 0,
            "sdpo": 0,
            "anchor_total_offer_discount": 0,
            "anchor_store_discount": 0,
            "anchor_swiggy_discount": 0,
        }

    restaurant_id = fact["restaurant_id"]

    # 3. Restaurant info
    rest = _fetchone(cur, _RESTAURANT_SQL, (restaurant_id,)) or {}

    # 4. Items on this order
    items = _fetchall(cur, _ITEMS_SQL, (order_id,))
    item_ids = [r["item_id"] for r in items]

    if not item_ids:
        raise ValueError(f"No items found for order {order_id}")

    ph, ids = _in_placeholders(item_ids)

    # 5. Offers applied on this order
    offers_on_order = _fetchall(cur, _OFFERS_ON_ORDER_SQL, (order_id,))

    # 6. FVO config (FINAL_PRICE only — anchor-price offers not here)
    fvo_rows = _fetchall(cur, _FVO_CONFIG_SQL.format(placeholders=ph), ids)
    fvo_by_item: dict[str, list] = {}
    for row in fvo_rows:
        fvo_by_item.setdefault(row["item_id"], []).append(row)

    # 7. Toing/Swiggy anchor prices
    price_rows = _fetchall(cur, _TOING_PRICE_SQL.format(placeholders=ph), ids)
    prices = {r["item_id"]: r for r in price_rows}

    # 8. Item names
    name_rows = _fetchall(cur, _ITEM_NAMES_SQL.format(placeholders=ph), ids)
    names = {r["item_id"]: r["name"] for r in name_rows}

    # 9. Offer master for all offer_ids
    all_offer_ids = list({o["offer_id"] for o in offers_on_order})
    offer_master = {}
    if all_offer_ids:
        ph2, oids = _in_placeholders(all_offer_ids)
        master_rows = _fetchall(cur, _OFFER_MASTER_SQL.format(placeholders=ph2), oids)
        offer_master = {r["offer_id"]: r for r in master_rows}

    # 10. Build per-item results
    today = date.today()
    offer_by_item = {}
    for o in offers_on_order:
        offer_by_item.setdefault(o["item_id"], []).append(o)

    item_results = []
    routing = {"has_anchor_case": False, "has_swiggy_flow": False, "has_native_fvo": False}
    summary = {
        "anchor_price_total": 0, "anchor_swiggy_share_pct": 100, "anchor_restaurant_share_pct": 0,
        "swiggy_flown_total": 0, "swiggy_flown_swiggy_share": 0, "swiggy_flown_restaurant_share": 0,
        "toing_native_total": 0, "toing_native_swiggy_share": 0, "toing_native_restaurant_share": 0,
    }

    for item in items:
        iid = item["item_id"]
        p = prices.get(iid, {})
        item_offers = offer_by_item.get(iid, [])
        root_causes = []

        toing_anchor = p.get("toing_anchor_price", item["selling_price"])
        swiggy_anchor = p.get("swiggy_lowest_price", item["selling_price"])
        toing_final = item["selling_price"]
        swiggy_final = swiggy_anchor

        applied_offer_detail = None
        if item_offers:
            o = item_offers[0]
            cat = _classify_offer(o["discount_type"], o.get("business_line_category"))
            root_causes.append(cat)

            if cat == "ANCHOR_PRICE":
                routing["has_anchor_case"] = True
                summary["anchor_price_total"] += o.get("discount", 0)
            elif cat == "SWIGGY_FLOW":
                routing["has_swiggy_flow"] = True
                summary["swiggy_flown_total"] += o.get("discount", 0)
                summary["swiggy_flown_swiggy_share"] += o.get("swiggy_discount", 0)
                summary["swiggy_flown_restaurant_share"] += o.get("restaurant_discount", 0)
            else:
                routing["has_native_fvo"] = True
                summary["toing_native_total"] += o.get("discount", 0)
                summary["toing_native_swiggy_share"] += o.get("swiggy_discount", 0)
                summary["toing_native_restaurant_share"] += o.get("restaurant_discount", 0)

            m = offer_master.get(o["offer_id"], {})
            applied_offer_detail = {
                "offer_id": o["offer_id"][:8],
                "final_price": toing_final,
                "type": cat.lower(),
                "burn_type": m.get("burn_type", o.get("burn_type", "SDPO")),
                "swiggy_share_pct": m.get("swiggy_share_pct", 100),
                "restaurant_share_pct": m.get("restaurant_share_pct", 0),
                "status": "ACTIVE",
                "valid_from": str(today),
                "valid_till": str(today),
            }

        # Current lowest active FVO: match on (item_id, final_price, restaurant_share_pct)
        current_fvo = None
        for fvo in fvo_by_item.get(iid, []):
            is_active = _offer_status(
                fvo.get("active", False),
                fvo.get("end_date")
            ) == "ACTIVE"
            if is_active:
                if current_fvo is None or fvo.get("final_price", 9999) < current_fvo.get("final_price", 9999):
                    current_fvo = {
                        "offer_id": fvo["offer_id"][:8],
                        "final_price": fvo["final_price"],
                        "type": "native_fvo",
                        "burn_type": fvo.get("burn_type", "SDPO"),
                        "swiggy_share_pct": fvo.get("swiggy_share_pct", 100),
                        "restaurant_share_pct": fvo.get("restaurant_share_pct", 0),
                        "status": "ACTIVE",
                        "valid_from": str(fvo.get("start_date", "")),
                        "valid_till": str(fvo.get("end_date", "")),
                    }

        # Get first FVO config for store_id / eligible_groups
        fvo_cfg = (fvo_by_item.get(iid) or [{}])[0]

        item_results.append({
            "item_id": iid,
            "name": names.get(iid, f"Item {iid}"),
            "toing_anchor": toing_anchor,
            "toing_final": toing_final,
            "swiggy_anchor": swiggy_anchor,
            "swiggy_final": swiggy_final,
            "root_causes": root_causes,
            "applied_offer": applied_offer_detail,
            "current_lowest_fvo": current_fvo,
            "store_id": str(fvo_cfg.get("store_id", restaurant_id)),
            "eligible_groups": fvo_cfg.get("eligible_groups", ""),
        })

    true_dpo = (fact.get("discount") or 0) - (fact.get("anchor_total_offer_discount") or 0)
    true_rdpo = (fact.get("rdpo") or 0) - (fact.get("anchor_store_discount") or 0)
    true_sdpo = (fact.get("sdpo") or 0) - (fact.get("anchor_swiggy_discount") or 0)

    return {
        "order_id": order_id,
        "status": order_status,
        "source": source,
        "restaurant": {
            "id": str(restaurant_id),
            "name": rest.get("name", ""),
            "area": rest.get("area", ""),
            "city": rest.get("city", ""),
            "classifier": rest.get("classifier", ""),
        },
        "metrics": {
            "true_dpo": true_dpo,
            "true_rdpo": max(0, true_rdpo),
            "true_sdpo": max(0, true_sdpo),
            "anchor_gap": fact.get("anchor_total_offer_discount") or 0,
        },
        "routing": routing,
        "items": item_results,
        "summary": summary,
        "raw_offers": [
            {
                "offer_id": o["offer_id"][:8],
                "discount_type": o.get("discount_type", ""),
                "burn_type": o.get("burn_type", ""),
                "discount_amount": o.get("discount", 0),
            }
            for o in offers_on_order
        ],
    }
