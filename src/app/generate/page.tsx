'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { StoryParameters } from '@/types/database';

const STORY_STYLES = [
  { value: 'fantasy', label: '奇幻', description: '魔法、龙、骑士的世界' },
  { value: 'sci-fi', label: '科幻', description: '未来、太空、科技' },
  { value: 'romance', label: '浪漫', description: '爱情、温馨、感人' },
  { value: 'mystery', label: '悬疑', description: '谜题、推理、神秘' },
  { value: 'adventure', label: '冒险', description: '探险、刺激、挑战' },
];

const STORY_LENGTHS = [
  { value: 'short', label: '简短', description: '1-2句话的开头' },
  { value: 'medium', label: '中等', description: '一个段落的开头' },
  { value: 'long', label: '详细', description: '详细的背景描述' },
];

export default function GeneratePage() {
  const [parameters, setParameters] = useState<StoryParameters>({
    time: '',
    location: '',
    characters: [''],
    action: '',
    mood: '',
    genre: 'fantasy'
  });
  const [style, setStyle] = useState('fantasy');
  const [length, setLength] = useState('medium');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState('Template Generator');

  // 检查AI状态
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        const response = await fetch('/api/ai-status');
        if (response.ok) {
          const data = await response.json();
          setAiEnabled(data.ai_enabled);
          setAiProvider(data.provider);
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
      }
    };

    checkAiStatus();
  }, []);

  const handleParameterChange = (key: keyof StoryParameters, value: string | string[]) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCharacterChange = (index: number, value: string) => {
    const newCharacters = [...(parameters.characters || [''])];
    newCharacters[index] = value;
    setParameters(prev => ({
      ...prev,
      characters: newCharacters
    }));
  };

  const addCharacter = () => {
    setParameters(prev => ({
      ...prev,
      characters: [...(prev.characters || ['']), '']
    }));
  };

  const removeCharacter = (index: number) => {
    const newCharacters = (parameters.characters || ['']).filter((_, i) => i !== index);
    setParameters(prev => ({
      ...prev,
      characters: newCharacters.length > 0 ? newCharacters : ['']
    }));
  };

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: {
            ...parameters,
            genre: style
          },
          style,
          length
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedStory(data.story);
      } else {
        console.error('Failed to generate story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomParameters = async () => {
    try {
      const response = await fetch(`/api/generate-parameters?style=${style}`);
      if (response.ok) {
        const data = await response.json();
        setParameters(data.parameters);
      }
    } catch (error) {
      console.error('Error generating parameters:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">故事生成器</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Parameters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">设置故事参数</h2>
              <div className="flex items-center space-x-2">
                {aiEnabled ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">AI生成</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">模板生成</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI状态说明 */}
            <div className={`mb-6 p-3 rounded-lg ${
              aiEnabled
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            }`}>
              <p className={`text-sm ${
                aiEnabled
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {aiEnabled
                  ? `🤖 当前使用 ${aiProvider} 进行智能故事生成，将根据您的参数创作独特的故事开头。`
                  : '📝 当前使用模板生成器，将基于预设模板创建故事开头。如需AI生成，请配置DeepSeek API。'
                }
              </p>
            </div>
            
            {/* Story Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                故事类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STORY_STYLES.map((styleOption) => (
                  <button
                    key={styleOption.value}
                    onClick={() => setStyle(styleOption.value)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      style === styleOption.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{styleOption.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{styleOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Story Length */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                故事长度
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STORY_LENGTHS.map((lengthOption) => (
                  <button
                    key={lengthOption.value}
                    onClick={() => setLength(lengthOption.value)}
                    className={`p-2 text-center rounded-lg border transition-colors ${
                      length === lengthOption.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{lengthOption.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{lengthOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  时间设定
                </label>
                <input
                  type="text"
                  value={parameters.time || ''}
                  onChange={(e) => handleParameterChange('time', e.target.value)}
                  placeholder="例如：古代、未来、春天的午后..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  地点设定
                </label>
                <input
                  type="text"
                  value={parameters.location || ''}
                  onChange={(e) => handleParameterChange('location', e.target.value)}
                  placeholder="例如：魔法森林、太空站、咖啡厅..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  主要人物
                </label>
                {(parameters.characters || ['']).map((character, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={character}
                      onChange={(e) => handleCharacterChange(index, e.target.value)}
                      placeholder="例如：勇敢的骑士、神秘法师..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    {(parameters.characters || []).length > 1 && (
                      <button
                        onClick={() => removeCharacter(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCharacter}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + 添加人物
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  主要事件
                </label>
                <input
                  type="text"
                  value={parameters.action || ''}
                  onChange={(e) => handleParameterChange('action', e.target.value)}
                  placeholder="例如：寻找宝藏、拯救公主、探索未知..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  情绪氛围
                </label>
                <input
                  type="text"
                  value={parameters.mood || ''}
                  onChange={(e) => handleParameterChange('mood', e.target.value)}
                  placeholder="例如：神秘、紧张、温馨、刺激..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={generateRandomParameters}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                随机参数
              </button>
              <button
                onClick={generateStory}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiEnabled ? (
                  <Zap className="h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? (aiEnabled ? 'AI生成中...' : '生成中...') : (aiEnabled ? 'AI生成故事' : '生成故事')}
              </button>
            </div>
          </div>

          {/* Right Panel - Generated Story */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">生成的故事</h2>
            
            {generatedStory ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {generatedStory}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={generateStory}
                    className="px-4 py-2 text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    重新生成
                  </button>
                  <Link
                    href={`/continue?story=${encodeURIComponent(generatedStory)}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    开始接龙
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  设置参数并点击&ldquo;生成故事&rdquo;来创建你的故事开头
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
