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

// ── SSO Connect Panel ─────────────────────────────────────────────────────────
const SF_PAT_URL = 'https://app.snowflake.com/gzavxab/swiggy_mumbai/#/me/programmatic-access'

function ConnectPanel({ onConnect }) {
  const [step, setStep] = useState('idle') // idle | waiting | pasting | connecting
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  // Open Snowflake in a new tab and move to "waiting for paste" step
  const openSnowflake = () => {
    window.open(SF_PAT_URL, '_blank', 'noopener,noreferrer')
    setStep('waiting')
    setToken('')
    setError('')
  }

  // Auto-connect the moment the user pastes (no button needed)
  const handlePaste = async (e) => {
    const pasted = (e.clipboardData?.getData('text') || '').trim()
    if (!pasted) return
    setToken(pasted)
    setStep('connecting')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/health`)
      if (!res.ok) throw new Error('Backend unreachable — make sure the server is running.')
      sessionStorage.setItem('sf_token', pasted)
      onConnect(pasted)
    } catch (e) {
      setError(e.message)
      setStep('waiting')
    }
  }

  // Fallback: manual connect button (for users who typed instead of pasting)
  const connectManual = async () => {
    if (!token.trim()) return
    setStep('connecting')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/health`)
      if (!res.ok) throw new Error('Backend unreachable.')
      sessionStorage.setItem('sf_token', token.trim())
      onConnect(token.trim())
    } catch (e) {
      setError(e.message)
      setStep('waiting')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-3">T</div>
          <h1 className="text-xl font-semibold text-white">Toing Discount Triage</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in with your Swiggy Snowflake account</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {step === 'idle' && (
            <>
              <button
                onClick={openSnowflake}
                className="w-full py-3 rounded-xl bg-[#29B5E8] hover:bg-[#22a5d4] text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors shadow"
              >
                {/* Snowflake icon */}
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L24 44M24 4L17 11M24 4L31 11M24 44L17 37M24 44L31 37M4 24H44M4 24L11 17M4 24L11 31M44 24L37 17M44 24L37 31M8.7 10.7L39.3 37.3M8.7 10.7L17.3 11.3M8.7 10.7L8 19.3M39.3 37.3L30.7 36.7M39.3 37.3L40 28.7M39.3 10.7L8.7 37.3M39.3 10.7L30.7 11.3M39.3 10.7L40 19.3M8.7 37.3L17.3 36.7M8.7 37.3L8 28.7" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Sign in with Swiggy SSO
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Opens Snowflake in a new tab — log in with your Swiggy Google account
              </p>
            </>
          )}

          {(step === 'waiting' || step === 'connecting' || step === 'pasting') && (
            <>
              {/* Progress steps */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">✓</div>
                <span className="text-xs text-green-400">Opened Snowflake</span>
              </div>

              <div className="bg-slate-700 rounded-xl p-4 mb-4 text-xs text-slate-300 space-y-2">
                <p className="font-medium text-white">In the Snowflake tab:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Click <strong className="text-slate-200">+ Token</strong> → give it any name → <strong className="text-slate-200">Create</strong></li>
                  <li>Click <strong className="text-slate-200">Copy to clipboard</strong></li>
                  <li>Come back here and paste</li>
                </ol>
              </div>

              <div className="relative">
                <textarea
                  autoFocus
                  rows={3}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Paste token here (Ctrl+V / Cmd+V)…"
                  className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-600 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#29B5E8] resize-none"
                />
                {step === 'connecting' && (
                  <div className="absolute inset-0 rounded-xl bg-slate-900/70 flex items-center justify-center">
                    <span className="text-xs text-[#29B5E8]">Connecting…</span>
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

              {token && step !== 'connecting' && (
                <button
                  onClick={connectManual}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#29B5E8] hover:bg-[#22a5d4] text-white text-sm font-semibold transition-colors"
                >
                  Connect
                </button>
              )}

              <button
                onClick={() => { setStep('idle'); setToken(''); setError('') }}
                className="mt-2 w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
              >
                ← Back
              </button>
            </>
          )}

          {error && step === 'idle' && (
            <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
          )}
        </div>

        <button
          onClick={() => onConnect(null)}
          className="mt-4 w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-2"
        >
          Use demo mode (4 test orders, no login needed)
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
