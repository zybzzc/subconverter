/**
 * Definitions for external business rule sets (Rule Providers)
 */

import type { ClashRuleProvider } from '../types';

export interface BusinessGroupDef {
  id: string;         // Unique ID (e.g., 'openai')
  label: string;      // Display name (e.g., '🤖 AI Services')
  groupName: string;  // Clash Proxy Group Name (e.g., '🤖 AI 服务')
  icon?: string;      // Optional icon char
  description: string;
  ruleProvider: {
    name: string;
    def: ClashRuleProvider;
  };
  rules: string[];    // Rules to add to the config
}

const META_RULES_BASE = 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta';

export const BUSINESS_GROUPS: BusinessGroupDef[] = [
  {
    id: 'openai',
    label: 'OpenAI / ChatGPT',
    groupName: '🤖 AI 服务',
    description: 'ChatGPT, Gemini, Claude 等 AI 服务',
    ruleProvider: {
      name: 'ai-chat',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/category-ai-chat-!cn.mrs`,
        path: './ruleset/category-ai-chat-!cn.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,ai-chat,🤖 AI 服务'
    ]
  },
  {
    id: 'telegram',
    label: 'Telegram',
    groupName: '📱 Telegram',
    description: 'Telegram 消息与通话',
    ruleProvider: {
      name: 'telegram',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'ipcidr',
        url: `${META_RULES_BASE}/geo/geoip/telegram.mrs`,
        path: './ruleset/telegram.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,telegram,📱 Telegram'
    ]
  },
  {
    id: 'google',
    label: 'Google',
    groupName: '🇬 谷歌服务',
    description: 'Google 搜索, Drive, Gmail 等',
    ruleProvider: {
      name: 'google',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/google.mrs`,
        path: './ruleset/google.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,google,🇬 谷歌服务'
    ]
  },
  {
    id: 'youtube',
    label: 'YouTube',
    groupName: '📹 YouTube',
    description: 'YouTube 视频流媒体',
    ruleProvider: {
      name: 'youtube',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/youtube.mrs`,
        path: './ruleset/youtube.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,youtube,📹 YouTube'
    ]
  },
  {
    id: 'netflix',
    label: 'Netflix',
    groupName: '🎥 Netflix',
    description: 'Netflix 流媒体服务',
    ruleProvider: {
      name: 'netflix',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/netflix.mrs`,
        path: './ruleset/netflix.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,netflix,🎥 Netflix'
    ]
  },
  {
    id: 'apple',
    label: 'Apple',
    groupName: '🍎 苹果服务',
    description: 'Apple OTA, App Store, iCloud',
    ruleProvider: {
      name: 'apple',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/apple.mrs`,
        path: './ruleset/apple.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,apple,🍎 苹果服务'
    ]
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    groupName: 'Ⓜ️ 微软服务',
    description: 'Microsoft, Office 365, Windows Update',
    ruleProvider: {
      name: 'microsoft',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/microsoft.mrs`,
        path: './ruleset/microsoft.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,microsoft,Ⓜ️ 微软服务'
    ]
  },
  {
    id: 'disney',
    label: 'Disney+',
    groupName: '🏰 Disney+',
    description: 'Disney+ 流媒体服务',
    ruleProvider: {
      name: 'disney',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/disney.mrs`,
        path: './ruleset/disney.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,disney,🏰 Disney+'
    ]
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    groupName: '🐦 Twitter',
    description: 'Twitter / X 社交媒体',
    ruleProvider: {
      name: 'twitter',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/twitter.mrs`,
        path: './ruleset/twitter.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,twitter,🐦 Twitter'
    ]
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    groupName: '🎵 TikTok',
    description: 'TikTok 国际版',
    ruleProvider: {
      name: 'tiktok',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/tiktok.mrs`,
        path: './ruleset/tiktok.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,tiktok,🎵 TikTok'
    ]
  },
  {
    id: 'spotify',
    label: 'Spotify',
    groupName: '🎧 Spotify',
    description: 'Spotify 音乐流媒体',
    ruleProvider: {
      name: 'spotify',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/spotify.mrs`,
        path: './ruleset/spotify.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,spotify,🎧 Spotify'
    ]
  },
  {
    id: 'steam',
    label: 'Steam',
    groupName: '🎮 Steam',
    description: 'Steam 游戏平台',
    ruleProvider: {
      name: 'steam',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/steam.mrs`,
        path: './ruleset/steam.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,steam,🎮 Steam'
    ]
  },
  {
    id: 'github',
    label: 'GitHub',
    groupName: '🐱 GitHub',
    description: 'GitHub 代码托管',
    ruleProvider: {
      name: 'github',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/github.mrs`,
        path: './ruleset/github.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,github,🐱 GitHub'
    ]
  },
  {
    id: 'bilibili',
    label: 'Bilibili',
    groupName: '📺 Bilibili',
    description: 'Bilibili 哔哩哔哩',
    ruleProvider: {
      name: 'bilibili',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/bilibili.mrs`,
        path: './ruleset/bilibili.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,bilibili,📺 Bilibili'
    ]
  },
  {
    id: 'facebook',
    label: 'Facebook',
    groupName: '📘 Facebook',
    description: 'Facebook & Messenger',
    ruleProvider: {
      name: 'facebook',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/facebook.mrs`,
        path: './ruleset/facebook.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,facebook,📘 Facebook'
    ]
  },
  {
    id: 'amazon',
    label: 'Amazon / Prime',
    groupName: '📦 Amazon',
    description: 'Amazon Prime Video',
    ruleProvider: {
      name: 'amazon',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/amazon.mrs`,
        path: './ruleset/amazon.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,amazon,📦 Amazon'
    ]
  },
  {
    id: 'bahamut',
    label: 'Bahamut',
    groupName: '⚔️ 巴哈姆特',
    description: '巴哈姆特动画疯',
    ruleProvider: {
      name: 'bahamut',
      def: {
        type: 'http',
        format: 'mrs',
        behavior: 'domain',
        url: `${META_RULES_BASE}/geo/geosite/bahamut.mrs`,
        path: './ruleset/bahamut.mrs',
        interval: 86400,
      }
    },
    rules: [
      'RULE-SET,bahamut,⚔️ 巴哈姆特'
    ]
  }
];

export function getBusinessGroups(selectedIds?: string[]): BusinessGroupDef[] {
  if (!selectedIds || selectedIds.length === 0) return [];
  return BUSINESS_GROUPS.filter(g => selectedIds.includes(g.id));
}
