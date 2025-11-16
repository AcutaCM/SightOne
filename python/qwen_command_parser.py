#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
千问模型命令解析器
支持千问系列模型的自然语言命令解析
"""

import json
import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class QwenCommandParser:
    """千问命令解析器"""
    
    @staticmethod
    def get_system_prompt() -> str:
        """
        获取千问模型的系统提示词
        
        Returns:
            系统提示词
        """
        return """你是一个专业的无人机命令解析助手。你的任务是将用户的自然语言命令转换为标准的无人机控制命令。

支持的命令类型：
1. 起飞/降落：takeoff, land, emergency
2. 移动：move_up, move_down, move_left, move_right, move_forward, move_back
3. 旋转：rotate_clockwise, rotate_counter_clockwise
4. 翻滚：flip_forward, flip_back, flip_left, flip_right
5. 状态查询：get_battery, get_temperature, get_height

命令参数：
- 移动命令需要distance参数（单位：厘米，范围：20-500）
- 旋转命令需要degrees参数（单位：度，范围：1-360）

请将用户的自然语言命令解析为JSON格式的命令列表。每个命令包含：
- action: 命令动作
- parameters: 命令参数（如果需要）
- description: 命令描述

示例输入："起飞后向前飞50厘米，然后顺时针旋转90度"
示例输出：
```json
[
  {
    "action": "takeoff",
    "parameters": {},
    "description": "起飞"
  },
  {
    "action": "move_forward",
    "parameters": {"distance": 50},
    "description": "向前飞行50厘米"
  },
  {
    "action": "rotate_clockwise",
    "parameters": {"degrees": 90},
    "description": "顺时针旋转90度"
  }
]
```

注意事项：
1. 只输出JSON格式的命令列表，不要添加其他说明文字
2. 确保命令的安全性，避免危险操作
3. 如果命令不明确，选择最安全的解释
4. 距离和角度参数必须在合理范围内
5. 如果用户命令无法解析，返回空数组[]

现在请解析用户的命令："""
    
    @staticmethod
    async def parse_with_qwen_openai_compatible(client, model: str, command: str, 
                                                 temperature: float = 0.7, 
                                                 max_tokens: int = 2000) -> Dict[str, Any]:
        """
        使用千问模型解析命令（OpenAI兼容接口）
        
        Args:
            client: OpenAI兼容的客户端
            model: 模型名称
            command: 自然语言命令
            temperature: 温度参数
            max_tokens: 最大token数
        
        Returns:
            解析结果
        """
        try:
            system_prompt = QwenCommandParser.get_system_prompt()
            
            # 调用千问API（OpenAI兼容接口）
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": command}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # 解析响应
            ai_response = response.choices[0].message.content
            logger.info(f"千问响应: {ai_response}")
            
            # 提取命令
            commands = QwenCommandParser.extract_commands_from_response(ai_response)
            
            return {
                "success": True,
                "commands": commands,
                "analysis": ai_response,
                "provider": "qwen",
                "model": model
            }
            
        except Exception as e:
            logger.error(f"千问解析失败: {e}")
            return {
                "success": False,
                "error": f"千问解析失败: {str(e)}"
            }
    
    @staticmethod
    async def parse_with_dashscope(client, model: str, command: str,
                                   temperature: float = 0.7,
                                   max_tokens: int = 2000) -> Dict[str, Any]:
        """
        使用DashScope SDK解析命令
        
        Args:
            client: DashScope客户端
            model: 模型名称
            command: 自然语言命令
            temperature: 温度参数
            max_tokens: 最大token数
        
        Returns:
            解析结果
        """
        try:
            from dashscope import Generation
            
            system_prompt = QwenCommandParser.get_system_prompt()
            
            # 构建完整提示
            full_prompt = f"{system_prompt}\n\n用户命令: {command}"
            
            # 调用DashScope API
            response = Generation.call(
                model=model,
                prompt=full_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                result_format='message'
            )
            
            # 解析响应
            if response.status_code == 200:
                ai_response = response.output.text
                logger.info(f"DashScope响应: {ai_response}")
                
                # 提取命令
                commands = QwenCommandParser.extract_commands_from_response(ai_response)
                
                return {
                    "success": True,
                    "commands": commands,
                    "analysis": ai_response,
                    "provider": "dashscope",
                    "model": model
                }
            else:
                error_msg = f"DashScope API错误: {response.code} - {response.message}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg
                }
            
        except Exception as e:
            logger.error(f"DashScope解析失败: {e}")
            return {
                "success": False,
                "error": f"DashScope解析失败: {str(e)}"
            }
    
    @staticmethod
    def extract_commands_from_response(ai_response: str) -> List[Dict[str, Any]]:
        """
        从AI响应中提取命令列表
        
        Args:
            ai_response: AI的响应文本
        
        Returns:
            命令列表
        """
        try:
            # 尝试直接解析JSON
            
            # 查找JSON代码块
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', ai_response)
            if json_match:
                json_str = json_match.group(1)
            else:
                # 尝试查找JSON数组
                json_match = re.search(r'\[\s*\{[\s\S]*?\}\s*\]', ai_response)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    # 如果没有找到JSON，尝试整个响应
                    json_str = ai_response.strip()
            
            # 解析JSON
            commands = json.loads(json_str)
            
            # 验证命令格式
            if not isinstance(commands, list):
                logger.error(f"命令格式错误：不是列表类型")
                return []
            
            # 验证每个命令
            valid_commands = []
            for cmd in commands:
                if isinstance(cmd, dict) and 'action' in cmd:
                    # 确保parameters字段存在
                    if 'parameters' not in cmd:
                        cmd['parameters'] = {}
                    valid_commands.append(cmd)
                else:
                    logger.warning(f"跳过无效命令: {cmd}")
            
            logger.info(f"成功提取{len(valid_commands)}个命令")
            return valid_commands
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")
            logger.error(f"响应内容: {ai_response}")
            return []
        except Exception as e:
            logger.error(f"提取命令失败: {e}")
            return []


# 使用示例
if __name__ == "__main__":
    import asyncio
    
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    async def test_parser():
        """测试千问解析器"""
        # 这里需要实际的API密钥和客户端
        print("千问命令解析器测试")
        print("系统提示词:")
        print(QwenCommandParser.get_system_prompt())
        
        # 测试命令提取
        test_response = """
```json
[
  {
    "action": "takeoff",
    "parameters": {},
    "description": "起飞"
  },
  {
    "action": "move_forward",
    "parameters": {"distance": 100},
    "description": "向前飞行100厘米"
  }
]
```
"""
        commands = QwenCommandParser.extract_commands_from_response(test_response)
        print(f"\n提取的命令: {commands}")
    
    asyncio.run(test_parser())
