import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (email) {
      const user = await UserService.getUserByEmail(email);
      return NextResponse.json({
        success: true,
        user,
        message: user ? '用户找到' : '用户不存在'
      });
    }

    if (id) {
      const user = await UserService.getUserById(id);
      return NextResponse.json({
        success: true,
        user,
        message: user ? '用户找到' : '用户不存在'
      });
    }

    // 获取所有用户
    const users = await UserService.getAllUsers();
    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      message: '用户列表获取成功'
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取用户信息失败，请稍后重试',
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
    if (!body.username || !body.email) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段：username 和 email' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await UserService.getUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建新用户
    const user = await UserService.createUser({
      username: body.username.trim(),
      email: body.email.trim().toLowerCase()
    });

    return NextResponse.json({
      success: true,
      user,
      message: '用户创建成功'
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建用户失败，请稍后重试',
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
