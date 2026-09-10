import { useState } from 'react'

const burnColor = {
  RDPO: 'text-orange-700 bg-orange-100',
  SDPO: 'text-blue-700 bg-blue-100',
  MIXED: 'text-purple-700 bg-purple-100',
}

export default function OffersTable({ offers }) {
  const [open, setOpen] = useState(false)
  if (!offers || offers.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 text-left flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <span className="font-medium">Offers on Order <span className="text-slate-400 font-normal">({offers.length})</span></span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {['Offer ID', 'Type', 'Burn', 'Amount'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((o, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{o.offer_id}</td>
                  <td className="px-4 py-2 text-slate-600">{o.discount_type}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${burnColor[o.burn_type] || 'bg-slate-100 text-slate-600'}`}>
                      {o.burn_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-800">₹{o.discount_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
