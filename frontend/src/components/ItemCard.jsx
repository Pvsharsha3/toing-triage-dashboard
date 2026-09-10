import { useState } from 'react'

const ROOT_CAUSE_STYLE = {
  ANCHOR_PRICE: 'bg-amber-100 text-amber-800 border-amber-200',
  SWIGGY_FLOW: 'bg-blue-100 text-blue-800 border-blue-200',
  NATIVE_FVO: 'bg-green-100 text-green-800 border-green-200',
}

const ROOT_CAUSE_LABEL = {
  ANCHOR_PRICE: 'Anchor Price',
  SWIGGY_FLOW: 'Swiggy-Flown',
  NATIVE_FVO: 'Native FVO',
}

function PriceCell({ label, value, strikethrough }) {
  return (
    <div className="text-center p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${strikethrough ? 'line-through text-slate-400' : 'text-slate-800'}`}>
        ₹{value}
      </p>
    </div>
  )
}

function OfferDetail({ label, offer }) {
  if (!offer) return (
    <div className="text-xs text-slate-400 italic py-2">{label}: None</div>
  )

  const statusColor = offer.status === 'ACTIVE'
    ? 'text-green-700 bg-green-50'
    : 'text-red-700 bg-red-50'

  const typeLabel = { anchor_price: 'Anchor Price', swiggy_flow: 'Swiggy-Flown', native_fvo: 'Native FVO' }[offer.type] || offer.type
  const burnBadge = { RDPO: 'bg-orange-100 text-orange-700', SDPO: 'bg-blue-100 text-blue-700', MIXED: 'bg-purple-100 text-purple-700' }[offer.burn_type] || 'bg-slate-100 text-slate-600'

  return (
    <div className="py-2">
      <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono bg-slate-100 text-slate-700 rounded px-1.5 py-0.5">{offer.offer_id}</span>
        <span className="font-semibold text-slate-700">₹{offer.final_price}</span>
        <span className="text-slate-500">{typeLabel}</span>
        <span className={`rounded px-1.5 py-0.5 ${burnBadge}`}>{offer.burn_type}</span>
        <span className={`rounded px-1.5 py-0.5 font-medium ${statusColor}`}>{offer.status}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-slate-400">
        <span>Swiggy {offer.swiggy_share_pct}% / Restaurant {offer.restaurant_share_pct}%</span>
        <span>Valid: {offer.valid_from} → {offer.valid_till}</span>
      </div>
    </div>
  )
}

export default function ItemCard({ item }) {
  const [open, setOpen] = useState(false)

  const {
    name, toing_anchor, toing_final, swiggy_anchor, swiggy_final,
    root_causes, applied_offer, current_lowest_fvo,
    store_id, eligible_groups, item_id,
  } = item

  const toingDiscount = toing_anchor - toing_final
  const swiggyDiscount = swiggy_anchor - swiggy_final

  const copyText = [
    `Store ID: ${store_id}`,
    `Item ID: ${item_id}`,
    `Eligible groups: ${eligible_groups || 'ALL_USERS'}`,
    applied_offer ? `Offer ID: ${applied_offer.offer_id}` : '',
  ].filter(Boolean).join('\n')

  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-800">{name}</h3>
          <div className="flex flex-wrap gap-1 justify-end">
            {root_causes.map(rc => (
              <span key={rc} className={`text-xs font-medium border rounded-full px-2 py-0.5 ${ROOT_CAUSE_STYLE[rc]}`}>
                {ROOT_CAUSE_LABEL[rc]}
              </span>
            ))}
          </div>
        </div>

        {/* 4-price grid */}
        <div className="grid grid-cols-4 divide-x divide-slate-100 border border-slate-100 rounded-lg bg-slate-50">
          <PriceCell label="Toing Anchor ↓" value={toing_anchor} strikethrough={toingDiscount > 0} />
          <PriceCell label="Toing Final" value={toing_final} />
          <PriceCell label="Swiggy Anchor ↓" value={swiggy_anchor} strikethrough={swiggyDiscount > 0} />
          <PriceCell label="Swiggy Final" value={swiggy_final} />
        </div>
      </div>

      {/* Expandable offer details */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 text-left text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
      >
        <span>{open ? '▲' : '▼'}</span>
        <span>Offer details</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 space-y-1 divide-y divide-slate-100">
          <OfferDetail label="Applied on this order" offer={applied_offer} />
          <OfferDetail label="Current lowest active FVO" offer={current_lowest_fvo} />
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Store {store_id} · {eligible_groups || 'ALL_USERS'}
            </div>
            <button
              onClick={copy}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {copied ? '✓ Copied' : '📋 Copy offer details'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
