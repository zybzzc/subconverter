/**
 * Common types for the application
 */

// --- Clash Types (Simplified) ---

export interface ProxyNode {
  name: string;
  type: string;
  server: string;
  port: number;
  [key: string]: any;
}

/** User-defined node overrides for editing */
export interface NodeOverride {
  /** Custom node name (overrides original) */
  customName?: string;
  /** Force include in specific groups */
  forceGroups?: string[];
  /** Mark as residential node */
  isResidential?: boolean;
  /** Exclude from generation */
  excluded?: boolean;
}

/** Extended ProxyNode with user overrides for UI editing */
export interface EditableNode extends ProxyNode {
  /** Unique ID for UI tracking */
  _id: string;
  /** Source subscription prefix */
  _source?: string;
  /** User overrides */
  _override?: NodeOverride;
}

export interface ClashProxyGroup {
  name: string;
  type: string;
  proxies: string[];
  url?: string;
  interval?: number;
  tolerance?: number;
  strategy?: string;
}

export interface ClashRuleProvider {
  type: 'http' | 'file';
  behavior: 'domain' | 'ipcidr' | 'classical';
  url?: string;
  path: string;
  interval?: number;
  format?: 'yaml' | 'text' | 'mrs';
}

export interface ClashMetaConfig {
  'mixed-port': number;
  'allow-lan': boolean;
  mode: 'rule' | 'global' | 'direct';
  'log-level': 'info' | 'warning' | 'error' | 'debug' | 'silent';
  'external-controller': string;
  dns: {
    enable: boolean;
    'enhanced-mode': 'fake-ip' | 'redir-host';
    'fake-ip-range': string;
    nameserver: string[];
    fallback: string[];
    'fallback-filter': {
      geoip: boolean;
      'geoip-code': string;
    };
  };
  proxies: ProxyNode[];
  'proxy-groups': ClashProxyGroup[];
  'rule-providers': Record<string, ClashRuleProvider>;
  rules: string[];
}


// --- Application Types ---

export interface SubscriptionSource {
  id: string;
  url: string;
  prefix?: string; // Optional prefix for nodes from this subscription
}

export interface GenerateOptions {
  /** Enable residential IP detection */
  detectResidential?: boolean;
  /** Custom keywords to identify residential nodes */
  customResidentialKeywords?: string[];

  /** Enable country grouping */
  groupByCountry?: boolean;

  /** 
   * selected business groups to include.
   * Values correspond to IDs in business-groups.ts (e.g., 'openai', 'telegram', 'google')
   */
  selectedRulesets?: string[];

  /** Expand remote rulesets inline (not yet fully implemented but reserved) */
  expandRulesets?: boolean;

  /** Enable node name normalization (AI or Regex) */
  normalizeNames?: boolean;

  /** Deprecated: use selectedRulesets instead */
  includeBusinessGroups?: boolean;
}

export interface StoredConfig {
  id: string;
  nodes: ProxyNode[];
  options: GenerateOptions;
  createdAt: number;
  expiresAt: number;
}
