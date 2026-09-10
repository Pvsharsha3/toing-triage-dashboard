function SummaryCard({ title, total, swiggyShare, restaurantShare, color }) {
  if (total === 0) return null

  const colors = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-800', bar: 'bg-amber-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', bar: 'bg-blue-400' },
    green: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800', bar: 'bg-green-400' },
  }[color]

  return (
    <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${colors.title}`}>{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">₹{total}</p>
      <div className="mt-3 flex gap-3 text-xs text-slate-600">
        <span>Swiggy ₹{swiggyShare}</span>
        <span>Restaurant ₹{restaurantShare}</span>
      </div>
      {/* burn split bar */}
      {total > 0 && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bar}`}
            style={{ width: `${Math.round((swiggyShare / total) * 100)}%` }}
          />
        </div>
      )}
      <p className="text-xs text-slate-400 mt-1">Swiggy {Math.round((swiggyShare / total) * 100)}% / Restaurant {Math.round((restaurantShare / total) * 100)}%</p>
    </div>
  )
}

export default function SummaryCards({ summary }) {
  const {
    anchor_price_total, anchor_swiggy_share_pct: aSw, anchor_restaurant_share_pct: aRest,
    swiggy_flown_total: sfTotal, swiggy_flown_swiggy_share: sfSw, swiggy_flown_restaurant_share: sfRest,
    toing_native_total: tnTotal, toing_native_swiggy_share: tnSw, toing_native_restaurant_share: tnRest,
  } = summary

  const total = anchor_price_total + sfTotal + tnTotal
  if (total === 0) return null

  // Compute rupee amounts for anchor from pct
  const anchorSw = Math.round(anchor_price_total * (aSw / 100))
  const anchorRest = Math.round(anchor_price_total * (aRest / 100))

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Order-level summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard title="Anchor Price Discount" total={anchor_price_total} swiggyShare={anchorSw} restaurantShare={anchorRest} color="amber" />
        <SummaryCard title="Swiggy-Flown FVO Total" total={sfTotal} swiggyShare={sfSw} restaurantShare={sfRest} color="blue" />
        <SummaryCard title="Toing Native FVO Total" total={tnTotal} swiggyShare={tnSw} restaurantShare={tnRest} color="green" />
      </div>
    </div>
  )
}
