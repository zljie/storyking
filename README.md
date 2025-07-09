# 故事王 - 协作故事创作平台

一个基于 Next.js 的协作故事创作平台，支持 AI 智能生成故事开头和多人接龙创作。

## 功能特色

- 🤖 **AI 智能生成**：集成 DeepSeek V3 模型，根据用户参数智能生成故事开头
- 📝 **故事接龙**：多人协作，共同创作精彩故事
- 🎨 **多种类型**：支持奇幻、科幻、浪漫、悬疑、冒险等多种故事类型
- 📚 **故事展示**：完整展示故事进展和所有参与者的贡献
- 💾 **故事存档**：保存完成的故事供用户回顾
- 🌙 **深色模式**：支持明暗主题切换

## 技术栈

- **前端框架**：Next.js 15 + React 19
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **AI 服务**：DeepSeek V3 API
- **数据存储**：本地 JSON 文件（可扩展至数据库）
- **语言**：TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置 DeepSeek API：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

**获取 DeepSeek API Key：**
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册账号并登录
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 填入 `.env.local` 文件

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/storyking)

### 手动部署

1. **推送代码到 GitHub**
2. **连接 Vercel**：访问 [vercel.com](https://vercel.com) 并连接你的 GitHub 仓库
3. **配置环境变量**：在 Vercel 项目设置中添加：
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key
   - `DEEPSEEK_API_URL`: `https://api.deepseek.com/v1/chat/completions`
   - `NODE_ENV`: `production`
4. **部署**：Vercel 会自动构建和部署

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 使用说明

### 故事生成器

1. 访问首页，点击"开始创作"或直接访问 `/generate`
2. 选择故事类型（奇幻、科幻、浪漫等）
3. 设置故事参数：
   - 时间设定
   - 地点设定
   - 主要人物
   - 主要事件
   - 情绪氛围
4. 选择故事长度（简短、中等、详细）
5. 点击"AI生成故事"或"生成故事"

### 故事接龙

1. 从生成的故事开始接龙，或访问 `/continue` 选择现有故事
2. 阅读当前故事内容
3. 编写您的续写段落
4. 可选：添加新的故事参数（时间、地点、人物等变化）
5. 提交续写

### 故事展示

1. 访问 `/stories` 查看所有故事
2. 使用搜索和过滤功能找到感兴趣的故事
3. 点击故事查看完整内容和所有参与者的贡献
4. 对于活跃状态的故事，可以直接参与接龙

## AI 功能说明

### DeepSeek V3 集成

- **智能生成**：根据用户设定的参数，AI 会创作符合要求的故事开头
- **多样化风格**：支持不同类型故事的专业化创作指导
- **自动回退**：当 AI 服务不可用时，自动使用模板生成器
- **参数优化**：针对故事创作优化的提示词和参数设置

### 提示词设计

系统使用专门为故事创作优化的提示词：

- **角色定位**：专业故事创作助手
- **创作要求**：生动有趣、留有发展空间
- **类型适配**：根据不同故事类型提供专门指导
- **长度控制**：严格按照用户要求控制字数
- **中文优化**：针对中文表达习惯优化

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── generate/          # 故事生成页面
│   ├── continue/          # 故事接龙页面
│   ├── stories/           # 故事展示页面
│   └── layout.tsx         # 根布局
├── lib/                   # 工具库
│   ├── database.ts        # 数据库操作
│   ├── storyGenerator.ts  # 故事生成器
│   └── deepseekService.ts # DeepSeek API 集成
└── types/                 # TypeScript 类型定义
    └── database.ts        # 数据库类型
```

## 开发计划

- [x] 项目初始化和基础设置
- [x] 数据库设计和配置
- [x] 基础页面和路由搭建
- [x] 故事生成器功能实现（AI集成）
- [/] 故事接龙功能实现
- [ ] 故事展示功能实现
- [ ] 用户认证系统
- [ ] 故事存档功能
- [ ] UI/UX优化和测试

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
