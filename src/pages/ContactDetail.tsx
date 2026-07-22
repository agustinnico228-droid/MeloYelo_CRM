import { Link, useParams } from 'react-router-dom'
import { formatCurrency, getContact, getDealsForContact } from '../data'
import StageBadge from '../components/StageBadge'

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const contact = id ? getContact(id) : undefined

  if (!contact) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Contact not found</h1>
        <Link
          to="/contacts"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to contacts
        </Link>
      </div>
    )
  }

  const contactDeals = getDealsForContact(contact.id)

  return (
    <div className="space-y-6">
      <Link
        to="/contacts"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ← Back to contacts
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{contact.name}</h1>
            <p className="text-slate-500">
              {contact.role} at {contact.company}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
            {contact.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-0.5 font-medium">{contact.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="mt-0.5 font-medium">{contact.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Contact since</dt>
            <dd className="mt-0.5 font-medium">{contact.createdAt}</dd>
          </div>
        </dl>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-4 font-semibold">
          Deals ({contactDeals.length})
        </h2>
        {contactDeals.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">No deals yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contactDeals.map((deal) => (
              <li
                key={deal.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{deal.title}</p>
                  <p className="text-xs text-slate-500">closes {deal.closeDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(deal.value)}
                  </span>
                  <StageBadge stage={deal.stage} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
