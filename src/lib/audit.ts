import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Audit trail (§10.5): every CRM write is recorded app-side — actor,
 * record, field, old → new, timestamp. The sheet's Logs tab is a backup,
 * not the audit trail.
 *
 * Storage: Postgres via the Payload auditLog collection once Phase 10
 * lands. Until then entries append to a local JSONL file so nothing is
 * lost during development (Cloud Run's disk is ephemeral — do not ship
 * to production without the Postgres wiring).
 */

export interface AuditEntry {
  timestamp: string;
  actorEmail: string;
  action: "updateLead" | "addLead" | "reassign";
  uniqueId: string;
  field: string;
  oldValue: string;
  newValue: string;
}

const AUDIT_FILE = path.join(process.cwd(), ".data", "audit.jsonl");

export async function recordAudit(
  entries: Omit<AuditEntry, "timestamp">[],
): Promise<void> {
  if (entries.length === 0) return;
  const stamped: AuditEntry[] = entries.map((e) => ({
    timestamp: new Date().toISOString(),
    ...e,
  }));
  try {
    await mkdir(path.dirname(AUDIT_FILE), { recursive: true });
    await appendFile(
      AUDIT_FILE,
      stamped.map((e) => JSON.stringify(e)).join("\n") + "\n",
      "utf8",
    );
  } catch (err) {
    // Auditing must never block the write itself — but be loud about it.
    console.error("audit write failed", err);
  }
}

export async function recentAudit(limit = 100): Promise<AuditEntry[]> {
  try {
    const raw = await readFile(AUDIT_FILE, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .reverse()
      .map((line) => JSON.parse(line) as AuditEntry);
  } catch {
    return [];
  }
}
