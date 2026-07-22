import type { Contact, Deal } from '../types'
import mock from './mock.json'

export const contacts = mock.contacts as Contact[]
export const deals = mock.deals as Deal[]

export function getContact(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id)
}

export function getDealsForContact(contactId: string): Deal[] {
  return deals.filter((d) => d.contactId === contactId)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
