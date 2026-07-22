export interface HubActor {
  email: string;
  name: string;
}

/** Fields §10.2 allows the hub to change. */
export interface LeadChanges {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postCode?: string;
  city?: string;
  model?: string;
  serial?: string;
}

export interface UpdateLeadRequest {
  uniqueId: string;
  changes?: LeadChanges;
  noteText?: string;
  stageTo?: string;
}

export interface AddLeadRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postCode?: string;
  city?: string;
  notes?: string;
}

export interface ReassignRequest {
  uniqueId: string;
  agentEmail: string;
  reason?: string;
}

export interface HubResult {
  ok: boolean;
  error?: string;
  row?: Record<string, unknown>;
  pending?: boolean;
}
