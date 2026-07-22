import { Link } from 'react-router-dom'
import { contacts, deals, formatCurrency, getContact } from '../data'
import StageBadge from '../components/StageBadge'

export default function Dashboard() {
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const wonValue = deals
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + d.value, 0)

  const stats = [
    { label: 'Contacts', value: String(contacts.length) },
    { label: 'Open deals', value: String(openDeals.length) },
    { label: 'Pipeline value', value: formatCurrency(pipelineValue) },
    { label: 'Won this year', value: formatCurrency(wonValue) },
  ]

  const recentDeals = [...deals]
    .sort((a, b) => b.closeDate.localeCompare(a.closeDate))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Upcoming close dates</h2>
          <Link
            to="/deals"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View all deals →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentDeals.map((deal) => {
            const contact = getContact(deal.contactId)
            return (
              <li
                key={deal.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{deal.title}</p>
                  <p className="text-xs text-slate-500">
                    {contact?.company} · closes {deal.closeDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(deal.value)}
                  </span>
                  <StageBadge stage={deal.stage} />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
