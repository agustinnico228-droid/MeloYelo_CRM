import type { Lead } from "./types";

/**
 * Likely duplicates (§9.5): one person under two emails, two people
 * sharing one email, repeated phone numbers. Never auto-merged — this
 * only surfaces candidates for a human to review.
 */

export interface DuplicateGroup {
  key: string;
  kind: "email" | "phone" | "name";
  leads: Lead[];
}

function phoneKey(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^640?/, "0");
  return digits.length >= 7 ? digits.replace(/^(?!0)/, "0") : "";
}

export function findLikelyDuplicates(leads: Lead[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();

  const collect = (
    kind: DuplicateGroup["kind"],
    keyOf: (l: Lead) => string,
  ) => {
    const map = new Map<string, Lead[]>();
    for (const lead of leads) {
      const key = keyOf(lead);
      if (key === "") continue;
      map.set(key, [...(map.get(key) ?? []), lead]);
    }
    for (const [key, group] of map) {
      if (group.length < 2) continue;
      const ids = group
        .map((l) => l.uniqueId)
        .sort()
        .join("|");
      if (seen.has(ids)) continue;
      seen.add(ids);
      groups.push({ key, kind, leads: group });
    }
  };

  collect("email", (l) => l.email.trim().toLowerCase());
  collect("phone", (l) => phoneKey(l.phone));
  collect(
    "name",
    (l) =>
      l.firstName && l.lastName
        ? `${l.firstName} ${l.lastName}`.trim().toLowerCase()
        : "",
  );

  return groups;
}
