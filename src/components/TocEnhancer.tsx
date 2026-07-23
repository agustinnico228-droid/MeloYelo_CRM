"use client";

import { useEffect } from "react";

/**
 * The lexical renderer doesn't emit heading ids, so the TOC assigns
 * them client-side, in document order, to h2/h3 inside #page-content.
 */
export default function TocEnhancer({ ids }: { ids: string[] }) {
  useEffect(() => {
    const container = document.getElementById("page-content");
    if (!container) return;
    const headings = container.querySelectorAll<HTMLElement>("h2, h3");
    headings.forEach((h, i) => {
      if (ids[i]) h.id = ids[i];
    });
  }, [ids]);
  return null;
}
