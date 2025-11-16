/**
 * YOLO模型管理页面
 * 独立的模型管理界面
 */

'use client';

import React from 'react';
import YOLOModelManager from '@/components/YOLOModelManager';

export default function ModelManagerPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">YOLO模型管理</h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理和切换YOLO检测模型，支持运行时热插拔
        </p>
      </div>

      <YOLOModelManager />

      {/* 使用说明 */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">使用说明</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              📤 上传模型
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              点击"上传模型"按钮，填写模型名称和文件路径。支持YOLOv8/YOLOv11的.pt格式模型。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
              🔄 切换模型
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              点击"切换"按钮即可实时切换检测模型，无需重启服务。切换后所有视频流将使用新模型进行检测。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
              🗑️ 删除模型
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              可以删除不再需要的自定义模型。默认模型无法删除。删除后模型文件将从系统中移除。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
              🍓 默认草莓模型
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              系统预装草莓成熟度检测模型，支持4级分类：未成熟（绿色）、半成熟（橙色）、成熟（红色）、过熟（紫色）。
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ 注意：</strong> 上传的模型文件会被复制到系统模型目录，确保模型文件完整且格式正确。
          </p>
        </div>
      </div>
    </div>
  );
}





