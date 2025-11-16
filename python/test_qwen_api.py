#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Qwen API连接测试脚本
用于测试API密钥、端点和模型是否正确配置
"""

import asyncio
import sys

async def test_qwen_api():
    """测试Qwen API连接"""
    
    print("=" * 60)
    print("Qwen API 连接测试")
    print("=" * 60)
    print()
    
    # 1. 获取配置
    print("📋 步骤1: 输入配置")
    print("-" * 60)
    
    api_key = input("请输入API密钥: ").strip()
    if not api_key:
        print("❌ API密钥不能为空")
        return False
    
    api_base = input("请输入API端点 (默认: https://dashscope.aliyuncs.com/compatible-mode/v1): ").strip()
    if not api_base:
        api_base = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    model = input("请输入模型名称 (默认: qwen-vl-plus): ").strip()
    if not model:
        model = "qwen3-vl-plus"
    
    print()
    print("✅ 配置信息:")
    print(f"   API密钥: {api_key[:10]}...{api_key[-4:]}")
    print(f"   API端点: {api_base}")
    print(f"   模型: {model}")
    print()
    
    # 2. 测试导入
    print("📦 步骤2: 检查依赖库")
    print("-" * 60)
    
    try:
        from openai import AsyncOpenAI
        print("✅ openai 库已安装")
    except ImportError:
        print("❌ openai 库未安装")
        print("   请运行: pip install openai")
        return False
    
    print()
    
    # 3. 创建客户端
    print("🔧 步骤3: 创建API客户端")
    print("-" * 60)
    
    try:
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=api_base
        )
        print("✅ 客户端创建成功")
    except Exception as e:
        print(f"❌ 客户端创建失败: {e}")
        return False
    
    print()
    
    # 4. 测试简单文本请求
    print("📝 步骤4: 测试文本请求")
    print("-" * 60)
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "你好，请回复'测试成功'"}
            ],
            max_tokens=50
        )
        
        result = response.choices[0].message.content
        print(f"✅ 文本请求成功")
        print(f"   响应: {result}")
    except Exception as e:
        print(f"❌ 文本请求失败: {type(e).__name__}: {str(e)}")
        print()
        print("💡 常见错误解决方案:")
        
        error_str = str(e).lower()
        if "connection" in error_str:
            print("   - 检查网络连接")
            print("   - 检查API端点是否正确")
            print(f"   - 测试: curl -I {api_base}")
        elif "401" in str(e) or "unauthorized" in error_str:
            print("   - API密钥无效或已过期")
            print("   - 请在阿里云控制台检查API密钥")
        elif "404" in str(e) or "not found" in error_str:
            print("   - API端点错误")
            print(f"   - 当前端点: {api_base}")
            print("   - 正确端点: https://dashscope.aliyuncs.com/compatible-mode/v1")
        elif "model" in error_str:
            print("   - 模型名称错误或无权限")
            print(f"   - 当前模型: {model}")
            print("   - 可用模型: qwen-vl-plus, qwen-vl-max, qwen3-vl")
        
        return False
    
    print()
    
    # 5. 测试视觉请求
    print("🖼️ 步骤5: 测试视觉请求")
    print("-" * 60)
    
    # 创建一个简单的测试图像（1x1像素的红色PNG）
    test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "这是什么颜色？"},
                        {"type": "image_url", "image_url": {"url": test_image_base64}}
                    ]
                }
            ],
            max_tokens=50
        )
        
        result = response.choices[0].message.content
        print(f"✅ 视觉请求成功")
        print(f"   响应: {result}")
    except Exception as e:
        print(f"❌ 视觉请求失败: {type(e).__name__}: {str(e)}")
        print()
        print("💡 可能的原因:")
        print("   - 模型不支持视觉功能")
        print(f"   - 当前模型: {model}")
        print("   - 请使用支持视觉的模型: qwen-vl-plus, qwen-vl-max, qwen3-vl")
        return False
    
    print()
    
    # 6. 总结
    print("=" * 60)
    print("✅ 所有测试通过！")
    print("=" * 60)
    print()
    print("📋 配置信息（请保存）:")
    print(f"   provider: qwen")
    print(f"   model: {model}")
    print(f"   api_key: {api_key}")
    print(f"   api_base: {api_base}")
    print()
    print("💾 在浏览器控制台运行以下命令保存配置:")
    print()
    print(f"localStorage.setItem('chat.apiKey.qwen', '{api_key}');")
    print(f"localStorage.setItem('chat.apiBase.qwen', '{api_base}');")
    print(f"localStorage.setItem('chat.model.qwen', '{model}');")
    print("location.reload();")
    print()
    
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_qwen_api())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️ 测试已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
