'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: unknown;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'AI状态检查', status: 'pending' },
    { name: '故事参数生成', status: 'pending' },
    { name: '故事生成', status: 'pending' },
    { name: '故事列表获取', status: 'pending' },
    { name: '用户创建', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // 重置所有测试状态
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })));

    try {
      // 测试1: AI状态检查
      updateTest(0, { status: 'pending', message: '检查中...' });
      try {
        const aiResponse = await fetch('/api/ai-status');
        const aiData = await aiResponse.json();
        updateTest(0, { 
          status: 'success', 
          message: `AI状态: ${aiData.ai_enabled ? '已启用' : '未启用'} (${aiData.provider})`,
          data: aiData
        });
      } catch {
        updateTest(0, { status: 'error', message: '检查失败' });
      }

      // 测试2: 故事参数生成
      updateTest(1, { status: 'pending', message: '生成中...' });
      try {
        const paramResponse = await fetch('/api/generate-parameters?style=fantasy');
        const paramData = await paramResponse.json();
        updateTest(1, { 
          status: 'success', 
          message: '参数生成成功',
          data: paramData
        });
      } catch {
        updateTest(1, { status: 'error', message: '生成失败' });
      }

      // 测试3: 故事生成
      updateTest(2, { status: 'pending', message: '生成中...' });
      try {
        const storyResponse = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        const storyData = await storyResponse.json();
        updateTest(2, { 
          status: storyData.success ? 'success' : 'error', 
          message: storyData.success ? '故事生成成功' : storyData.error,
          data: storyData
        });
      } catch {
        updateTest(2, { status: 'error', message: '生成失败' });
      }

      // 测试4: 故事列表获取
      updateTest(3, { status: 'pending', message: '获取中...' });
      try {
        const storiesResponse = await fetch('/api/stories');
        const storiesData = await storiesResponse.json();
        updateTest(3, { 
          status: 'success', 
          message: `获取成功，共${storiesData.count || 0}个故事`,
          data: storiesData
        });
      } catch {
        updateTest(3, { status: 'error', message: '获取失败' });
      }

      // 测试5: 用户创建
      updateTest(4, { status: 'pending', message: '创建中...' });
      try {
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `test_user_${Date.now()}`,
            email: `test_${Date.now()}@example.com`
          })
        });
        const userData = await userResponse.json();
        updateTest(4, { 
          status: userData.success ? 'success' : 'error', 
          message: userData.success ? '用户创建成功' : userData.error,
          data: userData
        });
      } catch {
        updateTest(4, { status: 'error', message: '创建失败' });
      }

    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            系统功能测试
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                API功能测试
              </h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '测试中...' : '开始测试'}
              </button>
            </div>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {test.name}
                      </h3>
                      {test.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {test.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {test.data ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                        查看数据
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-w-md">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              使用说明
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>• 此页面用于测试系统的核心API功能</p>
              <p>• 绿色勾号表示测试通过，红色叉号表示测试失败</p>
              <p>• 如果AI状态显示&ldquo;未启用&rdquo;，请配置DeepSeek API Key</p>
              <p>• 点击&ldquo;查看数据&rdquo;可以查看API返回的详细信息</p>
              <p>• 建议在开发过程中定期运行测试以确保功能正常</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
