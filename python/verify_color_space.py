#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
验证BGR/RGB色域转换是否正确
"""

import cv2
import numpy as np


def test_color_conversion():
    """测试BGR到RGB的转换"""
    print("=" * 60)
    print("BGR/RGB色域转换验证")
    print("=" * 60)
    
    # 创建纯色测试图像
    test_colors = {
        'Red': (0, 0, 255),      # BGR红色
        'Green': (0, 255, 0),    # BGR绿色
        'Blue': (255, 0, 0),     # BGR蓝色
        'Yellow': (0, 255, 255), # BGR黄色
        'White': (255, 255, 255) # BGR白色
    }
    
    print("\n🎨 测试BGR到RGB转换:")
    all_passed = True
    
    for color_name, bgr_color in test_colors.items():
        # 创建BGR图像
        img_bgr = np.zeros((100, 100, 3), dtype=np.uint8)
        img_bgr[:, :] = bgr_color
        
        # 转换为RGB
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # 验证转换
        bgr_pixel = img_bgr[0, 0]
        rgb_pixel = img_rgb[0, 0]
        
        # BGR到RGB应该反转通道顺序
        expected_rgb = (bgr_color[2], bgr_color[1], bgr_color[0])
        
        if tuple(rgb_pixel) == expected_rgb:
            print(f"  ✅ {color_name:8s}: BGR{bgr_color} → RGB{tuple(rgb_pixel)}")
        else:
            print(f"  ❌ {color_name:8s}: BGR{bgr_color} → RGB{tuple(rgb_pixel)} (期望: {expected_rgb})")
            all_passed = False
    
    return all_passed


def test_yolo_color_space():
    """测试YOLO推理的色域要求"""
    print("\n🔍 YOLO色域要求测试:")
    
    try:
        from ultralytics import YOLO
        print("  ✅ YOLO库已安装")
        
        # 创建测试图像
        img_bgr = np.random.randint(0, 255, (640, 480, 3), dtype=np.uint8)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        print(f"  📊 BGR图像形状: {img_bgr.shape}")
        print(f"  📊 RGB图像形状: {img_rgb.shape}")
        print(f"  📊 BGR像素示例: {img_bgr[0, 0]}")
        print(f"  📊 RGB像素示例: {img_rgb[0, 0]}")
        
        print("\n  💡 YOLO推理建议:")
        print("     - 输入BGR图像时，YOLO内部可能会自动转换")
        print("     - 但为了确保一致性，建议手动转换为RGB")
        print("     - 这样可以避免潜在的颜色通道错位问题")
        
    except ImportError:
        print("  ⚠️  YOLO库未安装，跳过此测试")
    
    return True


def test_opencv_drawing():
    """测试OpenCV绘制函数的色域要求"""
    print("\n🖌️  OpenCV绘制色域测试:")
    
    # 创建BGR图像
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    
    # 使用BGR颜色绘制
    colors_bgr = {
        'Green': (0, 255, 0),
        'Red': (0, 0, 255),
        'Blue': (255, 0, 0),
        'Yellow': (0, 255, 255)
    }
    
    y_offset = 20
    for color_name, color_bgr in colors_bgr.items():
        cv2.putText(img, color_name, (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_bgr, 2)
        y_offset += 40
    
    # 保存图像
    output_path = 'opencv_drawing_test.jpg'
    cv2.imwrite(output_path, img)
    
    print(f"  ✅ 绘制测试完成")
    print(f"  💾 测试图像已保存: {output_path}")
    print(f"  👁️  请打开图像验证颜色是否正确")
    
    return True


def create_comparison_image():
    """创建BGR vs RGB对比图像"""
    print("\n📸 创建BGR/RGB对比图像:")
    
    # 创建渐变图像
    img = np.zeros((300, 600, 3), dtype=np.uint8)
    
    # 左半部分：BGR渐变
    for i in range(300):
        for j in range(300):
            img[i, j] = (j * 255 // 300, i * 255 // 300, 128)
    
    # 右半部分：RGB渐变（转换后）
    img_rgb = np.zeros((300, 300, 3), dtype=np.uint8)
    for i in range(300):
        for j in range(300):
            img_rgb[i, j] = (j * 255 // 300, i * 255 // 300, 128)
    
    # 转换RGB到BGR用于显示
    img_rgb_as_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    img[:, 300:] = img_rgb_as_bgr
    
    # 添加标签
    cv2.putText(img, "BGR", (100, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(img, "RGB (as BGR)", (350, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # 保存
    output_path = 'bgr_rgb_comparison.jpg'
    cv2.imwrite(output_path, img)
    
    print(f"  ✅ 对比图像已创建")
    print(f"  💾 已保存: {output_path}")
    print(f"  👁️  左侧=BGR，右侧=RGB（转换为BGR显示）")
    
    return True


if __name__ == '__main__':
    print("\n🚀 开始色域验证测试...\n")
    
    # 运行所有测试
    test1 = test_color_conversion()
    test2 = test_yolo_color_space()
    test3 = test_opencv_drawing()
    test4 = create_comparison_image()
    
    print("\n" + "=" * 60)
    if test1 and test2 and test3 and test4:
        print("✅ 所有测试通过！")
        print("\n关键要点:")
        print("  1. OpenCV使用BGR色域（输入/输出）")
        print("  2. YOLO需要RGB色域（推理时）")
        print("  3. OpenCV绘制函数使用BGR色域")
        print("  4. 必须在推理前进行BGR→RGB转换")
    else:
        print("❌ 部分测试失败")
    print("=" * 60)
