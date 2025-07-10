'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Send } from 'lucide-react';
import { Story, StorySegment, StoryParameters } from '@/types/database';

function ContinuePageContent() {
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [newSegment, setNewSegment] = useState('');
  const [newParameters, setNewParameters] = useState<StoryParameters>({
    time: '',
    location: '',
    characters: [''],
    action: '',
    mood: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParameterForm, setShowParameterForm] = useState(true); // 默认显示参数表单
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 从URL参数获取初始故事
  const initialStory = searchParams?.get('story');

  useEffect(() => {
    loadActiveStories();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      loadStorySegments(selectedStory.id);
    }
  }, [selectedStory]);

  const loadActiveStories = async () => {
    try {
      const response = await fetch('/api/stories?status=active');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadStorySegments = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/segments`);
      if (response.ok) {
        const data = await response.json();
        setSegments(data.segments || []);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setNewSegment('');
    setNewParameters({
      time: '',
      location: '',
      characters: [''],
      action: '',
      mood: ''
    });
  };

  const handleParameterChange = (key: keyof StoryParameters, value: string | string[]) => {
    setNewParameters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // 实时验证参数
    setTimeout(() => {
      validateParameters();
      if (newSegment.trim()) {
        validateContinuation();
      }
    }, 100);
  };

  const handleCharacterChange = (index: number, value: string) => {
    const newCharacters = [...(newParameters.characters || [''])];
    newCharacters[index] = value;
    setNewParameters(prev => ({
      ...prev,
      characters: newCharacters
    }));
    
    // 实时验证参数
    setTimeout(() => {
      validateParameters();
      if (newSegment.trim()) {
        validateContinuation();
      }
    }, 100);
  };

  const addCharacter = () => {
    setNewParameters(prev => ({
      ...prev,
      characters: [...(prev.characters || ['']), '']
    }));
  };

  const removeCharacter = (index: number) => {
    const newCharacters = (newParameters.characters || ['']).filter((_, i) => i !== index);
    setNewParameters(prev => ({
      ...prev,
      characters: newCharacters.length > 0 ? newCharacters : ['']
    }));
  };

  // 验证故事参数是否填写
  const validateParameters = (): boolean => {
    const errors: string[] = [];
    
    if (!newParameters.time?.trim()) {
      errors.push('请填写时间设定');
    }
    if (!newParameters.location?.trim()) {
      errors.push('请填写地点设定');
    }
    if (!newParameters.action?.trim()) {
      errors.push('请填写事件设定');
    }
    if (!newParameters.mood?.trim()) {
      errors.push('请填写情绪氛围');
    }
    if (!newParameters.characters || newParameters.characters.length === 0 || 
        newParameters.characters.every(char => !char.trim())) {
      errors.push('请至少添加一个人物');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // 验证新续写是否满足上一个用户的参数要求
  const validateContinuation = (): boolean => {
    if (segments.length === 0) return true; // 如果是第一段，不需要验证
    
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment.story_parameters) return true; // 如果上一段没有参数，不需要验证
    
    const errors: string[] = [];
    const lastParams = lastSegment.story_parameters;
    
    // 检查新续写是否提到了上一段设定的时间
    if (lastParams.time && !newSegment.toLowerCase().includes(lastParams.time.toLowerCase())) {
      errors.push(`续写应该体现上一段设定的时间: ${lastParams.time}`);
    }
    
    // 检查新续写是否提到了上一段设定的地点
    if (lastParams.location && !newSegment.toLowerCase().includes(lastParams.location.toLowerCase())) {
      errors.push(`续写应该体现上一段设定的地点: ${lastParams.location}`);
    }
    
    // 检查新续写是否提到了上一段设定的人物
    if (lastParams.characters && lastParams.characters.length > 0) {
      const hasCharacter = lastParams.characters.some(character => 
        character && newSegment.toLowerCase().includes(character.toLowerCase())
      );
      if (!hasCharacter) {
        errors.push(`续写应该包含上一段设定的人物: ${lastParams.characters.join(', ')}`);
      }
    }
    
    // 检查新续写是否体现了上一段设定的情绪氛围
    if (lastParams.mood && !newSegment.toLowerCase().includes(lastParams.mood.toLowerCase())) {
      errors.push(`续写应该体现上一段设定的情绪氛围: ${lastParams.mood}`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const submitContinuation = async () => {
    if (!selectedStory || !newSegment.trim()) return;

    // 验证参数填写
    if (!validateParameters()) {
      return;
    }

    // 验证续写内容
    if (!validateContinuation()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/continue-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story_id: selectedStory.id,
          content: newSegment,
          parameters: newParameters
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 重新加载故事片段
          await loadStorySegments(selectedStory.id);
          setNewSegment('');
          setNewParameters({
            time: '',
            location: '',
            characters: [''],
            action: '',
            mood: ''
          });
          setShowParameterForm(true);
          setValidationErrors([]);
        } else {
          console.error('Failed to submit continuation:', result.error);
          // 显示错误信息给用户
          setValidationErrors([result.error || '提交失败，请重试']);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '提交失败，请重试' }));
        console.error('Failed to submit continuation:', errorData);
        setValidationErrors([errorData.error || '提交失败，请重试']);
      }
    } catch (error) {
      console.error('Error submitting continuation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastStoryParameters = segments.length > 0 ? segments[segments.length - 1].story_parameters : undefined;
  const lastCharacters = lastStoryParameters?.characters;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">故事接龙</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Story List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">活跃故事</h2>
            
            {initialStory && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">新生成的故事</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">{initialStory}</p>
                <button
                  onClick={async () => {
                    try {
                      // 将新故事保存到数据库
                      const response = await fetch('/api/stories', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: '新故事',
                          initial_prompt: initialStory,
                          status: 'active'
                        }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.story) {
                          // 重新加载故事列表
                          await loadActiveStories();
                          // 选择新创建的故事
                          handleStorySelect(result.story);
                        } else {
                          console.error('Failed to create story:', result.error);
                        }
                      } else {
                        console.error('Failed to create story');
                      }
                    } catch (error) {
                      console.error('Error creating story:', error);
                    }
                  }}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  开始接龙
                </button>
              </div>
            )}

            <div className="space-y-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleStorySelect(story)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedStory?.id === story.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {story.initial_prompt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3 mr-1" />
                    {story.current_participants} 参与者
                  </div>
                </div>
              ))}
            </div>

            {stories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  暂无活跃故事
                </p>
                <Link
                  href="/generate"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建新故事
                </Link>
              </div>
            )}
          </div>

          {/* Middle Panel - Story Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">故事内容</h2>
            
            {selectedStory ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedStory.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedStory.initial_prompt}
                  </p>
                </div>

                {segments.map((segment, index) => (
                  <div key={segment.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        第 {index + 1} 段
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        {new Date(segment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {segment.content}
                    </p>
                    {segment.story_parameters && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {segment.story_parameters.time && `时间: ${segment.story_parameters.time} `}
                        {segment.story_parameters.location && `地点: ${segment.story_parameters.location} `}
                        {segment.story_parameters.mood && `氛围: ${segment.story_parameters.mood}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  选择一个故事开始接龙
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Add Continuation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">添加续写</h2>
            
            {selectedStory ? (
              <div className="space-y-4">
                <div>
                  {/* 显示上一段的参数要求 */}
                  {segments.length > 0 && segments[segments.length - 1].story_parameters && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                        上一段设定的参数要求：
                      </h4>
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        {segments[segments.length - 1].story_parameters?.time && (
                          <div>时间: {segments[segments.length - 1].story_parameters?.time}</div>
                        )}
                        {segments[segments.length - 1].story_parameters?.location && (
                          <div>地点: {segments[segments.length - 1].story_parameters?.location}</div>
                        )}
                        {lastCharacters && Array.isArray(lastCharacters) && lastCharacters.length > 0 && (
                          <div>人物: {lastCharacters.join(', ')}</div>
                        )}
                        {segments[segments.length - 1].story_parameters?.mood && (
                          <div>情绪: {segments[segments.length - 1].story_parameters?.mood}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    你的续写内容
                  </label>
                  <textarea
                    value={newSegment}
                    onChange={(e) => {
                      setNewSegment(e.target.value);
                      // 实时验证续写内容
                      setTimeout(() => {
                        if (e.target.value.trim()) {
                          validateContinuation();
                        }
                      }, 100);
                    }}
                    placeholder="在这里写下你的故事续写..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                {/* 验证错误提示 */}
                {validationErrors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                      需要修正的问题：
                    </h4>
                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      故事参数设定 <span className="text-red-500">*</span>
                    </h3>
                    <button
                      onClick={() => setShowParameterForm(!showParameterForm)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      {showParameterForm ? '隐藏' : '显示'} 参数表单
                    </button>
                  </div>

                  {showParameterForm && (
                    <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          新的时间设定 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newParameters.time || ''}
                          onChange={(e) => handleParameterChange('time', e.target.value)}
                          placeholder="时间变化..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          新的地点设定 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newParameters.location || ''}
                          onChange={(e) => handleParameterChange('location', e.target.value)}
                          placeholder="地点变化..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          新增人物 <span className="text-red-500">*</span>
                        </label>
                        {(newParameters.characters || ['']).map((character, index) => (
                          <div key={index} className="flex gap-1 mb-1">
                            <input
                              type="text"
                              value={character}
                              onChange={(e) => handleCharacterChange(index, e.target.value)}
                              placeholder="新人物..."
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                            />
                            {(newParameters.characters || []).length > 1 && (
                              <button
                                onClick={() => removeCharacter(index)}
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                删除
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addCharacter}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          + 添加人物
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          新的事件 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newParameters.action || ''}
                          onChange={(e) => handleParameterChange('action', e.target.value)}
                          placeholder="新事件..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          情绪氛围 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newParameters.mood || ''}
                          onChange={(e) => handleParameterChange('mood', e.target.value)}
                          placeholder="氛围变化..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={submitContinuation}
                  disabled={!newSegment.trim() || isSubmitting || validationErrors.length > 0}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? '提交中...' : validationErrors.length > 0 ? '请修正问题后提交' : '提交续写'}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  选择一个故事开始续写
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContinuePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">故事接龙</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    }>
      <ContinuePageContent />
    </Suspense>
  );
}
