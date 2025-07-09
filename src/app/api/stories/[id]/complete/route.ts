import { NextRequest, NextResponse } from 'next/server';
import { StoryService } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;

    // 验证故事是否存在
    const story = await StoryService.getStoryById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    // 只有活跃的故事可以标记为完成
    if (story.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '只能完成活跃状态的故事' },
        { status: 400 }
      );
    }

    // 更新故事状态为已完成
    const updatedStory = await StoryService.updateStory(storyId, {
      status: 'completed'
    });

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: '完成故事失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: '故事已标记为完成'
    });

  } catch (error) {
    console.error('Story complete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '完成故事失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 重新激活已完成的故事
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;

    // 验证故事是否存在
    const story = await StoryService.getStoryById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    // 只有已完成的故事可以重新激活
    if (story.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: '只能重新激活已完成的故事' },
        { status: 400 }
      );
    }

    // 重新激活故事
    const updatedStory = await StoryService.updateStory(storyId, {
      status: 'active'
    });

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: '重新激活故事失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: '故事已重新激活'
    });

  } catch (error) {
    console.error('Story reactivate error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '重新激活故事失败，请稍后重试',
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
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
