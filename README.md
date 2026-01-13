# Subconverter Web

一个现代化的代理订阅转换工具，支持合并多个订阅、手动输入节点，生成 Clash Meta 配置。

## ✨ 功能特性

- 📦 **订阅合并**: 支持多个订阅链接，可为每个订阅添加机场缩写前缀
- ✍️ **手动节点**: 支持 SS/VMess/VLESS/Trojan/Hysteria2/TUIC 等协议
- 🏠 **家宽识别**: 正则匹配 + 自定义关键词识别家宽节点
- 🌍 **国家分组**: 自动识别节点国家，建立分层策略组
- 📋 **业务分组**: 支持 OpenAI、Netflix、Steam 等 20+ 服务规则集
- 🔧 **节点编辑**: 生成前可重命名、排除、标记家宽节点
- 📝 **补充规则**: 快速添加临时规则，无需等待远程规则集更新

## 🚀 部署指南

### Cloudflare Pages（推荐）

本项目专为 Cloudflare Pages + Workers + KV 优化。

#### 1. 准备工作

- 注册 [Cloudflare](https://dash.cloudflare.com/) 账户
- 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
npm install -g wrangler
wrangler login
```

#### 2. 创建 KV Namespace

```bash
# 创建 KV 命名空间
wrangler kv:namespace create "SUBCONVERTER_KV"
```

记录返回的 `id`，更新 `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SUBCONVERTER_KV"
id = "你的_KV_NAMESPACE_ID"
```

#### 3. 部署

**方式一：通过 GitHub 自动部署**

1. Fork 本仓库
2. 在 Cloudflare Pages 创建项目，连接 GitHub
3. 设置构建命令: `bun run build:cf`
4. 设置输出目录: `.vercel/output/static`
5. 添加 KV 绑定: `SUBCONVERTER_KV`

**方式二：手动部署**

```bash
# 安装依赖
bun install

# 构建
bun run build:cf

# 部署
bun run deploy
```

### 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun dev

# 访问 http://localhost:3000
```

本地开发使用内存存储，无需配置 KV。

## 📁 项目结构

```
subconverter/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Edge Runtime)
│   │   ├── fetch/         # 拉取订阅
│   │   ├── generate/      # 生成配置
│   │   ├── preview/       # 预览节点
│   │   └── subscribe/     # 订阅输出
│   ├── components/        # React 组件
│   └── page.tsx           # 主页面
├── lib/                    # 核心库
│   ├── clash/             # Clash 配置生成
│   ├── parsers/           # 协议解析器
│   └── storage/           # 存储抽象层
├── wrangler.toml          # Cloudflare 配置
└── package.json
```

## 🔧 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `SUBCONVERTER_KV` | Cloudflare KV 绑定 | 生产环境必需 |

## 📜 License

MIT
