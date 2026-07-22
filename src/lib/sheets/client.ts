import "server-only";
import { JWT } from "google-auth-library";

/**
 * Read-only Sheets API v4 client (§13). Service account with Viewer on the
 * sheet; the key never reaches the browser — this module is server-only.
 */

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export function spreadsheetId(): string {
  return process.env.SHEETS_SPREADSHEET_ID ?? "";
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function serviceAccount(): ServiceAccount | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!b64) return null;
  try {
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (json.client_email && json.private_key) return json;
    return null;
  } catch {
    return null;
  }
}

export function isSheetsConfigured(): boolean {
  return Boolean(spreadsheetId() && serviceAccount());
}

let jwtClient: JWT | null = null;

function getJwt(): JWT {
  if (!jwtClient) {
    const sa = serviceAccount();
    if (!sa) throw new Error("Sheets service account is not configured");
    jwtClient = new JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: SCOPES,
    });
  }
  return jwtClient;
}

/**
 * Read whole tabs in one call with values.batchGet — never per-row (§13).
 * Returns ranges in request order; missing tabs come back as empty arrays.
 */
export async function batchGetValues(
  ranges: readonly string[],
): Promise<string[][][]> {
  const { token } = await getJwt().getAccessToken();
  if (!token) throw new Error("Could not obtain a Sheets access token");

  const params = new URLSearchParams({ majorDimension: "ROWS" });
  for (const r of ranges) params.append("ranges", r);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId()}/values:batchGet?${params}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  }

  const body = (await res.json()) as {
    valueRanges?: { values?: string[][] }[];
  };
  return (body.valueRanges ?? []).map((vr) => vr.values ?? []);
}
