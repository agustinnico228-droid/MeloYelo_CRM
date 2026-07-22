import "server-only";
import { getLookupData } from "./sheets";

/**
 * Agent directory — source of truth is the Agents tab of the CRM sheet,
 * via the cached Sheets read layer (10 min TTL).
 */
export async function getAgentEmailSet(): Promise<ReadonlySet<string>> {
  try {
    const { agents } = await getLookupData();
    return new Set(
      agents.map((a) => a.crmEmail.toLowerCase()).filter(Boolean),
    );
  } catch {
    // No directory (e.g. Sheets down with a cold cache): env-override
    // roles still resolve; agents simply can't until data returns.
    return new Set<string>();
  }
}
