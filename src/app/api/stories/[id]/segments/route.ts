import { NextRequest, NextResponse } from 'next/server';
import { SegmentService, StoryService } from '@/lib/database';

export async function GET(
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

    // 获取故事片段
    const segments = await SegmentService.getSegmentsByStoryId(storyId);

    return NextResponse.json({
      success: true,
      segments,
      count: segments.length,
      story_title: story.title,
      message: '故事片段获取成功'
    });

  } catch (error) {
    console.error('Segments fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取故事片段失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const body = await request.json();

    // 验证故事是否存在
    const story = await StoryService.getStoryById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    // 验证故事状态
    if (story.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '只能向活跃状态的故事添加片段' },
        { status: 400 }
      );
    }

    // 验证必需字段
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: '故事内容不能为空' },
        { status: 400 }
      );
    }

    // 获取下一个序号
    const orderIndex = await SegmentService.getNextOrderIndex(storyId);

    // 创建新片段
    const segment = await SegmentService.createSegment({
      story_id: storyId,
      author_id: body.author_id || 'anonymous',
      content: body.content.trim(),
      order_index: orderIndex,
      story_parameters: body.story_parameters || {}
    });

    // 更新故事的更新时间
    await StoryService.updateStory(storyId, {
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      segment,
      message: '故事片段添加成功'
    });

  } catch (error) {
    console.error('Segment creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '添加故事片段失败，请稍后重试',
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
