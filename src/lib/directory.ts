/**
 * Agent directory — source of truth is the Agents tab of the CRM sheet.
 * Phase 3 wires this to the Sheets read layer (10 min cache). Until then
 * it returns an empty set, so only env-override roles resolve.
 */
export async function getAgentEmailSet(): Promise<ReadonlySet<string>> {
  return new Set<string>();
}
