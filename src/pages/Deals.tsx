import { Link } from 'react-router-dom'
import { deals, formatCurrency, getContact } from '../data'
import StageBadge from '../components/StageBadge'

export default function Deals() {
  const sorted = [...deals].sort((a, b) => b.value - a.value)
  const total = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        <p className="text-sm text-slate-500">
          {deals.length} deals · {formatCurrency(total)} total
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Deal</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Close date</th>
              <th className="px-5 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((deal) => {
              const contact = getContact(deal.contactId)
              return (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">{deal.title}</td>
                  <td className="px-5 py-3">
                    {contact ? (
                      <Link
                        to={`/contacts/${contact.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {contact.name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <StageBadge stage={deal.stage} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{deal.closeDate}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {formatCurrency(deal.value)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
