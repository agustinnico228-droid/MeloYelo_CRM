/** Domain types mapped 1:1 from the CRM sheet (§8). All raw values kept. */

export const STAGES = [
  "Lead",
  "Made contact",
  "Contact Failed",
  "Test Ride Booked",
  "Test Ride Completed",
  "Test Ride Declined",
  "Offer Accepted",
  "Offer Declined",
  "MY Customer",
] as const;

export type Stage = (typeof STAGES)[number];

export interface Lead {
  uniqueId: string;
  /** dd/MM/yyyy HH:mm:ss as stored */
  dateAdded: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Six different formats in live data — display as stored, normalise only for tel: */
  phone: string;
  /** String — leading zeros matter (0110) */
  postCode: string;
  /** Usually one of the nine stages; unknown values are kept and flagged */
  stage: string;
  agentManual: string;
  agent: string;
  /** The routing key for "my leads" */
  agentEmail: string;
  /** Append-only blob with inline timestamps */
  notes: string;
  city: string;
  model: string;
  serial: string;
  viewUpdateUrl: string;
  regMatchKey: string;
  /** Mixed date formats in live data — parse tolerantly, never show "Invalid Date" */
  stageUpdatedAt: string;
  stageUpdateFrom: string;
  stageUpdateTo: string;
  alert48Sent: string;
  alert5DaySent: string;
  finalFollowUpSent: string;
  /** null when blank or unparseable; extreme outliers exist */
  speedToLeadMinutes: number | null;
  source: string;
  liveUpdateLink: string;
  /** Currently empty on every row — hide the field when absent */
  trackingDetails: string;
}

export interface Agent {
  name: string;
  notificationEmail: string;
  crmEmail: string;
  region: string;
}

export interface PostcodeRoute {
  postcode: string;
  agentName: string;
  agentEmail: string;
}

export interface StageHistoryEntry {
  uniqueId: string;
  from: string;
  to: string;
  changedAt: string;
  agent: string;
}

export interface LogEntry {
  raw: string[];
}
