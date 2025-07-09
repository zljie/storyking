# 🚀 Vercel 部署检查清单

在部署到 Vercel 之前，请确保完成以下检查项：

## ✅ 代码准备

- [ ] 所有功能已完成并测试
- [ ] 代码已提交到 Git 仓库
- [ ] `.env.local` 文件**未**被提交到 Git
- [ ] `.gitignore` 包含敏感文件
- [ ] 运行 `npm run lint` 无错误
- [ ] 运行 `npm run type-check` 无错误
- [ ] 运行 `npm run build` 成功

## ✅ 环境变量

- [ ] 运行 `npm run check-env` 通过
- [ ] DeepSeek API Key 已获取
- [ ] 环境变量格式正确

### 必需的环境变量：
```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
NODE_ENV=production
```

## ✅ Vercel 配置

- [ ] `vercel.json` 配置文件已创建
- [ ] 项目根目录设置正确
- [ ] 构建命令配置正确
- [ ] API 函数超时设置合理

## ✅ 功能测试

在部署前，请在本地测试以下功能：

- [ ] 主页加载正常
- [ ] 故事生成功能工作
- [ ] 故事接龙功能工作
- [ ] 故事展示功能工作
- [ ] 用户登录/注册功能工作
- [ ] API 端点响应正常

### 测试命令：
```bash
# 启动开发服务器
npm run dev

# 访问测试页面
http://localhost:3000/test

# 运行 API 测试
npm run test:api
```

## ✅ 部署步骤

### 1. GitHub 准备
- [ ] 代码推送到 GitHub
- [ ] 仓库设置为公开（或 Vercel 有访问权限）

### 2. Vercel 设置
- [ ] 连接 GitHub 仓库
- [ ] 选择正确的项目目录
- [ ] 配置环境变量
- [ ] 设置构建和输出目录

### 3. 环境变量配置
在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|----|----- |
| `DEEPSEEK_API_KEY` | 你的 API Key | Production, Preview, Development |
| `DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### 4. 部署验证
- [ ] 构建成功完成
- [ ] 部署 URL 可访问
- [ ] 所有页面正常加载
- [ ] API 功能正常工作
- [ ] AI 生成功能正常

## ✅ 部署后检查

### 功能验证：
- [ ] 访问主页：`https://your-app.vercel.app/`
- [ ] 测试故事生成：`https://your-app.vercel.app/generate`
- [ ] 测试故事接龙：`https://your-app.vercel.app/continue`
- [ ] 测试故事展示：`https://your-app.vercel.app/stories`
- [ ] 运行功能测试：`https://your-app.vercel.app/test`

### 性能检查：
- [ ] 页面加载速度正常
- [ ] API 响应时间合理
- [ ] 无控制台错误
- [ ] 移动端显示正常

## 🔧 常见问题解决

### 构建失败
```bash
# 本地测试构建
npm run build

# 检查类型错误
npm run type-check

# 检查代码规范
npm run lint
```

### API 调用失败
- 检查环境变量是否正确设置
- 验证 DeepSeek API Key 是否有效
- 查看 Vercel Functions 日志

### 页面显示错误
- 检查浏览器控制台错误
- 查看 Vercel 部署日志
- 确认所有依赖都已安装

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 文档**: https://nextjs.org/docs
- **DeepSeek API 文档**: https://platform.deepseek.com/docs

## 🎉 部署成功！

恭喜！你的故事王应用已成功部署到 Vercel。

记住：
- 定期检查 API 使用量
- 监控应用性能
- 及时更新依赖包
- 备份重要数据
