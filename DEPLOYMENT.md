# 部署指南

## Vercel 部署步骤

### 1. 准备工作

确保你的代码已经推送到 GitHub 仓库，并且 `.env.local` 文件没有被提交到 Git。

### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 选择 `storyking-app` 目录作为根目录

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：

```
DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
NODE_ENV=production
```

#### 设置步骤：

1. 在 Vercel 项目页面，点击 "Settings"
2. 点击左侧菜单的 "Environment Variables"
3. 添加上述环境变量
4. 确保选择 "Production", "Preview", 和 "Development" 环境

### 4. 部署配置

项目已包含 `vercel.json` 配置文件，包含以下设置：

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **API Functions**: 最大执行时间 30 秒
- **CORS Headers**: 已配置跨域访问

### 5. 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后，你会获得一个 `.vercel.app` 域名

### 6. 验证部署

部署完成后，访问以下页面确认功能正常：

- **主页**: `https://your-app.vercel.app/`
- **故事生成**: `https://your-app.vercel.app/generate`
- **故事接龙**: `https://your-app.vercel.app/continue`
- **故事展示**: `https://your-app.vercel.app/stories`
- **功能测试**: `https://your-app.vercel.app/test`

## 常见问题

### Q: API 调用失败
**A**: 检查环境变量是否正确设置，特别是 `DEEPSEEK_API_KEY`

### Q: 页面显示错误
**A**: 查看 Vercel 的 Functions 日志，通常在项目页面的 "Functions" 标签下

### Q: 数据不持久化
**A**: Vercel 是无服务器环境，本地 JSON 文件不会持久化。考虑集成数据库服务如：
- Vercel KV (Redis)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)
- MongoDB Atlas

### Q: 构建失败
**A**: 检查以下几点：
- 确保所有依赖都在 `package.json` 中
- 检查 TypeScript 类型错误
- 确保没有使用 Node.js 特定的 API 在客户端代码中

## 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 监控和分析

Vercel 提供内置的：
- **Analytics**: 页面访问统计
- **Speed Insights**: 性能监控
- **Functions**: API 调用监控

## 环境管理

- **Production**: 生产环境，对应 `main` 分支
- **Preview**: 预览环境，对应其他分支的 PR
- **Development**: 开发环境，用于本地开发

## 安全建议

1. **API Key 保护**: 永远不要在客户端代码中暴露 API Key
2. **环境变量**: 使用 Vercel 的环境变量管理，不要提交到 Git
3. **CORS 配置**: 根据需要调整 CORS 设置
4. **Rate Limiting**: 考虑为 API 添加速率限制

## 成本优化

- Vercel 免费计划包含：
  - 100GB 带宽/月
  - 100 次无服务器函数调用/天
  - 6000 分钟构建时间/月

- 超出限制后会产生费用，建议监控使用量
