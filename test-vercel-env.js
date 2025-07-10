#!/usr/bin/env node

// 模拟 Vercel 环境测试
const { execSync } = require('child_process');

console.log('🧪 测试 Vercel 环境下的环境变量检查...\n');

try {
  // 清除环境变量并设置 VERCEL=1
  const result = execSync('VERCEL=1 DEEPSEEK_API_KEY="" DEEPSEEK_API_URL="" NODE_ENV="" node scripts/check-env.js', {
    env: {
      ...process.env,
      VERCEL: '1',
      DEEPSEEK_API_KEY: '',
      DEEPSEEK_API_URL: '',
      NODE_ENV: ''
    },
    encoding: 'utf8'
  });
  
  console.log('✅ 测试通过：脚本在 Vercel 环境中正确处理了缺少的环境变量');
  console.log('\n输出结果:');
  console.log(result);
} catch (error) {
  console.log('❌ 测试失败：脚本在 Vercel 环境中没有正确处理缺少的环境变量');
  console.log('\n错误信息:');
  console.log(error.message);
} 