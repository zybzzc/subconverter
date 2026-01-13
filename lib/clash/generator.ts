/**
 * Clash Meta configuration generator
 */

import type { ProxyNode, ClashMetaConfig, ClashProxyGroup, GenerateOptions, ClashRuleProvider } from '../types';
import {
  GROUP_NAMES,
  COUNTRY_GROUPS,
  COUNTRY_PATTERNS,
  RESIDENTIAL_KEYWORDS,
  DEFAULT_RULE_PROVIDERS,
  DEFAULT_RULES,
  BASE_CONFIG,
} from './templates';
import { RegexNodeProcessor } from './regex-processor';
import type { NodeProcessor } from './processor';
import { getBusinessGroups } from './business-groups';
import { generateAllRulesForGroup, getSupplementaryGroupId } from './supplementary-rules-loader';

/**
 * Detect country code from node name
 */
export function detectCountry(nodeName: string): string | null {
  for (const { code, patterns } of COUNTRY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(nodeName)) {
        return code;
      }
    }
  }
  return null;
}

/**
 * Detect if a node is a residential IP node
 */
export function isResidentialNode(nodeName: string, customKeywords?: string[]): boolean {
  const lowerName = nodeName.toLowerCase();
  // Check default keywords
  if (RESIDENTIAL_KEYWORDS.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
    return true;
  }
  // Check custom keywords
  if (customKeywords && customKeywords.length > 0) {
    return customKeywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
  }
  return false;
}

/**
 * Group nodes by country
 */
export function groupNodesByCountry(nodes: ProxyNode[]): Record<string, ProxyNode[]> {
  const groups: Record<string, ProxyNode[]> = {};

  for (const node of nodes) {
    const country = detectCountry(node.name);
    if (country) {
      if (!groups[country]) {
        groups[country] = [];
      }
      groups[country].push(node);
    }
  }

  return groups;
}

/**
 * Get residential nodes
 */
export function getResidentialNodes(nodes: ProxyNode[], customKeywords?: string[]): ProxyNode[] {
  return nodes.filter(node => isResidentialNode(node.name, customKeywords));
}

/**
 * Detect if a node is an information-only node (e.g. Traffic, Expire date)
 */
export function isInfoNode(nodeName: string): boolean {
  const infoKeywords = ['流量', '到期', 'expire', 'traffic', '官网', '网址', '重置', 'reset'];
  const lowerName = nodeName.toLowerCase();
  return infoKeywords.some(kw => lowerName.includes(kw));
}

/**
 * Deduplicate nodes by name and server
 */
export function deduplicateNodes(nodes: ProxyNode[]): ProxyNode[] {
  const seen = new Set<string>();
  const result: ProxyNode[] = [];

  for (const node of nodes) {
    const key = `${node.name}|${node.server}:${node.port}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(node);
    }
  }

  return result;
}

/**
 * Generate Clash Meta configuration
 */
export async function generateClashConfig(
  nodes: ProxyNode[],
  options: GenerateOptions = {},
  processor: NodeProcessor = new RegexNodeProcessor()
): Promise<ClashMetaConfig> {
  const {
    groupByCountry = true,
    detectResidential = true,
    // Backward compatibility for boolean check, though new UI uses array
    includeBusinessGroups = true,
    selectedRulesets = [],
  } = options;

  // Determine active business groups
  // If selectedRulesets is provided, use it.
  // Fallback: if includeBusinessGroups is true but selectedRulesets is empty/undefined, default to AI+Telegram
  let activeBusinessIds: string[] = [];
  if (selectedRulesets && selectedRulesets.length > 0) {
    activeBusinessIds = selectedRulesets;
  } else if (includeBusinessGroups !== false) {
    // Legacy default
    activeBusinessIds = ['openai', 'telegram'];
  }

  const activeBusinessGroups = getBusinessGroups(activeBusinessIds);


  // Utilize the processor (Adapter Pattern)
  const {
    realNodes,
    residentialNodes,
    normalNodes,
    nodesByCountry
  } = await processor.process(nodes, options);

  const residentialNames = residentialNodes.map(n => n.name);
  const normalNames = normalNodes.map(n => n.name);

  const proxyGroups: ClashProxyGroup[] = [];
  const countryGroupNames: string[] = [];
  const ruleProviders: Record<string, ClashRuleProvider> = { ...DEFAULT_RULE_PROVIDERS };
  let rules: string[] = [];

  // 1. Generate Country Groups
  if (groupByCountry) {
    for (const [code, countryNodes] of Object.entries(nodesByCountry)) {
      const groupName = COUNTRY_GROUPS[code] || code;
      const nodeNames = countryNodes.map(n => n.name);

      if (nodeNames.length > 0) {
        proxyGroups.push({
          name: groupName,
          type: 'url-test',
          proxies: nodeNames,
          url: 'http://www.gstatic.com/generate_204',
          interval: 300,
          tolerance: 50,
        });
        countryGroupNames.push(groupName);
      }
    }
  }

  // 2. Generate Residential Group if any
  if (detectResidential && residentialNames.length > 0) {
    proxyGroups.push({
      name: GROUP_NAMES.RESIDENTIAL,
      type: 'select',
      proxies: residentialNames,
    });
  }

  // 3. Generate Base choice groups
  proxyGroups.push({
    name: GROUP_NAMES.AUTO,
    type: 'url-test',
    proxies: normalNames,
    url: 'http://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
  });

  proxyGroups.push({
    name: GROUP_NAMES.FALLBACK,
    type: 'fallback',
    proxies: normalNames,
    url: 'http://www.gstatic.com/generate_204',
    interval: 300,
  });

  // 4. Generate Business Groups (Dynamic)
  if (activeBusinessGroups.length > 0) {
    const usGroupName = COUNTRY_GROUPS['US'];
    const hasUsGroup = groupByCountry && countryGroupNames.includes(usGroupName);
    const hasResidentialGroup = detectResidential && residentialNames.length > 0;

    // Common proxies for business groups: Manual, Auto, Residential (if exists), Country groups
    const commonProxies: string[] = [GROUP_NAMES.MANUAL, GROUP_NAMES.AUTO];
    if (hasResidentialGroup) {
      commonProxies.push(GROUP_NAMES.RESIDENTIAL);
    }
    if (groupByCountry) {
      commonProxies.push(...countryGroupNames);
    } else {
      commonProxies.push(...normalNames);
    }

    // Special handling for AI (prioritize US)
    const aiProxies: string[] = [];
    if (hasUsGroup) aiProxies.push(usGroupName);
    aiProxies.push(GROUP_NAMES.MANUAL, GROUP_NAMES.AUTO);
    if (hasResidentialGroup) {
      aiProxies.push(GROUP_NAMES.RESIDENTIAL);
    }
    if (groupByCountry) {
      aiProxies.push(...countryGroupNames.filter(name => name !== usGroupName));
    } else {
      aiProxies.push(...normalNames);
    }

    for (const bg of activeBusinessGroups) {
      // Add Rule Provider
      ruleProviders[bg.ruleProvider.name] = bg.ruleProvider.def;

      // Add Proxy Group
      // Use AI-specific proxies for 'openai', generic for others
      const groupProxies = bg.id === 'openai' ? aiProxies : commonProxies;

      proxyGroups.push({
        name: bg.groupName,
        type: 'select',
        proxies: groupProxies,
      });
    }
  }

  // 5. Manual group
  const manualProxies: string[] = [GROUP_NAMES.AUTO, GROUP_NAMES.FALLBACK];
  if (detectResidential && residentialNames.length > 0) {
    manualProxies.push(GROUP_NAMES.RESIDENTIAL);
  }
  if (groupByCountry && countryGroupNames.length > 0) {
    manualProxies.push(...countryGroupNames);
  } else {
    manualProxies.push(...normalNames);
  }

  // Add the Manual group at the beginning of proxyGroups
  proxyGroups.unshift({
    name: GROUP_NAMES.MANUAL,
    type: 'select',
    proxies: manualProxies,
  });

  // 6. Build Rules
  // Priority: 1. Local/Private -> 2. Business Rules -> 3. CN/Final

  // Start with top priority default rules (Private/Local)
  // DEFAULT_RULES[0] = GEOIP,private,DIRECT,no-resolve
  const topRules = DEFAULT_RULES.slice(0, 1);
  // DEFAULT_RULES[3..4] = GEOSITE cn, GEOIP CN, MATCH
  const bottomRules = DEFAULT_RULES.slice(3);

  // Insert business rules (from rule-providers)
  const businessRules: string[] = [];
  for (const bg of activeBusinessGroups) {
    businessRules.push(...bg.rules);
  }

  // Insert supplementary rules (domain/IP rules from supplementary-rules.json)
  // These come BEFORE the RULE-SET rules to take priority (more specific)
  const supplementaryRules: string[] = [];
  for (const bg of activeBusinessGroups) {
    const suppGroupId = getSupplementaryGroupId(bg.id);
    if (suppGroupId) {
      const extraRules = generateAllRulesForGroup(suppGroupId, bg.groupName);
      supplementaryRules.push(...extraRules);
    }
  }

  // Final rule order:
  // 1. Private/Local (topRules)
  // 2. Supplementary domain/IP rules (higher priority, more specific)
  // 3. Business RULE-SET rules (remote rulesets)
  // 4. CN + Final (bottomRules)
  rules = [...topRules, ...supplementaryRules, ...businessRules, ...bottomRules];


  // 7. Build final config
  // Clean up internal properties from proxies before returning
  const cleanedProxies = realNodes.map(node => {
    const { _forceResidential, ...rest } = node as any;
    return rest as ProxyNode;
  });

  const config: ClashMetaConfig = {
    ...BASE_CONFIG,
    proxies: cleanedProxies,
    'proxy-groups': proxyGroups,
    'rule-providers': ruleProviders,
    rules: rules,
  };

  return config;
}

// Re-export helpers
export { GROUP_NAMES, COUNTRY_GROUPS, RESIDENTIAL_KEYWORDS } from './templates';
