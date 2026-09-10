export default function RoutingBanners({ routing }) {
  const { has_anchor_case, has_swiggy_flow, has_native_fvo } = routing

  return (
    <div className="space-y-2">
      {has_anchor_case && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
          <span className="mt-0.5 text-amber-500">◆</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Anchor Price RDPO</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Toing anchor is lower than Swiggy anchor — the gap shows as store discount in KOT, but the restaurant funds nothing.{' '}
              <span className="font-medium">Route to: Toing Anchor-Price POC</span> (they update Toing anchor price).
            </p>
          </div>
        </div>
      )}

      {has_swiggy_flow && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-300 rounded-xl px-4 py-3">
          <span className="mt-0.5 text-blue-500">◆</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Swiggy-Flown FVO</p>
            <p className="text-xs text-blue-700 mt-0.5">
              A Swiggy FVO is auto-flowing to Toing (Swiggy final price &lt; Toing anchor). No toggle to stop it on Toing alone.{' '}
              <span className="font-medium">Route to: Swiggy Discounting POC</span> — the discount must be stopped on Swiggy.
            </p>
          </div>
        </div>
      )}

      {has_native_fvo && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3">
          <span className="mt-0.5 text-green-500">◆</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Genuine Toing FVO</p>
            <p className="text-xs text-green-700 mt-0.5">
              This FVO was configured on Toing directly.{' '}
              <span className="font-medium">Route to: Toing Discounting Owner</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
