# WebSocket 1005 错误修复

## 问题描述

WebSocket连接出现 `received 1005 (no status received [internal])` 错误，导致连接异常关闭。

## 错误原因

1. **缺失方法**: `_send_analysis_to_3002` 方法被调用但未定义，导致异常
2. **错误处理不完善**: WebSocket消息处理异常时，没有检查连接状态就尝试发送响应
3. **连接关闭处理不当**: 没有区分正常关闭和异常关闭，导致日志信息不清晰

## 修复内容

### 1. 添加缺失的 `_send_analysis_to_3002` 方法

```python
async def _send_analysis_to_3002(self, ai_analysis: Dict[str, Any]):
    """发送AI分析结果到3002端口的后端服务"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                'http://localhost:3002/api/ai-analysis',
                json={
                    'type': 'ai_analysis',
                    'data': ai_analysis,
                    'timestamp': datetime.now().isoformat()
                }
            )
            if response.status_code == 200:
                logger.info("成功连接到3002后端")
                result = response.json()
                logger.info(f"AI分析结果已发送到3002后端")
                return result
            else:
                logger.warning(f"3002后端返回非200状态码: {response.status_code}")
                return None
    except httpx.ConnectError:
        logger.debug("无法连接到3002端口（服务可能未启动）")
        return None
    except Exception as e:
        logger.error(f"发送分析到3002失败: {e}")
        return None
```

### 2. 改进 `handle_websocket_message` 异常处理

**修复前:**
```python
except Exception as e:
    logger.error(f"处理WebSocket消息失败: {e}")
    error_response = {
        'type': 'error',
        'success': False,
        'error': f'消息处理失败: {str(e)}'
    }
    try:
        await websocket.send(json.dumps(error_response))
    except:
        pass
```

**修复后:**
```python
except Exception as e:
    logger.error(f"处理WebSocket消息失败: {e}")
    logger.error(f"错误堆栈: {traceback.format_exc()}")
    error_response = {
        'type': 'error',
        'success': False,
        'error': f'消息处理失败: {str(e)}'
    }
    try:
        if websocket.open:  # 检查连接是否打开
            await websocket.send(json.dumps(error_response))
    except Exception as send_error:
        logger.error(f"发送错误响应失败: {send_error}")
```

### 3. 改进 `websocket_handler` 连接关闭处理

**修复前:**
```python
except websockets.exceptions.ConnectionClosed:
    logger.info(f"WebSocket连接关闭: {websocket.remote_address}")
except Exception as e:
    logger.error(f"WebSocket处理错误: {e}")
finally:
    self.websocket_clients.discard(websocket)
```

**修复后:**
```python
except websockets.exceptions.ConnectionClosedOK:
    logger.info(f"WebSocket连接正常关闭: {websocket.remote_address}")
except websockets.exceptions.ConnectionClosedError as cce:
    logger.warning(f"WebSocket连接异常关闭: {websocket.remote_address}, 代码: {cce.code}, 原因: {cce.reason}")
except websockets.exceptions.ConnectionClosed as cc:
    logger.info(f"WebSocket连接关闭: {websocket.remote_address}, 代码: {cc.code}")
except Exception as e:
    logger.error(f"WebSocket处理错误: {e}")
    logger.error(f"错误堆栈: {traceback.format_exc()}")
finally:
    self.websocket_clients.discard(websocket)
    logger.info(f"WebSocket客户端已移除: {websocket.remote_address}")
```

## 改进点

1. **完整的错误日志**: 添加了 `traceback.format_exc()` 以获取完整的错误堆栈信息
2. **连接状态检查**: 在发送消息前检查 `websocket.open` 状态
3. **细粒度的异常处理**: 区分 `ConnectionClosedOK`、`ConnectionClosedError` 和 `ConnectionClosed`
4. **更详细的日志**: 记录关闭代码和原因，便于调试
5. **防御性编程**: 所有可能失败的操作都包裹在 try-except 中

## 测试建议

1. 启动服务后发送正常命令，验证功能正常
2. 发送格式错误的JSON，验证错误处理
3. 在命令执行过程中断开连接，验证清理逻辑
4. 检查日志文件，确认错误信息完整清晰

## 相关文件

- `drone-analyzer-nextjs/python/tello_intelligent_agent.py`

### 4. 保护主响应发送逻辑 (追加修复)

根据实际错误堆栈，错误发生在 line 823 的 `await websocket.send(json.dumps(response))`。客户端在我们发送响应前就关闭了连接。

**修复前:**
```python
await websocket.send(json.dumps(response))
```

**修复后:**
```python
# 检查连接状态后再发送响应
if websocket.open:
    try:
        await websocket.send(json.dumps(response))
    except websockets.exceptions.ConnectionClosed:
        logger.warning(f"尝试发送响应时连接已关闭: {message_type}")
        return  # 连接已关闭，直接返回
    except Exception as send_err:
        logger.error(f"发送响应失败: {send_err}")
        return
else:
    logger.warning(f"WebSocket连接已关闭，无法发送响应: {message_type}")
    return
```

## 根本原因分析

从错误堆栈可以看出：
```
File "tello_intelligent_agent.py", line 823, in handle_websocket_message
    await websocket.send(json.dumps(response))
websockets.exceptions.ConnectionClosedOK: received 1005 (no status received [internal])
```

这表明：
1. 客户端在服务器处理完消息并准备发送响应时关闭了连接
2. 1005 状态码表示"没有收到状态码"，通常是客户端异常断开
3. 可能的原因：
   - 客户端超时
   - 客户端主动断开
   - 网络问题导致连接中断
   - 处理时间过长，客户端等不及

## 修复日期

2025-11-12 (初次修复)
2025-11-12 13:30 (追加主响应发送保护)
