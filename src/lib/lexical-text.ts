/** Flatten a Lexical rich-text tree to plain text (for banners/summaries). */

interface LexicalNode {
  text?: string;
  children?: LexicalNode[];
}

export function lexicalToPlainText(value: unknown): string {
  const root = (value as { root?: LexicalNode } | null)?.root;
  if (!root) return "";
  const parts: string[] = [];
  const walk = (node: LexicalNode) => {
    if (typeof node.text === "string") parts.push(node.text);
    node.children?.forEach(walk);
  };
  walk(root);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
