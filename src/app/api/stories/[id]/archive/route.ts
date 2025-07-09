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

    // 只有活跃或已完成的故事可以存档
    if (story.status === 'archived') {
      return NextResponse.json(
        { success: false, error: '故事已经存档' },
        { status: 400 }
      );
    }

    // 更新故事状态为存档
    const updatedStory = await StoryService.updateStory(storyId, {
      status: 'archived'
    });

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: '存档故事失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: '故事已成功存档'
    });

  } catch (error) {
    console.error('Story archive error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '存档故事失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 恢复存档的故事
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

    // 只有存档的故事可以恢复
    if (story.status !== 'archived') {
      return NextResponse.json(
        { success: false, error: '只能恢复已存档的故事' },
        { status: 400 }
      );
    }

    // 恢复故事状态为活跃
    const updatedStory = await StoryService.updateStory(storyId, {
      status: 'active'
    });

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: '恢复故事失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: '故事已成功恢复'
    });

  } catch (error) {
    console.error('Story restore error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '恢复故事失败，请稍后重试',
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
