import { NextRequest, NextResponse } from 'next/server';
import { generateStoryBeginningWithAI, validateStoryParameters } from '@/lib/storyGenerator';
import { StoryService } from '@/lib/database';
import { StoryGenerationRequest } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body: StoryGenerationRequest = await request.json();
    
    // 验证请求参数
    if (!body.parameters) {
      return NextResponse.json(
        { success: false, error: '缺少故事参数' },
        { status: 400 }
      );
    }

    // 验证故事参数
    if (!validateStoryParameters(body.parameters)) {
      return NextResponse.json(
        { success: false, error: '故事参数不完整，至少需要提供时间、地点、人物或事件中的一个' },
        { status: 400 }
      );
    }

    // 使用AI生成故事开头
    const storyBeginning = await generateStoryBeginningWithAI(body);

    // 可选：保存故事到数据库
    if (body.parameters.time || body.parameters.location || body.parameters.characters?.some(c => c.trim())) {
      try {
        const story = await StoryService.createStory({
          title: `${body.style || 'fantasy'}故事 - ${new Date().toLocaleDateString()}`,
          initial_prompt: storyBeginning,
          status: 'active',
          created_by: 'anonymous', // 后续可以替换为真实用户ID
          description: `基于${body.style || 'fantasy'}风格生成的故事`,
          max_participants: 10
        });

        return NextResponse.json({
          success: true,
          story: storyBeginning,
          story_id: story.id,
          message: '故事生成成功'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // 即使数据库保存失败，也返回生成的故事
        return NextResponse.json({
          success: true,
          story: storyBeginning,
          message: '故事生成成功（未保存到数据库）'
        });
      }
    }

    return NextResponse.json({
      success: true,
      story: storyBeginning,
      message: '故事生成成功'
    });

  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '故事生成失败，请稍后重试',
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
