// 简单的API测试脚本
// 运行方式: node test-api.js

const BASE_URL = 'http://localhost:3000/api';

async function testAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`✅ ${options.method || 'GET'} ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ ${options.method || 'GET'} ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 开始API测试...\n');

  // 1. 测试AI状态
  console.log('1. 测试AI状态');
  await testAPI('/ai-status');
  console.log('');

  // 2. 测试故事生成参数
  console.log('2. 测试故事参数生成');
  await testAPI('/generate-parameters?style=fantasy');
  console.log('');

  // 3. 测试故事生成
  console.log('3. 测试故事生成');
  const storyData = await testAPI('/generate-story', {
    method: 'POST',
    body: JSON.stringify({
      parameters: {
        time: '古代',
        location: '魔法森林',
        characters: ['勇敢的骑士'],
        action: '寻找传说中的宝藏',
        mood: '神秘'
      },
      style: 'fantasy',
      length: 'medium'
    })
  });
  console.log('');

  // 4. 测试获取故事列表
  console.log('4. 测试获取故事列表');
  await testAPI('/stories');
  console.log('');

  // 5. 测试用户创建
  console.log('5. 测试用户创建');
  await testAPI('/users', {
    method: 'POST',
    body: JSON.stringify({
      username: 'test_user',
      email: 'test@example.com'
    })
  });
  console.log('');

  console.log('✨ API测试完成！');
}

// 检查是否在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境，需要安装node-fetch
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch;
    runTests();
  } catch (error) {
    console.log('请先安装node-fetch: npm install node-fetch');
    console.log('或者在浏览器控制台中运行此测试');
  }
} else {
  // 浏览器环境
  runTests();
}
