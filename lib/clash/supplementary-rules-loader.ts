/**
 * Supplementary Rules System
 * 
 * Allows adding extra domain/IP rules that supplement remote rulesets (.mrs)
 * when they haven't been updated yet (e.g., new AI services, new YouTube products)
 */

import supplementaryData from './supplementary-rules.json';

export interface SupplementaryRuleSet {
  name: string;
  domains?: string[];
  ipCidrs?: string[];
}

export interface SupplementaryRulesConfig {
  version: string;
  lastUpdated: string;
  description: string;
  rules: Record<string, SupplementaryRuleSet>;
}

// Type assertion for imported JSON
const config = supplementaryData as SupplementaryRulesConfig;

/**
 * Get supplementary rules for a specific business group
 * @param groupId - The group ID (e.g., 'ai', 'youtube', 'telegram')
 * @returns The supplementary rules for the group, or undefined if not found
 */
export function getSupplementaryRules(groupId: string): SupplementaryRuleSet | undefined {
  return config.rules[groupId];
}

/**
 * Get all supplementary rules
 */
export function getAllSupplementaryRules(): Record<string, SupplementaryRuleSet> {
  return config.rules;
}

/**
 * Get supplementary rules config metadata
 */
export function getSupplementaryRulesMetadata(): { version: string; lastUpdated: string; description: string } {
  return {
    version: config.version,
    lastUpdated: config.lastUpdated,
    description: config.description,
  };
}

/**
 * Generate DOMAIN-SUFFIX rules for a business group from supplementary rules
 * @param groupId - The group ID
 * @param targetGroup - The proxy group name to route traffic to
 * @returns Array of Clash rule strings
 */
export function generateDomainRules(groupId: string, targetGroup: string): string[] {
  const ruleSet = getSupplementaryRules(groupId);
  if (!ruleSet || !ruleSet.domains) return [];

  const rules: string[] = [];
  for (const domain of ruleSet.domains) {
    // Handle wildcard domains (*.example.com -> DOMAIN-SUFFIX)
    if (domain.startsWith('*.')) {
      rules.push(`DOMAIN-SUFFIX,${domain.slice(2)},${targetGroup}`);
    } else if (domain.includes('*')) {
      // More complex wildcards use DOMAIN-KEYWORD or DOMAIN-REGEX
      // For simplicity, skip complex wildcards for now
      console.warn(`Skipping complex wildcard domain: ${domain}`);
    } else {
      // Exact domain
      rules.push(`DOMAIN,${domain},${targetGroup}`);
    }
  }
  return rules;
}

/**
 * Generate IP-CIDR rules for a business group from supplementary rules
 * @param groupId - The group ID
 * @param targetGroup - The proxy group name to route traffic to
 * @returns Array of Clash rule strings
 */
export function generateIpCidrRules(groupId: string, targetGroup: string): string[] {
  const ruleSet = getSupplementaryRules(groupId);
  if (!ruleSet || !ruleSet.ipCidrs) return [];

  const rules: string[] = [];
  for (const cidr of ruleSet.ipCidrs) {
    if (cidr.includes(':')) {
      // IPv6
      rules.push(`IP-CIDR6,${cidr},${targetGroup},no-resolve`);
    } else {
      // IPv4
      rules.push(`IP-CIDR,${cidr},${targetGroup},no-resolve`);
    }
  }
  return rules;
}

/**
 * Generate all rules (domain + IP) for a business group
 * @param groupId - The group ID
 * @param targetGroup - The proxy group name to route traffic to
 * @returns Array of Clash rule strings
 */
export function generateAllRulesForGroup(groupId: string, targetGroup: string): string[] {
  return [
    ...generateDomainRules(groupId, targetGroup),
    ...generateIpCidrRules(groupId, targetGroup),
  ];
}

/**
 * Mapping from business-groups.ts IDs to supplementary-rules.json IDs
 * This allows the generator to know which supplementary rules apply to which business group
 */
export const BUSINESS_TO_SUPPLEMENTARY_MAP: Record<string, string> = {
  'openai': 'ai',
  'telegram': 'telegram',
  'google': 'google',
  'youtube': 'youtube',
  'netflix': 'netflix',
  'twitter': 'twitter',
  'tiktok': 'tiktok',
  'github': 'github',
  'steam': 'steam',
  'discord': 'discord',
  // Add more mappings as needed
};

/**
 * Get supplementary group ID for a business group ID
 */
export function getSupplementaryGroupId(businessGroupId: string): string | undefined {
  return BUSINESS_TO_SUPPLEMENTARY_MAP[businessGroupId];
}
