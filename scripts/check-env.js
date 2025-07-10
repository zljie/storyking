#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 用于验证部署前的环境配置
 */

// 加载环境变量
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // 只设置未设置的环境变量
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  } catch (error) {
    // 文件不存在或读取失败，忽略
  }
}

// 尝试加载环境变量文件（在 Vercel 环境中跳过本地文件）
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  const envFiles = ['.env.local', '.env.development', '.env'];
  envFiles.forEach(file => {
    loadEnvFile(path.join(process.cwd(), file));
  });
}

const requiredEnvVars = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_API_URL'
];

// NODE_ENV 在 Vercel 中会自动设置
const optionalEnvVars = [
  'NODE_ENV',
  'VERCEL',
  'VERCEL_ENV',
  'VERCEL_URL'
];

// 这些变量已经在上面定义了

function checkEnvironment() {
  console.log('🔍 检查环境变量配置...\n');

  let hasErrors = false;
  const isVercel = process.env.VERCEL === '1';

  // 检查必需的环境变量
  console.log('📋 必需的环境变量:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName === 'DEEPSEEK_API_KEY' ? '***已设置***' : value}`);
    } else {
      console.log(`❌ ${varName}: 未设置`);
      // 在 Vercel 环境中，如果缺少环境变量，给出警告但不阻止构建
      if (!isVercel) {
        hasErrors = true;
      }
    }
  });

  console.log('\n📋 可选的环境变量:');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`⚪ ${varName}: 未设置`);
    }
  });

  // 检查 API Key 格式
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey) {
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      console.log('\n✅ DeepSeek API Key 格式看起来正确');
    } else {
      console.log('\n⚠️  DeepSeek API Key 格式可能不正确');
      console.log('   正确格式应该以 "sk-" 开头且长度足够');
    }
  }

  // 环境检查
  console.log('\n🌍 环境信息:');
  console.log(`📦 Node.js: ${process.version}`);
  console.log(`🏠 平台: ${process.platform}`);
  console.log(`📁 工作目录: ${process.cwd()}`);

  if (process.env.VERCEL) {
    console.log('☁️  运行在 Vercel 环境');
    console.log(`🌐 Vercel 环境: ${process.env.VERCEL_ENV || 'unknown'}`);
    console.log(`🔗 Vercel URL: ${process.env.VERCEL_URL || 'unknown'}`);
  } else {
    console.log('💻 运行在本地环境');
  }

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    if (isVercel) {
      console.log('⚠️  在 Vercel 环境中检测到缺少环境变量');
      console.log('\n💡 解决方案:');
      console.log('1. 在 Vercel 项目设置中添加以下环境变量:');
      console.log('   - DEEPSEEK_API_KEY: 你的 DeepSeek API Key');
      console.log('   - DEEPSEEK_API_URL: https://api.deepseek.com/v1/chat/completions');
      console.log('2. 重新部署项目');
      console.log('\n⚠️  注意: 缺少环境变量可能导致 AI 功能无法正常工作');
    } else {
      console.log('❌ 环境配置检查失败！');
      console.log('\n💡 解决方案:');
      console.log('1. 本地开发: 确保 .env.local 文件存在并包含所需变量');
      console.log('2. Vercel 部署: 在项目设置中添加环境变量');
      console.log('3. 参考 .env.example 文件了解所需变量');
      process.exit(1);
    }
  } else {
    console.log('✅ 环境配置检查通过！');
    console.log('\n🚀 可以安全部署或运行应用');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };
