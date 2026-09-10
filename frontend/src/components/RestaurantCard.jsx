export default function RestaurantCard({ restaurant, orderId }) {
  const { id, name, area, city, classifier } = restaurant
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{area}, {city}</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">{classifier}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>Restaurant ID: <span className="font-mono text-slate-700">{id}</span></span>
        <span>Order ID: <span className="font-mono text-slate-700">{orderId}</span></span>
      </div>
    </div>
  )
}
