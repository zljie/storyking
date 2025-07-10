# Vercel 部署指南

## 环境变量配置

在 Vercel 上部署此项目时，需要在项目设置中配置以下环境变量：

### 必需的环境变量

1. **DEEPSEEK_API_KEY**
   - 描述：DeepSeek API 密钥
   - 获取方式：访问 https://platform.deepseek.com/ 注册账号并获取 API Key
   - 格式：以 `sk-` 开头的字符串

2. **DEEPSEEK_API_URL**
   - 描述：DeepSeek API 端点
   - 值：`https://api.deepseek.com/v1/chat/completions`

### 配置步骤

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在项目设置中找到 "Environment Variables" 部分
   - 添加以下变量：
     ```
     DEEPSEEK_API_KEY = your_actual_api_key_here
     DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
     ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成

### 验证部署

部署完成后，访问你的 Vercel URL，应该能看到：
- 主页正常显示
- AI 故事生成功能正常工作
- 没有环境变量相关的错误

### 故障排除

如果遇到 "环境配置检查失败" 错误：

1. **检查环境变量**
   - 确保在 Vercel 项目设置中正确添加了所有必需的环境变量
   - 确保 API Key 格式正确（以 `sk-` 开头）

2. **重新部署**
   - 在 Vercel 仪表板中点击 "Redeploy"
   - 或者推送新的代码到 GitHub 触发自动部署

3. **查看日志**
   - 在 Vercel 仪表板中查看构建日志
   - 确认环境变量是否正确加载

### 本地开发

本地开发时，创建 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
NODE_ENV=development
```

### 注意事项

- 不要在代码中硬编码 API Key
- 确保 API Key 有足够的配额
- 定期检查 API 使用情况
- 考虑设置 API Key 的访问限制

## 功能说明

部署成功后，你的应用将支持：

- ✅ 智能故事生成
- ✅ 故事接龙功能
- ✅ 故事存档管理
- ✅ 用户认证系统
- ✅ 响应式设计

## 技术支持

如果遇到问题，请检查：
1. 环境变量配置
2. API Key 有效性
3. 网络连接
4. Vercel 服务状态 