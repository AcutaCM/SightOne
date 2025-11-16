/**
 * YOLO模型热插拔API
 * 提供模型上传、切换、列表和删除功能
 */

import { NextRequest, NextResponse } from 'next/server';

// WebSocket连接到后端（假设使用全局WebSocket管理器）
// 实际项目中应该使用全局的WebSocket连接池
let wsConnection: WebSocket | null = null;

function getWebSocketConnection(): WebSocket {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    wsConnection = new WebSocket('ws://localhost:3002');
  }
  return wsConnection;
}

/**
 * POST - 执行模型相关操作
 * 
 * Body: {
 *   action: 'list' | 'switch' | 'delete' | 'upload',
 *   model_id?: string,  // for switch/delete
 *   model_path?: string, // for upload
 *   model_name?: string, // for upload
 *   model_type?: string  // for upload
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, model_id, model_path, model_name, model_type } = body;

    // 创建Promise来等待WebSocket响应
    const response = await new Promise((resolve, reject) => {
      const ws = getWebSocketConnection();
      
      const timeout = setTimeout(() => {
        reject(new Error('请求超时'));
      }, 10000); // 10秒超时

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // 根据不同的响应类型处理
        if (data.type === 'models_list' || 
            data.type === 'model_switched' || 
            data.type === 'model_deleted' ||
            data.type === 'model_uploaded') {
          clearTimeout(timeout);
          resolve(data);
        } else if (data.type === 'error') {
          clearTimeout(timeout);
          reject(new Error(data.message));
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      // 发送相应的命令
      let command: any;
      
      switch (action) {
        case 'list':
          command = { command: 'list_models' };
          break;
        
        case 'switch':
          if (!model_id) {
            reject(new Error('缺少model_id参数'));
            return;
          }
          command = { command: 'switch_model', model_id };
          break;
        
        case 'delete':
          if (!model_id) {
            reject(new Error('缺少model_id参数'));
            return;
          }
          command = { command: 'delete_model', model_id };
          break;
        
        case 'upload':
          if (!model_path || !model_name) {
            reject(new Error('缺少model_path或model_name参数'));
            return;
          }
          command = {
            command: 'upload_model',
            model_path,
            model_name,
            model_type: model_type || 'custom'
          };
          break;
        
        default:
          reject(new Error(`未知的操作: ${action}`));
          return;
      }

      ws.send(JSON.stringify(command));
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('模型管理API错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '操作失败'
    }, { status: 500 });
  }
}

/**
 * GET - 获取模型列表
 */
export async function GET(request: NextRequest) {
  try {
    const response = await new Promise((resolve, reject) => {
      const ws = getWebSocketConnection();
      
      const timeout = setTimeout(() => {
        reject(new Error('请求超时'));
      }, 5000);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'models_list') {
          clearTimeout(timeout);
          resolve(data);
        }
      };

      ws.send(JSON.stringify({ command: 'list_models' }));
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '获取模型列表失败'
    }, { status: 500 });
  }
}





