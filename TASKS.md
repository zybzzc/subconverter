# Subconverter Web - 开发任务计划

## 项目概述

构建一个 WebApp，用于合并多个代理订阅、手动输入节点，并生成可直接订阅的 Clash Meta 订阅地址。

- **技术栈**: Next.js 15 + React 19 + Bun + TypeScript + Tailwind v3
- **UI 风格**: Modern SaaS (Shadcn/Zinc) + Lucide Icons
- **部署目标**: Vercel / Cloudflare Pages

---

## ✅ Milestone 1: MVP - 订阅合并与输出 (已完成)

### 项目初始化
- [x] 清理现有代码，重新搭建项目结构
- [x] 配置 Shadcn/Zinc 主题变量
- [x] 安装必要依赖 (js-yaml, lucide-react)

### 核心库 (`lib/`)
- [x] 类型定义 (`types.ts`)
- [x] 协议解析器 (`parsers/`)
  - [x] Base64 自动检测与解码
  - [x] Shadowsocks (SS)
  - [x] VMess  
  - [x] VLESS (含 Reality)
  - [x] Trojan
  - [x] Hysteria2
  - [x] TUIC
  - [x] Clash YAML 配置解析
- [x] 节点处理器 (`clash/processor.ts`) - 适配器模式
- [x] Clash 配置生成器 (`clash/generator.ts`)
- [x] 业务分组定义 (`clash/business-groups.ts`)
- [x] 配置存储 (`storage.ts`)

### API 路由 (`app/api/`)
- [x] `/api/fetch` - 拉取订阅并解析节点
- [x] `/api/generate` - 合并节点生成订阅
- [x] `/api/subscribe/[id]` - 输出 Clash Meta YAML

### 前端 UI (`app/`)
- [x] 现代化 CSS 变量配置 (`globals.css`)
- [x] 主页面布局 (`page.tsx`) - Card 风格
- [x] 订阅链接输入组件 (支持多个 + 前缀)
- [x] 手动节点输入组件 (剪贴板检测)
- [x] 生成选项面板 (多选业务组 + 高级家宽设置)
- [x] 结果展示组件 (详细统计)
- [x] 日志面板组件 (DevTools 风格)

### 测试验证
- [x] 测试订阅拉取 (Clash YAML 格式)
- [x] 测试节点解析 (126 节点, 0 错误)
- [x] 测试订阅 URL 可用

---

## ✅ Milestone 2: 分组与规则集 (已完成)

### 节点分组
- [x] 家宽节点识别 (Regex + 关键词)
- [x] 用户自定义家宽关键词功能
- [x] 按国家自动分组优化
- [x] 节点处理器扩展性设计 (NodeProcessor)

### 规则集
- [x] 远程规则集支持 (MetaCubeX 数据源)
- [x] 动态业务分组 (Checkbox 多选)
- [x] 支持 20+ 常用服务 (OpenAI, Disney, Steam 等)

### 可配置开关
- [x] 是否按国家分组
- [x] 是否启用家宽识别
- [x] 业务分组选择

---

## ✅ Milestone 2.5: 规则优化与兼容性 (已完成)

### Mihomo 兼容性修复
- [x] 移除 `GEOSITE,private` 规则（标准 GeoSite.dat 不支持）
- [x] 保留 `GEOIP,private` 处理私有网络路由
- [x] 修复规则索引逻辑

### 业务分组增强
- [x] 所有业务分组添加"🏠 家宽节点"选项
- [x] AI 分组优先显示美国节点

### 补充规则系统
- [x] 创建 `supplementary-rules.json` 配置文件
- [x] 实现 `supplementary-rules-loader.ts` 加载模块
- [x] 集成到 `generator.ts` 生成逻辑
- [x] 规则优先级：补充规则 > 远程规则集

### 代码清理
- [x] 修复 parser 文件类型导入问题
- [x] 清理 `types.ts` 无效导入

---

## 🤖 Milestone 3: AI 增强 (待开发)

### AI 集成
- [ ] 集成 Vercel AI SDK
- [ ] 支持自定义 provider/API Key
- [ ] API Key 透传 (不存储)

### AI 功能
- [ ] 节点命名统一化 (UI 占位已完成)
- [ ] 智能分组
- [ ] 配置后处理 (覆写)
- [ ] 自定义 Prompt 输入

### Prompt 优化
- [ ] Clash 配置知识库
- [ ] 输出格式校验
- [ ] 错误处理与回退

---

## 🚀 Milestone 4: 配置分享与部署 (部分完成)

### 配置分享
- [ ] 配置序列化为 URL 参数
- [ ] 短链接生成
- [ ] 配置模板管理

### 部署 (✅ 已完成)
- [x] Cloudflare Pages + Workers + KV 部署支持
- [x] 存储层抽象（Memory / KV 适配器）
- [x] API Routes Edge Runtime 适配
- [x] wrangler.toml 配置

### 文档 (✅ 已完成)
- [x] README 部署指南
- [ ] 使用文档
- [ ] API 文档

---

## 当前状态

**最后更新**: 2026-01-14 00:10

- **Milestone 1**: ✅ 已完成 (UI 重构)
- **Milestone 2**: ✅ 已完成 (业务分组增强)
- **Milestone 2.5**: ✅ 已完成 (规则优化与兼容性)
- **Milestone 3**: ⏳ 待开发
- **Milestone 4**: 🔶 部分完成 (Cloudflare 部署)

### 已验证功能
- 全新 Modern SaaS UI 风格
- 动态业务分组 (支持 GitHub, Netflix, Steam 等 20+ 服务)
- 正则 + 自定义关键词双重家宽识别
- 完整的订阅生成流程 (含统计与日志)
- Mihomo v1.19.x 兼容性验证通过
- 补充规则系统 (快速添加新域名规则)
- Cloudflare Pages + Workers + KV 部署支持

