import { NextRequest, NextResponse } from 'next/server';
import { StoryService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let stories;
    
    if (status === 'active') {
      stories = await StoryService.getActiveStories();
    } else {
      stories = await StoryService.getAllStories();
      
      // 如果指定了状态过滤
      if (status && status !== 'all') {
        stories = stories.filter(story => story.status === status);
      }
    }

    // 按创建时间倒序排列
    stories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      stories,
      count: stories.length,
      message: '故事列表获取成功'
    });

  } catch (error) {
    console.error('Stories fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取故事列表失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    if (!body.title || !body.initial_prompt) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段：title 和 initial_prompt' },
        { status: 400 }
      );
    }

    // 创建新故事
    const story = await StoryService.createStory({
      title: body.title,
      initial_prompt: body.initial_prompt,
      description: body.description,
      status: body.status || 'active',
      created_by: body.created_by || 'anonymous',
      max_participants: body.max_participants || 10
    });

    return NextResponse.json({
      success: true,
      story,
      message: '故事创建成功'
    });

  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建故事失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
