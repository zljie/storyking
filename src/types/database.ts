// 数据库类型定义

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  initial_prompt: string;
  status: 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  max_participants?: number;
  current_participants: number;
}

export interface StorySegment {
  id: string;
  story_id: string;
  author_id: string;
  content: string;
  order_index: number;
  story_parameters: StoryParameters;
  created_at: string;
  updated_at: string;
}

export interface StoryParameters {
  time?: string;        // 时间设定
  location?: string;    // 地点设定
  characters?: string[]; // 人物设定
  action?: string;      // 事件/动作
  mood?: string;        // 情绪/氛围
  genre?: string;       // 故事类型
}

export interface StoryParticipant {
  id: string;
  story_id: string;
  user_id: string;
  joined_at: string;
  contribution_count: number;
}

// 故事生成请求类型
export interface StoryGenerationRequest {
  prompt?: string;
  parameters: StoryParameters;
  style?: 'fantasy' | 'sci-fi' | 'romance' | 'mystery' | 'adventure' | 'horror';
  length?: 'short' | 'medium' | 'long';
}

// 故事接龙请求类型
export interface StoryContinuationRequest {
  story_id: string;
  content: string;
  parameters: StoryParameters;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 故事统计信息
export interface StoryStats {
  total_stories: number;
  active_stories: number;
  completed_stories: number;
  total_participants: number;
  user_contributions: number;
}
