/** Baked demo responses — identical to backend/mock_data.py */
export const MOCK_ORDERS = {
  "246255027129300": {
    order_id: "246255027129300",
    status: "completed",
    source: "analytics",
    restaurant: { id: "71823", name: "Punjabi By Nature", area: "Koramangala", city: "Bengaluru", classifier: "QSR" },
    metrics: { true_dpo: 140, true_rdpo: 0, true_sdpo: 0, anchor_gap: 140 },
    routing: { has_anchor_case: true, has_swiggy_flow: false, has_native_fvo: false },
    items: [
      {
        item_id: "98234765", name: "Dal Makhani",
        toing_anchor: 159, toing_final: 159, swiggy_anchor: 299, swiggy_final: 299,
        root_causes: ["ANCHOR_PRICE"],
        applied_offer: { offer_id: "7a3f9c12", final_price: 159, type: "anchor_price", burn_type: "RDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-08-01", valid_till: "2026-10-31" },
        current_lowest_fvo: null,
        store_id: "71823", eligible_groups: "ALL_USERS",
      },
    ],
    summary: { anchor_price_total: 140, anchor_swiggy_share_pct: 100, anchor_restaurant_share_pct: 0, swiggy_flown_total: 0, swiggy_flown_swiggy_share: 0, swiggy_flown_restaurant_share: 0, toing_native_total: 0, toing_native_swiggy_share: 0, toing_native_restaurant_share: 0 },
    raw_offers: [{ offer_id: "7a3f9c12", discount_type: "ANCHOR_PRICE", burn_type: "RDPO", discount_amount: 140 }],
  },

  "246367024173056": {
    order_id: "246367024173056",
    status: "completed",
    source: "analytics",
    restaurant: { id: "58941", name: "Jatt Rolls", area: "Indiranagar", city: "Bengaluru", classifier: "Homestyle" },
    metrics: { true_dpo: 126, true_rdpo: 58, true_sdpo: 68, anchor_gap: 239 },
    routing: { has_anchor_case: true, has_swiggy_flow: true, has_native_fvo: true },
    items: [
      {
        item_id: "83012744", name: "Jatt Special Chicken Roll",
        toing_anchor: 311, toing_final: 311, swiggy_anchor: 550, swiggy_final: 550,
        root_causes: ["ANCHOR_PRICE"],
        applied_offer: { offer_id: "a9c14e33", final_price: 311, type: "anchor_price", burn_type: "RDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-07-01", valid_till: "2026-10-31" },
        current_lowest_fvo: null,
        store_id: "58941", eligible_groups: "ALL_USERS",
      },
      {
        item_id: "77453291", name: "Crispy Corn Masala",
        toing_anchor: 149, toing_final: 96, swiggy_anchor: 149, swiggy_final: 96,
        root_causes: ["SWIGGY_FLOW"],
        applied_offer: { offer_id: "f2b88d01", final_price: 96, type: "swiggy_flow", burn_type: "SDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-08-15", valid_till: "2026-09-15" },
        current_lowest_fvo: { offer_id: "f2b88d01", final_price: 96, type: "swiggy_flow", burn_type: "SDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-08-15", valid_till: "2026-09-15" },
        store_id: "58941", eligible_groups: "INDIA_2",
      },
      {
        item_id: "61209834", name: "Shimla Salted Fries",
        toing_anchor: 49, toing_final: 29, swiggy_anchor: 49, swiggy_final: 49,
        root_causes: ["NATIVE_FVO"],
        applied_offer: { offer_id: "33c19c63", final_price: 29, type: "native_fvo", burn_type: "MIXED", swiggy_share_pct: 75, restaurant_share_pct: 25, status: "INACTIVE", valid_from: "2026-08-01", valid_till: "2026-08-26" },
        current_lowest_fvo: { offer_id: "12de3100", final_price: 29, type: "native_fvo", burn_type: "SDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-08-27", valid_till: "2026-09-04" },
        store_id: "58941", eligible_groups: "ALL_USERS",
      },
      {
        item_id: "70038812", name: "Jatt Da Lassi",
        toing_anchor: 142, toing_final: 89, swiggy_anchor: 142, swiggy_final: 142,
        root_causes: ["NATIVE_FVO"],
        applied_offer: { offer_id: "88ef4c22", final_price: 89, type: "native_fvo", burn_type: "RDPO", swiggy_share_pct: 0, restaurant_share_pct: 100, status: "ACTIVE", valid_from: "2026-08-20", valid_till: "2026-09-20" },
        current_lowest_fvo: { offer_id: "88ef4c22", final_price: 89, type: "native_fvo", burn_type: "RDPO", swiggy_share_pct: 0, restaurant_share_pct: 100, status: "ACTIVE", valid_from: "2026-08-20", valid_till: "2026-09-20" },
        store_id: "58941", eligible_groups: "ALL_USERS",
      },
    ],
    summary: { anchor_price_total: 239, anchor_swiggy_share_pct: 100, anchor_restaurant_share_pct: 0, swiggy_flown_total: 53, swiggy_flown_swiggy_share: 53, swiggy_flown_restaurant_share: 0, toing_native_total: 73, toing_native_swiggy_share: 15, toing_native_restaurant_share: 58 },
    raw_offers: [
      { offer_id: "a9c14e33", discount_type: "ANCHOR_PRICE", burn_type: "RDPO", discount_amount: 239 },
      { offer_id: "f2b88d01", discount_type: "FINAL_PRICE", burn_type: "SDPO", discount_amount: 53 },
      { offer_id: "33c19c63", discount_type: "FINAL_PRICE", burn_type: "MIXED", discount_amount: 20 },
      { offer_id: "88ef4c22", discount_type: "FINAL_PRICE", burn_type: "RDPO", discount_amount: 53 },
    ],
  },

  "246997806119199": {
    order_id: "246997806119199",
    status: "completed",
    source: "transformer",
    restaurant: { id: "92044", name: "The Burger Lab", area: "Bandra West", city: "Mumbai", classifier: "QSR" },
    metrics: { true_dpo: 60, true_rdpo: 0, true_sdpo: 60, anchor_gap: 0 },
    routing: { has_anchor_case: false, has_swiggy_flow: false, has_native_fvo: true },
    items: [
      {
        item_id: "54321987", name: "Classic Smash Burger",
        toing_anchor: 259, toing_final: 199, swiggy_anchor: 259, swiggy_final: 259,
        root_causes: ["NATIVE_FVO"],
        applied_offer: { offer_id: "c3a77f19", final_price: 199, type: "native_fvo", burn_type: "SDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-09-01", valid_till: "2026-09-30" },
        current_lowest_fvo: { offer_id: "c3a77f19", final_price: 199, type: "native_fvo", burn_type: "SDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-09-01", valid_till: "2026-09-30" },
        store_id: "92044", eligible_groups: "ALL_USERS",
      },
    ],
    summary: { anchor_price_total: 0, anchor_swiggy_share_pct: 0, anchor_restaurant_share_pct: 0, swiggy_flown_total: 0, swiggy_flown_swiggy_share: 0, swiggy_flown_restaurant_share: 0, toing_native_total: 60, toing_native_swiggy_share: 60, toing_native_restaurant_share: 0 },
    raw_offers: [{ offer_id: "c3a77f19", discount_type: "FINAL_PRICE", burn_type: "SDPO", discount_amount: 60 }],
  },

  "247567714163587": {
    order_id: "247567714163587",
    status: "cancelled",
    source: "transformer",
    restaurant: { id: "104231", name: "Darun", area: "Chandannagar", city: "Kolkata", classifier: "Homestyle" },
    metrics: { true_dpo: 404, true_rdpo: 0, true_sdpo: 0, anchor_gap: 404 },
    routing: { has_anchor_case: true, has_swiggy_flow: false, has_native_fvo: false },
    items: [
      {
        item_id: "126614865", name: "Darun Special Mutton [4 Pieces]",
        toing_anchor: 95, toing_final: 95, swiggy_anchor: 499, swiggy_final: 499,
        root_causes: ["ANCHOR_PRICE"],
        applied_offer: { offer_id: "b7d21fe9", final_price: 95, type: "anchor_price", burn_type: "RDPO", swiggy_share_pct: 100, restaurant_share_pct: 0, status: "ACTIVE", valid_from: "2026-07-01", valid_till: "2026-12-31" },
        current_lowest_fvo: null,
        store_id: "104231", eligible_groups: "ALL_USERS",
      },
    ],
    summary: { anchor_price_total: 404, anchor_swiggy_share_pct: 100, anchor_restaurant_share_pct: 0, swiggy_flown_total: 0, swiggy_flown_swiggy_share: 0, swiggy_flown_restaurant_share: 0, toing_native_total: 0, toing_native_swiggy_share: 0, toing_native_restaurant_share: 0 },
    raw_offers: [{ offer_id: "b7d21fe9", discount_type: "ANCHOR_PRICE", burn_type: "RDPO", discount_amount: 404 }],
  },
}

export const TEST_ORDER_IDS = [
  { id: "246255027129300", label: "Pure Anchor Gap", desc: "₹140 anchor, true RDPO = 0" },
  { id: "246367024173056", label: "All 3 Cases", desc: "Anchor + Swiggy-flow + Native FVO" },
  { id: "246997806119199", label: "Same-day Realtime", desc: "Transformer source" },
  { id: "247567714163587", label: "Cancelled Order", desc: "₹404 anchor gap, no money moved" },
]
