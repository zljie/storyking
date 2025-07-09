import { NextRequest, NextResponse } from 'next/server';
import { generateStoryParameters } from '@/lib/storyGenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style') || 'fantasy';

    // 生成随机故事参数
    const parameters = generateStoryParameters(style);

    return NextResponse.json({
      success: true,
      parameters,
      message: '参数生成成功'
    });

  } catch (error) {
    console.error('Parameter generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '参数生成失败，请稍后重试',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
