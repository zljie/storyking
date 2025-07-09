import { NextRequest, NextResponse } from 'next/server';
import { StoryService, SegmentService, ParticipantService } from '@/lib/database';
import { StoryContinuationRequest } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body: StoryContinuationRequest = await request.json();
    
    // 验证请求参数
    if (!body.story_id || !body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：story_id 和 content' },
        { status: 400 }
      );
    }

    // 验证故事是否存在
    const story = await StoryService.getStoryById(body.story_id);
    if (!story) {
      return NextResponse.json(
        { success: false, error: '故事不存在' },
        { status: 404 }
      );
    }

    // 验证故事状态
    if (story.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '只能向活跃状态的故事添加续写' },
        { status: 400 }
      );
    }

    // 检查参与者限制
    if (story.max_participants && story.current_participants >= story.max_participants) {
      return NextResponse.json(
        { success: false, error: '故事参与者已达上限' },
        { status: 400 }
      );
    }

    const authorId = 'anonymous'; // 后续可以替换为真实用户ID

    // 获取下一个序号
    const orderIndex = await SegmentService.getNextOrderIndex(body.story_id);

    // 创建新的故事片段
    const segment = await SegmentService.createSegment({
      story_id: body.story_id,
      author_id: authorId,
      content: body.content.trim(),
      order_index: orderIndex,
      story_parameters: body.parameters || {}
    });

    // 添加参与者（如果还不是参与者）
    try {
      await ParticipantService.addParticipant(body.story_id, authorId);
      await ParticipantService.incrementContribution(body.story_id, authorId);
    } catch (participantError) {
      console.error('Participant management error:', participantError);
      // 不影响主要功能，继续执行
    }

    // 更新故事信息
    const participants = await ParticipantService.getParticipantsByStoryId(body.story_id);
    await StoryService.updateStory(body.story_id, {
      current_participants: participants.length,
      updated_at: new Date().toISOString()
    });

    // 获取更新后的故事信息
    const updatedStory = await StoryService.getStoryById(body.story_id);
    const allSegments = await SegmentService.getSegmentsByStoryId(body.story_id);

    return NextResponse.json({
      success: true,
      segment,
      story: updatedStory,
      total_segments: allSegments.length,
      message: '故事续写成功'
    });

  } catch (error) {
    console.error('Story continuation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '故事续写失败，请稍后重试',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
