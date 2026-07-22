import { Link } from 'react-router-dom'
import { contacts } from '../data'
import type { Contact } from '../types'

const statusStyles: Record<Contact['status'], string> = {
  lead: 'bg-sky-100 text-sky-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
}

export default function Contacts() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {contact.name}
                  </Link>
                  <p className="text-xs text-slate-500">{contact.role}</p>
                </td>
                <td className="px-5 py-3">{contact.company}</td>
                <td className="px-5 py-3 text-slate-500">{contact.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[contact.status]}`}
                  >
                    {contact.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
