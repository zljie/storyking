'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Send } from 'lucide-react';
import { Story, StorySegment, StoryParameters } from '@/types/database';

export default function ContinuePage() {
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
  const [showParameterForm, setShowParameterForm] = useState(false);

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
  };

  const handleCharacterChange = (index: number, value: string) => {
    const newCharacters = [...(newParameters.characters || [''])];
    newCharacters[index] = value;
    setNewParameters(prev => ({
      ...prev,
      characters: newCharacters
    }));
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

  const submitContinuation = async () => {
    if (!selectedStory || !newSegment.trim()) return;

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
        setShowParameterForm(false);
      } else {
        console.error('Failed to submit continuation');
      }
    } catch (error) {
      console.error('Error submitting continuation:', error);
    } finally {
      setIsSubmitting(false);
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
                  onClick={() => {
                    // 创建临时故事对象用于接龙
                    const tempStory: Story = {
                      id: 'temp-' + Date.now(),
                      title: '新故事',
                      initial_prompt: initialStory,
                      status: 'active',
                      created_by: 'temp-user',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      current_participants: 1
                    };
                    handleStorySelect(tempStory);
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    你的续写内容
                  </label>
                  <textarea
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    placeholder="在这里写下你的故事续写..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <button
                    onClick={() => setShowParameterForm(!showParameterForm)}
                    className="text-sm text-purple-600 hover:text-purple-700 mb-3"
                  >
                    {showParameterForm ? '隐藏' : '添加'} 故事参数
                  </button>

                  {showParameterForm && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          新的时间设定
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
                          新的地点设定
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
                          新增人物
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
                          新的事件
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
                          情绪氛围
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
                  disabled={!newSegment.trim() || isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? '提交中...' : '提交续写'}
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
