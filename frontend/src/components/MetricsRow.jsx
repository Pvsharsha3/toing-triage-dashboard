function KPI({ label, value, note, color }) {
  const colors = {
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    slate: 'bg-slate-50 border-slate-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.slate}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">₹{value}</p>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

export default function MetricsRow({ metrics }) {
  const { true_dpo, true_rdpo, true_sdpo, anchor_gap } = metrics
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="True DPO" value={true_dpo} note="Total real discount" color="slate" />
      <KPI label="True RDPO" value={true_rdpo} note="Actual restaurant burn" color="green" />
      <KPI label="True SDPO" value={true_sdpo} note="Actual Swiggy burn" color="blue" />
      <KPI label="Anchor Gap" value={anchor_gap} note="False RDPO (Swiggy pays)" color="amber" />
    </div>
  )
}
