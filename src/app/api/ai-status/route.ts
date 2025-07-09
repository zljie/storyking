import { NextResponse } from 'next/server';
import { getDeepSeekConfigStatus } from '@/lib/deepseekService';

export async function GET() {
  try {
    const status = getDeepSeekConfigStatus();
    
    return NextResponse.json({
      success: true,
      ai_enabled: status.configured,
      message: status.message,
      provider: status.configured ? 'DeepSeek V3' : 'Template Generator'
    });

  } catch (error) {
    console.error('AI status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        ai_enabled: false,
        error: 'Failed to check AI status',
        provider: 'Template Generator'
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
