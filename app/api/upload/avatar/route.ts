import { NextRequest, NextResponse } from 'next/server';
import { userDatabase } from '@/lib/userDatabase';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // 优先使用 Cookie 认证
    const email = request.cookies.get('user_email')?.value;
    let userId: string | undefined;
    
    if (email) {
      // Cookie 认证：通过 email 查找用户
      const user = userDatabase.getUserByEmail(email);
      if (user) {
        userId = user.id;
      }
    } else {
      // 回退到 Bearer token 认证（向后兼容）
      const authorization = request.headers.get('authorization');
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json(
          { message: '未提供有效的认证信息' },
          { status: 401 }
        );
      }

      const token = authorization.split(' ')[1];
      const sessionData = userDatabase.getSessionByToken(token);
      
      if (!sessionData) {
        return NextResponse.json(
          { message: 'Token无效或已过期' },
          { status: 401 }
        );
      }
      
      userId = sessionData.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { message: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: '只允许上传 JPG、PNG、GIF 或 WebP 格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: '文件大小不能超过 2MB' },
        { status: 400 }
      );
    }

    // 生成文件名
    const fileExtension = file.type.split('/')[1];
    const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(filePath, fileBuffer);
    
    // 生成可访问的URL
    const avatarUrl = `/uploads/${fileName}`;
    
    // 更新用户头像信息
    const updatedUser = userDatabase.updateUser(userId, { avatar: avatarUrl });
    
    if (!updatedUser) {
      // 如果更新失败，删除已保存的文件
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('删除文件失败:', unlinkError);
      }
      
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: '头像上传成功',
      avatarUrl,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('上传头像错误:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}