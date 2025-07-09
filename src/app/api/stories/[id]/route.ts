import { NextRequest, NextResponse } from 'next/server';
import { StoryService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const story = await StoryService.getStoryById(storyId);

    if (!story) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story,
      message: '故事获取成功'
    });

  } catch (error) {
    console.error('Story fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取故事失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const body = await request.json();

    // 验证故事是否存在
    const existingStory = await StoryService.getStoryById(storyId);
    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    // 更新故事
    const updatedStory = await StoryService.updateStory(storyId, body);

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: '更新故事失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: '故事更新成功'
    });

  } catch (error) {
    console.error('Story update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新故事失败，请稍后重试',
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
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
