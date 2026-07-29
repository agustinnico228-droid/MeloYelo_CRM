"use client";

import { useMemo, useState } from "react";
import {
  buildUtmUrl,
  isValidCampaignCode,
  normalizeUtmValue,
} from "@/lib/crm/utm";

/**
 * The UTM builder (§17 C1): utm_campaign is CHOSEN from the live
 * campaign list — the key rule is exact-match, and typing invites the
 * typos that silently split reporting. Values are corrected inline
 * (lowercase, hyphens), never rejected with an error wall.
 */

export interface UtmCampaignOption {
  title: string;
  code: string;
  landingPageUrl?: string;
  status: string;
}

const CUSTOM = "__custom__";

export default function UtmBuilder({
  campaigns,
}: {
  campaigns: UtmCampaignOption[];
}) {
  const [campaignChoice, setCampaignChoice] = useState(
    campaigns[0]?.code ?? CUSTOM,
  );
  const [customCampaign, setCustomCampaign] = useState("");
  const [landing, setLanding] = useState(campaigns[0]?.landingPageUrl ?? "");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const isCustom = campaignChoice === CUSTOM;
  const campaign = isCustom
    ? normalizeUtmValue(customCampaign)
    : campaignChoice;

  const knownCodes = useMemo(
    () => new Set(campaigns.map((c) => c.code)),
    [campaigns],
  );

  const campaignWarnings: string[] = [];
  if (isCustom && campaign !== "") {
    if (!isValidCampaignCode(campaign)) {
      campaignWarnings.push(
        "Campaign names follow YYMM-shortname (e.g. 2604-fuel-crisis), with a real month in positions 3-4.",
      );
    }
    if (!knownCodes.has(campaign)) {
      campaignWarnings.push(
        "This doesn't match an existing MeloYelo campaign. Check the name or create the campaign first: utm_campaign must exactly match the official campaign name.",
      );
    }
  }

  const ready =
    campaign !== "" &&
    source.trim() !== "" &&
    medium.trim() !== "" &&
    landing.trim() !== "";

  const url = ready
    ? buildUtmUrl(landing, { source, medium, campaign, content })
    : null;

  function selectCampaign(value: string) {
    setCampaignChoice(value);
    setCopied(false);
    if (value !== CUSTOM) {
      const match = campaigns.find((c) => c.code === value);
      if (match?.landingPageUrl && landing.trim() === "") {
        setLanding(match.landingPageUrl);
      }
    }
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  const inputCls =
    "mt-1 min-h-12 w-full rounded-control border border-my-line bg-my-surface px-3 text-my-ink placeholder:text-my-slate";

  return (
    <section className="rounded-card border border-my-line bg-my-surface p-5 shadow-card">
      <h2 className="text-h3">UTM builder</h2>
      <p className="mt-1 text-sm text-my-slate">
        Pick the campaign, don&apos;t type it, and the link can&apos;t break the
        exact-match rule.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm text-my-slate">Campaign *</span>
          <select
            value={campaignChoice}
            onChange={(e) => selectCampaign(e.target.value)}
            className={inputCls}
          >
            {campaigns.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.title} ({c.status})
              </option>
            ))}
            <option value={CUSTOM}>New campaign (type the code)...</option>
          </select>
        </label>

        {isCustom ? (
          <label className="block sm:col-span-2">
            <span className="text-sm text-my-slate">
              New campaign code (YYMM-shortname)
            </span>
            <input
              value={customCampaign}
              onChange={(e) => {
                setCustomCampaign(e.target.value);
                setCopied(false);
              }}
              placeholder="e.g. 2608-spring-launch"
              className={inputCls}
            />
            {campaignWarnings.map((w) => (
              <span
                key={w}
                className="mt-1 block rounded-control border border-my-warn/40 bg-my-warn/10 px-3 py-2 text-sm"
              >
                {w}
              </span>
            ))}
          </label>
        ) : null}

        <label className="block sm:col-span-2">
          <span className="text-sm text-my-slate">Landing page URL *</span>
          <input
            type="url"
            value={landing}
            onChange={(e) => {
              setLanding(e.target.value);
              setCopied(false);
            }}
            placeholder="https://meloyelo.nz/..."
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-sm text-my-slate">utm_source *</span>
          <input
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setCopied(false);
            }}
            placeholder="e.g. meta, google, newsletter"
            className={inputCls}
          />
          {source && normalizeUtmValue(source) !== source ? (
            <span className="mt-1 block text-sm text-my-slate">
              Will be tagged as: {normalizeUtmValue(source)}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm text-my-slate">utm_medium *</span>
          <input
            value={medium}
            onChange={(e) => {
              setMedium(e.target.value);
              setCopied(false);
            }}
            placeholder="e.g. paid-social, cpc, email"
            className={inputCls}
          />
          {medium && normalizeUtmValue(medium) !== medium ? (
            <span className="mt-1 block text-sm text-my-slate">
              Will be tagged as: {normalizeUtmValue(medium)}
            </span>
          ) : null}
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm text-my-slate">
            utm_content (optional: use for A/B variants, e.g. no-incentive /
            incentive)
          </span>
          <input
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setCopied(false);
            }}
            className={inputCls}
          />
        </label>
      </div>

      {url ? (
        <div className="mt-5 rounded-card border border-my-green/40 bg-my-green/10 p-4">
          <p className="text-sm font-bold">Your tagged link</p>
          <p className="mt-1 break-all text-sm">{url}</p>
          <button
            type="button"
            onClick={copy}
            className="mt-3 min-h-12 rounded-control bg-my-ink px-6 font-medium text-white transition-opacity hover:opacity-90"
          >
            {copied ? "Copied." : "Copy link"}
          </button>
        </div>
      ) : (
        <p className="mt-5 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
          Fill the campaign, landing page, source and medium to build the link.
        </p>
      )}
    </section>
  );
}
