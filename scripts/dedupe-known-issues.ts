/**
 * One-off: remove duplicate knownIssues rows created by seed + sync
 * using slightly different punctuation (en-dash vs hyphen). Keeps the
 * earliest of each group, deletes the rest. Comparison normalises
 * dashes, quotes and whitespace.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const normalize = (t: string) =>
  t
    .toLowerCase()
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const payload = await getPayload({ config });
const res = await payload.find({
  collection: "knownIssues",
  limit: 200,
  sort: "createdAt",
});

const seen = new Map<string, number>();
let removed = 0;
for (const doc of res.docs) {
  const key = normalize(doc.title);
  if (seen.has(key)) {
    await payload.delete({ collection: "knownIssues", id: doc.id });
    console.log(`deleted duplicate: "${doc.title}" (id ${doc.id})`);
    removed++;
  } else {
    seen.set(key, doc.id as number);
  }
}
console.log(
  removed === 0
    ? "no duplicates found"
    : `${removed} duplicate(s) removed, ${seen.size} unique issues remain`,
);
process.exit(0);
