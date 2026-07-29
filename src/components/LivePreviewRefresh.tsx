"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

/**
 * Rendered only in ?preview=1 mode (inside the admin's live-preview
 * iframe): listens for save/autosave events from the Payload admin and
 * re-renders the server page, so edits appear as you type — the
 * Google Sites editing feel.
 */
export default function LivePreviewRefresh() {
  const router = useRouter();
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={typeof window !== "undefined" ? window.location.origin : ""}
    />
  );
}
