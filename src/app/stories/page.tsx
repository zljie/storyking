'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, BookOpen, Filter, Search } from 'lucide-react';
import { Story, StorySegment } from '@/types/database';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const filterStories = useCallback(() => {
    let filtered = stories;

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter);
    }

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.initial_prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  }, [stories, statusFilter, searchTerm]);

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [filterStories]);

  useEffect(() => {
    if (selectedStory) {
      loadStorySegments(selectedStory.id);
    }
  }, [selectedStory]);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
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



  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    const labels = {
      active: '进行中',
      completed: '已完成',
      archived: '已存档'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">故事展示</h1>
          </div>
          <Link
            href="/generate"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            创建新故事
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Story List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">故事列表</h2>
                <Filter className="h-5 w-5 text-gray-400" />
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索故事..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed' | 'archived')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">所有状态</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="archived">已存档</option>
                </select>
              </div>

              {/* Story List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">加载中...</p>
                  </div>
                ) : filteredStories.length > 0 ? (
                  filteredStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedStory?.id === story.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {story.title}
                        </h3>
                        {getStatusBadge(story.status)}
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {story.initial_prompt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {story.current_participants} 参与者
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(story.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== 'all' ? '没有找到匹配的故事' : '暂无故事'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Story Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {selectedStory ? (
                <div>
                  {/* Story Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedStory.title}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {selectedStory.current_participants} 参与者
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            创建于 {formatDate(selectedStory.created_at)}
                          </div>
                          {getStatusBadge(selectedStory.status)}
                        </div>
                      </div>
                      
                      {selectedStory.status === 'active' && (
                        <Link
                          href={`/continue?storyId=${selectedStory.id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          参与接龙
                        </Link>
                      )}
                    </div>

                    {selectedStory.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {selectedStory.description}
                      </p>
                    )}
                  </div>

                  {/* Story Content */}
                  <div className="space-y-6">
                    {/* Initial Prompt */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          开
                        </div>
                        <span className="ml-3 font-medium text-gray-900 dark:text-white">故事开头</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                        {selectedStory.initial_prompt}
                      </p>
                    </div>

                    {/* Story Segments */}
                    {segments.map((segment, index) => (
                      <div key={segment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="ml-3 font-medium text-gray-900 dark:text-white">
                              第 {index + 1} 段
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(segment.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11 mb-3">
                          {segment.content}
                        </p>

                        {/* Story Parameters */}
                        {segment.story_parameters && (
                          <div className="ml-11 flex flex-wrap gap-2">
                            {segment.story_parameters.time && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded">
                                时间: {segment.story_parameters.time}
                              </span>
                            )}
                            {segment.story_parameters.location && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded">
                                地点: {segment.story_parameters.location}
                              </span>
                            )}
                            {segment.story_parameters.characters && segment.story_parameters.characters.length > 0 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded">
                                人物: {segment.story_parameters.characters.join(', ')}
                              </span>
                            )}
                            {segment.story_parameters.action && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs rounded">
                                事件: {segment.story_parameters.action}
                              </span>
                            )}
                            {segment.story_parameters.mood && (
                              <span className="px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400 text-xs rounded">
                                氛围: {segment.story_parameters.mood}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {segments.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          这个故事还没有续写内容
                        </p>
                        {selectedStory.status === 'active' && (
                          <Link
                            href={`/continue?storyId=${selectedStory.id}`}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            成为第一个续写者
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    选择一个故事
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    从左侧列表中选择一个故事来查看完整内容
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
