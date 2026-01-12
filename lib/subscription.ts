export type SubscriptionSource = {
  url: string;
  prefix?: string;
};

export type MergeOptions = {
  includeEmptyNames?: boolean;
};

const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;

export function parseSources(input: string): SubscriptionSource[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [left, right] = line.includes("|")
        ? line.split("|")
        : line.includes(",")
        ? line.split(",")
        : ["", line];

      if (!right) {
        return { url: left.trim() };
      }

      return {
        url: right.trim(),
        prefix: left.trim()
      };
    });
}

export function parseManualNodes(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function decodeMaybeBase64(content: string): string {
  const trimmed = content.trim();
  if (trimmed.includes("://")) {
    return trimmed;
  }

  if (!base64Pattern.test(trimmed)) {
    return trimmed;
  }

  try {
    return Buffer.from(trimmed, "base64").toString("utf8");
  } catch {
    return trimmed;
  }
}

export function splitNodes(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes("://"));
}

export function applyPrefix(node: string, prefix?: string): string {
  if (!prefix) {
    return node;
  }

  const tag = `[${prefix}]`;
  const [base, fragment] = node.split("#");
  if (!fragment) {
    return `${node}#${encodeURIComponent(tag)}`;
  }

  const decoded = decodeURIComponent(fragment);
  const combined = `${tag} ${decoded}`.trim();
  return `${base}#${encodeURIComponent(combined)}`;
}

export function mergeNodes(
  sources: Array<{ nodes: string[]; prefix?: string }>,
  manualNodes: string[],
  options: MergeOptions = {}
): string[] {
  const merged = new Set<string>();
  sources.forEach(({ nodes, prefix }) => {
    nodes.forEach((node) => {
      const withPrefix = applyPrefix(node, prefix);
      merged.add(withPrefix);
    });
  });

  manualNodes.forEach((node) => merged.add(node));

  if (!options.includeEmptyNames) {
    return Array.from(merged);
  }

  return Array.from(merged);
}

export async function fetchSubscription(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "subconverter-web/0.1"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const text = await response.text();
  return decodeMaybeBase64(text);
}

export async function mergeSubscriptionSources(
  sources: SubscriptionSource[],
  manualNodes: string[]
): Promise<string[]> {
  const fetched = await Promise.all(
    sources.map(async (source) => {
      const content = await fetchSubscription(source.url);
      const nodes = splitNodes(content);
      return { nodes, prefix: source.prefix };
    })
  );

  return mergeNodes(fetched, manualNodes);
}

export function encodeBase64(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}
