import { useState, useEffect } from 'react'
import { MOCK_ORDERS, TEST_ORDER_IDS } from './mockData.js'
import RoutingBanners from './components/RoutingBanners.jsx'
import RestaurantCard from './components/RestaurantCard.jsx'
import MetricsRow from './components/MetricsRow.jsx'
import ItemCard from './components/ItemCard.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import OffersTable from './components/OffersTable.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''
const LIVE_MODE = !!API_URL

async function fetchOrder(orderId, sfToken) {
  if (LIVE_MODE) {
    const headers = { 'Content-Type': 'application/json' }
    if (sfToken) headers['X-SF-Token'] = sfToken

    const res = await fetch(`${API_URL}/api/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ order_id: orderId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // Demo mode — use local mock data
  const data = MOCK_ORDERS[orderId.trim()]
  if (!data) {
    throw new Error(
      `Order not in demo set. Try: ${TEST_ORDER_IDS.map(t => t.id).join(', ')}`
    )
  }
  return data
}

// ── PAT Connect Panel ─────────────────────────────────────────────────────────
function ConnectPanel({ onConnect }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const connect = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError('')
    try {
      // Quick validation: hit /api/health — if backend accepts, store token
      const res = await fetch(`${API_URL}/api/health`)
      if (!res.ok) throw new Error('Backend unreachable')
      sessionStorage.setItem('sf_token', token.trim())
      onConnect(token.trim())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xl">T</div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Toing Discount Triage</h1>
            <p className="text-xs text-slate-500">Connect with your Snowflake account</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-700 space-y-1">
          <p className="font-semibold text-blue-800">Get your Snowflake Personal Access Token:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Go to <span className="font-mono">app.snowflake.com</span> (log in with Swiggy SSO)</li>
            <li>Click your avatar (top right) → <strong>My Profile</strong></li>
            <li>Programmatic Access Tokens → <strong>Add Token</strong></li>
            <li>Copy the token and paste below</li>
          </ol>
          <p className="text-blue-500 mt-1">Token stays in your browser session only — never sent to any server except Snowflake.</p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Personal Access Token
        </label>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste your Snowflake PAT here…"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />

        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}

        <button
          onClick={connect}
          disabled={loading || !token.trim()}
          className="mt-4 w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Connecting…' : 'Connect to Snowflake'}
        </button>

        <button
          onClick={() => onConnect(null)}
          className="mt-2 w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Use demo mode instead (4 test orders)
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function App() {
  const [sfToken, setSfToken] = useState(() =>
    LIVE_MODE ? sessionStorage.getItem('sf_token') : null
  )
  const [showConnect, setShowConnect] = useState(LIVE_MODE && !sfToken)

  const [orderId, setOrderId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = (token) => {
    setSfToken(token)
    setShowConnect(false)
  }

  const disconnect = () => {
    sessionStorage.removeItem('sf_token')
    setSfToken(null)
    setData(null)
    setError(null)
    if (LIVE_MODE) setShowConnect(true)
  }

  const submit = async (id) => {
    const target = (id || orderId).trim()
    if (!target) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await fetchOrder(target, sfToken)
      setData(result)
      setOrderId(target)
    } catch (e) {
      if (e.message.includes('token invalid') || e.message.includes('401')) {
        disconnect()
      }
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (showConnect) return <ConnectPanel onConnect={handleConnect} />

  const isLive = LIVE_MODE && sfToken

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
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs rounded px-2 py-1 ${isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isLive ? '🟢 Live — Snowflake' : '🟡 Demo mode'}
            </span>
            {isLive && (
              <button
                onClick={disconnect}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Disconnect
              </button>
            )}
            {!isLive && LIVE_MODE && (
              <button
                onClick={() => setShowConnect(true)}
                className="text-xs text-orange-500 hover:text-orange-700 transition-colors"
              >
                Connect
              </button>
            )}
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

          {!isLive && (
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
          )}
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
            {data.status === 'cancelled' && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Cancelled Order — No money moved</p>
                  <p className="text-xs text-red-600 mt-0.5">The discount config below is what partners see — but this order was cancelled before any funds transferred.</p>
                </div>
              </div>
            )}

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
