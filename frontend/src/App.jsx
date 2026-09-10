import { useState } from 'react'
import { MOCK_ORDERS, TEST_ORDER_IDS } from './mockData.js'
import RoutingBanners from './components/RoutingBanners.jsx'
import RestaurantCard from './components/RestaurantCard.jsx'
import MetricsRow from './components/MetricsRow.jsx'
import ItemCard from './components/ItemCard.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import OffersTable from './components/OffersTable.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

async function fetchOrder(orderId) {
  // If a backend URL is configured, try it first
  if (API_URL) {
    const res = await fetch(`${API_URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // No backend — use local mock data
  const data = MOCK_ORDERS[orderId.trim()]
  if (!data) {
    throw new Error(
      `Order not in demo set. Try: ${TEST_ORDER_IDS.map(t => t.id).join(', ')}`
    )
  }
  return data
}

export default function App() {
  const [orderId, setOrderId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (id) => {
    const target = (id || orderId).trim()
    if (!target) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await fetchOrder(target)
      setData(result)
      setOrderId(target)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">T</div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 leading-tight">Toing Discount Triage</h1>
            <p className="text-xs text-slate-500">Diagnose partner discount escalations instantly</p>
          </div>
          <div className="ml-auto text-xs text-slate-400 bg-slate-100 rounded px-2 py-1">
            {API_URL ? '🟢 Live' : '🟡 Demo mode'}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Order ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Paste order_id here…"
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              onClick={() => submit()}
              disabled={loading || !orderId.trim()}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Loading…' : 'Diagnose'}
            </button>
          </div>

          {/* Quick-fill test orders */}
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Demo orders:</p>
            <div className="flex flex-wrap gap-2">
              {TEST_ORDER_IDS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setOrderId(t.id); submit(t.id) }}
                  className="text-xs px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <span className="font-medium">{t.label}</span>
                  <span className="text-slate-400 ml-1">— {t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-4">
            {/* Cancelled banner */}
            {data.status === 'cancelled' && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Cancelled Order — No money moved</p>
                  <p className="text-xs text-red-600 mt-0.5">The discount config below is what partners see — but this order was cancelled before any funds transferred.</p>
                </div>
              </div>
            )}

            {/* Realtime source badge */}
            {data.source === 'transformer' && data.status !== 'cancelled' && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span>⚡</span> Same-day order — data from realtime transformer table
              </div>
            )}

            <RoutingBanners routing={data.routing} />
            <RestaurantCard restaurant={data.restaurant} orderId={data.order_id} />
            <MetricsRow metrics={data.metrics} />

            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Items</h2>
            {data.items.map(item => (
              <ItemCard key={item.item_id} item={item} />
            ))}

            <SummaryCards summary={data.summary} />
            <OffersTable offers={data.raw_offers} />
          </div>
        )}
      </main>
    </div>
  )
}
