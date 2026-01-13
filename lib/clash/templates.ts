/**
 * Clash Meta configuration templates
 */

import type { ClashProxyGroup, ClashRuleProvider } from '../types';

/** Default proxy group names */
export const GROUP_NAMES = {
  MANUAL: '🚀 手动选择',
  AUTO: '⚡ 自动选择',
  FALLBACK: '🔄 故障转移',
  AI: '🤖 AI 服务',
  STREAMING: '📺 国际流媒体',
  TELEGRAM: '📱 Telegram',
  RESIDENTIAL: '🏠 家宽节点',
  DIRECT: '🎯 全球直连',
  REJECT: '🛑 广告拦截',
} as const;

/** Country codes to group names mapping */
export const COUNTRY_GROUPS: Record<string, string> = {
  HK: '🇭🇰 香港',
  TW: '🇹🇼 台湾',
  JP: '🇯🇵 日本',
  SG: '🇸🇬 新加坡',
  US: '🇺🇸 美国',
  KR: '🇰🇷 韩国',
  UK: '🇬🇧 英国',
  DE: '🇩🇪 德国',
};

/** Keywords for detecting residential IPs */
export const RESIDENTIAL_KEYWORDS = [
  '家宽',
  '住宅',
  'residential',
  'native',
  '原生',
  'isp',
  '本土',
  'resip',
];

/** Country detection patterns */
export const COUNTRY_PATTERNS: Array<{ code: string; patterns: RegExp[] }> = [
  { code: 'HK', patterns: [/香港|HK|Hong\s*Kong|hongkong/i] },
  { code: 'TW', patterns: [/台湾|TW|Taiwan|台北|台中/i] },
  { code: 'JP', patterns: [/日本|JP|Japan|东京|大阪|Tokyo|Osaka/i] },
  { code: 'SG', patterns: [/新加坡|SG|Singapore|狮城/i] },
  { code: 'US', patterns: [/美国|US|USA|United\s*States|洛杉矶|西雅图|硅谷|Los\s*Angeles|Seattle/i] },
  { code: 'KR', patterns: [/韩国|KR|Korea|首尔|Seoul/i] },
  { code: 'UK', patterns: [/英国|UK|United\s*Kingdom|Britain|伦敦|London/i] },
  { code: 'DE', patterns: [/德国|DE|Germany|法兰克福|Frankfurt/i] },
];

/**
 * Create default proxy groups
 */
export function createDefaultGroups(allProxies: string[]): ClashProxyGroup[] {
  const groups: ClashProxyGroup[] = [];

  // Manual selection - select type, includes all proxies
  groups.push({
    name: GROUP_NAMES.MANUAL,
    type: 'select',
    proxies: [GROUP_NAMES.AUTO, ...allProxies],
  });

  // Auto selection - url-test type
  groups.push({
    name: GROUP_NAMES.AUTO,
    type: 'url-test',
    proxies: allProxies,
    url: 'http://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
  });

  // Fallback
  groups.push({
    name: GROUP_NAMES.FALLBACK,
    type: 'fallback',
    proxies: allProxies,
    url: 'http://www.gstatic.com/generate_204',
    interval: 300,
  });

  return groups;
}

/** Default rule providers */
export const DEFAULT_RULE_PROVIDERS: Record<string, ClashRuleProvider> = {
  'ai-chat': {
    type: 'http',
    format: 'mrs',
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/category-ai-chat-!cn.mrs',
    path: './ruleset/category-ai-chat-!cn.mrs',
    interval: 86400,
  },
  'telegram': {
    type: 'http',
    format: 'mrs',
    behavior: 'ipcidr',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/telegram.mrs',
    path: './ruleset/telegram.mrs',
    interval: 86400,
  },
};

/** Default rules */
export const DEFAULT_RULES: string[] = [
  // 1. Private/Local networks (Top priority)
  // Note: GEOSITE,private is not available in standard GeoSite.dat
  'GEOIP,private,DIRECT,no-resolve',

  // 2. AI Services & Special business
  `RULE-SET,ai-chat,${GROUP_NAMES.AI}`,
  `RULE-SET,telegram,${GROUP_NAMES.TELEGRAM}`,

  // 3. Domestic traffic (CN)
  'GEOSITE,cn,DIRECT',
  'GEOIP,CN,DIRECT',

  // 4. Final match
  `MATCH,${GROUP_NAMES.MANUAL}`,
];

/** Base Clash Meta config template */
export const BASE_CONFIG = {
  'mixed-port': 7890,
  'allow-lan': true,
  mode: 'rule' as const,
  'log-level': 'info' as const,
  'external-controller': '127.0.0.1:9090',
  dns: {
    enable: true,
    'enhanced-mode': 'fake-ip' as const,
    'fake-ip-range': '198.18.0.1/16',
    nameserver: ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
    fallback: ['https://dns.google/dns-query', 'https://cloudflare-dns.com/dns-query'],
    'fallback-filter': {
      geoip: true,
      'geoip-code': 'CN',
    },
  },
};
