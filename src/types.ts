export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: 'lead' | 'active' | 'inactive'
  createdAt: string
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost'

export interface Deal {
  id: string
  title: string
  contactId: string
  value: number
  stage: DealStage
  closeDate: string
}
