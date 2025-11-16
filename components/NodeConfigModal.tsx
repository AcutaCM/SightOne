'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Textarea } from "@heroui/input";
import { useTheme } from "next-themes";
import AssistantSelector from './workflow/AssistantSelector';
import { getModalPanelStyle } from '@/lib/panel-styles';

interface NodeConfig {
  id: string;
  type: string;
  label: string;
  parameters: Record<string, any>;
}

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeConfig: NodeConfig | null;
  onSave: (config: NodeConfig) => void;
}

const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  isOpen,
  onClose,
  nodeConfig,
  onSave
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [config, setConfig] = useState<NodeConfig | null>(null);

  useEffect(() => {
    if (nodeConfig) {
      setConfig({ ...nodeConfig });
    }
  }, [nodeConfig]);

  const handleSave = () => {
    if (config) {
      onSave(config);
      onClose();
    }
  };

  const updateParameter = (key: string, value: any) => {
    if (config) {
      setConfig({
        ...config,
        parameters: {
          ...config.parameters,
          [key]: value
        }
      });
    }
  };

  const renderParameterInputs = () => {
    if (!config) return null;

    const { type } = config;
    const params = config.parameters || {};

    switch (type) {
      case 'takeoff':
        return (
          <div className="space-y-4">
            <Input
              label="起飞高度 (cm)"
              type="number"
              value={params.height?.toString() || '100'}
              onChange={(e) => updateParameter('height', parseInt(e.target.value) || 100)}
              description="设置起飞后的悬停高度"
            />
            <Switch
              isSelected={params.waitForStable || true}
              onValueChange={(value) => updateParameter('waitForStable', value)}
            >
              等待稳定后继续
            </Switch>
          </div>
        );

      case 'land':
        return (
          <div className="space-y-4">
            <Switch
              isSelected={params.safetyCheck || true}
              onValueChange={(value) => updateParameter('safetyCheck', value)}
            >
              降落前安全检查
            </Switch>
            <Input
              label="降落速度"
              type="number"
              value={params.speed?.toString() || '50'}
              onChange={(e) => updateParameter('speed', parseInt(e.target.value) || 50)}
              description="降落速度 (1-100)"
            />
          </div>
        );

      case 'move_forward':
      case 'move_backward':
      case 'move_left':
      case 'move_right':
        return (
          <div className="space-y-4">
            <Input
              label="移动距离 (cm)"
              type="number"
              value={params.distance?.toString() || '50'}
              onChange={(e) => updateParameter('distance', parseInt(e.target.value) || 50)}
              description="移动的距离，范围: 20-500cm"
            />
            <Input
              label="移动速度 (cm/s)"
              type="number"
              value={params.speed?.toString() || '50'}
              onChange={(e) => updateParameter('speed', parseInt(e.target.value) || 50)}
              description="移动速度，范围: 10-100cm/s"
            />
          </div>
        );

      case 'move_up':
      case 'move_down':
        return (
          <div className="space-y-4">
            <Input
              label="移动距离 (cm)"
              type="number"
              value={params.distance?.toString() || '50'}
              onChange={(e) => updateParameter('distance', parseInt(e.target.value) || 50)}
              description="垂直移动距离，范围: 20-500cm"
            />
            <Input
              label="移动速度 (cm/s)"
              type="number"
              value={params.speed?.toString() || '30'}
              onChange={(e) => updateParameter('speed', parseInt(e.target.value) || 30)}
              description="垂直移动速度，范围: 10-100cm/s"
            />
          </div>
        );

      case 'rotate_cw':
      case 'rotate_ccw':
        return (
          <div className="space-y-4">
            <Input
              label="旋转角度 (度)"
              type="number"
              value={params.angle?.toString() || '90'}
              onChange={(e) => updateParameter('angle', parseInt(e.target.value) || 90)}
              description="旋转角度，范围: 1-360度"
            />
            <Input
              label="旋转速度 (度/s)"
              type="number"
              value={params.speed?.toString() || '60'}
              onChange={(e) => updateParameter('speed', parseInt(e.target.value) || 60)}
              description="旋转速度，范围: 10-360度/s"
            />
          </div>
        );

      case 'hover':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">悬停时间 (秒): {params.duration || 3}</label>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={params.duration || 3}
                onChange={(e) => updateParameter('duration', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5s</span>
                <span>30s</span>
              </div>
            </div>
            <Switch
              isSelected={params.stabilize || true}
              onValueChange={(value) => updateParameter('stabilize', value)}
            >
              自动稳定位置
            </Switch>
          </div>
        );

      case 'wait':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">等待时间 (秒): {params.duration || 1}</label>
              <input
                type="range"
                min="0.1"
                max="60"
                step="0.1"
                value={params.duration || 1}
                onChange={(e) => updateParameter('duration', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1s</span>
                <span>60s</span>
              </div>
            </div>
            <Input
              label="等待描述"
              value={params.description || ''}
              onChange={(e) => updateParameter('description', e.target.value)}
              placeholder="描述等待的目的..."
            />
          </div>
        );

      case 'qr_scan':
        return (
          <div className="space-y-4">
            <Input
              label="扫描超时 (秒)"
              type="number"
              value={params.timeout?.toString() || '10'}
              onChange={(e) => updateParameter('timeout', parseInt(e.target.value) || 10)}
              description="扫描QR码的最大等待时间"
            />
            <Switch
              isSelected={params.saveImage || true}
              onValueChange={(value) => updateParameter('saveImage', value)}
            >
              保存扫描图像
            </Switch>
            <Switch
              isSelected={params.continueOnFail || false}
              onValueChange={(value) => updateParameter('continueOnFail', value)}
            >
              扫描失败时继续执行
            </Switch>
          </div>
        );

      case 'strawberry_detection':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">检测置信度: {params.confidence || 0.7}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={params.confidence || 0.7}
                onChange={(e) => updateParameter('confidence', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1</span>
                <span>1.0</span>
              </div>
            </div>
            <Input
              label="检测超时 (秒)"
              type="number"
              value={params.timeout?.toString() || '15'}
              onChange={(e) => updateParameter('timeout', parseInt(e.target.value) || 15)}
            />
            <Switch
              isSelected={params.saveResults || true}
              onValueChange={(value) => updateParameter('saveResults', value)}
            >
              保存检测结果
            </Switch>
          </div>
        );

      case 'flip_forward':
      case 'flip_backward':
      case 'flip_left':
      case 'flip_right':
        return (
          <div className="space-y-4">
            <Switch
              isSelected={params.safetyCheck || true}
              onValueChange={(value) => updateParameter('safetyCheck', value)}
            >
              翻转前安全检查
            </Switch>
            <Input
              label="翻转后等待时间 (秒)"
              type="number"
              step="0.1"
              value={params.waitAfter?.toString() || '2'}
              onChange={(e) => updateParameter('waitAfter', parseFloat(e.target.value) || 2)}
              description="翻转完成后的稳定等待时间"
            />
          </div>
        );

      case 'start':
        return (
          <div className="space-y-4">
            <Input
              label="工作流名称"
              value={params.workflowName || ''}
              onChange={(e) => updateParameter('workflowName', e.target.value)}
              placeholder="输入工作流名称..."
            />
            <Input
              label="描述"
              value={params.description || ''}
              onChange={(e) => updateParameter('description', e.target.value)}
              placeholder="描述工作流的目的..."
            />
            <Switch
              isSelected={params.autoStart || false}
              onValueChange={(value) => updateParameter('autoStart', value)}
            >
              自动开始执行
            </Switch>
          </div>
        );

      case 'end':
        return (
          <div className="space-y-4">
            <Select
              label="结束动作"
              selectedKeys={[params.endAction || 'land']}
              onSelectionChange={(keys) => updateParameter('endAction', Array.from(keys)[0])}
            >
              <SelectItem key="land">自动降落</SelectItem>
              <SelectItem key="hover">保持悬停</SelectItem>
              <SelectItem key="return">返回起点</SelectItem>
            </Select>
            <Switch
              isSelected={params.generateReport || true}
              onValueChange={(value) => updateParameter('generateReport', value)}
            >
              生成执行报告
            </Switch>
            <Switch
              isSelected={params.saveLog || true}
              onValueChange={(value) => updateParameter('saveLog', value)}
            >
              保存执行日志
            </Switch>
          </div>
        );

      // 逻辑判断节点
      case 'condition_branch':
        return (
          <div className="space-y-4">
            <Select
              label="判断变量"
              selectedKeys={[params.variable || 'battery']}
              onSelectionChange={(keys) => updateParameter('variable', Array.from(keys)[0])}
            >
              <SelectItem key="battery">电池电量</SelectItem>
              <SelectItem key="altitude">飞行高度</SelectItem>
              <SelectItem key="speed">飞行速度</SelectItem>
              <SelectItem key="temperature">温度</SelectItem>
            </Select>
            <Select
              label="比较操作符"
              selectedKeys={[params.operator || '>']}
              onSelectionChange={(keys) => updateParameter('operator', Array.from(keys)[0])}
            >
              <SelectItem key=">">大于 (&gt;)</SelectItem>
              <SelectItem key="<">小于 (&lt;)</SelectItem>
              <SelectItem key=">=">大于等于 (&gt;=)</SelectItem>
              <SelectItem key="<=">小于等于 (&lt;=)</SelectItem>
              <SelectItem key="==">等于 (==)</SelectItem>
              <SelectItem key="!=">不等于 (!=)</SelectItem>
            </Select>
            <Input
              label="比较值"
              type="number"
              value={params.value?.toString() || '50'}
              onChange={(e) => updateParameter('value', parseFloat(e.target.value) || 50)}
            />
            <Select
              label="条件为真时"
              selectedKeys={[params.trueAction || 'continue']}
              onSelectionChange={(keys) => updateParameter('trueAction', Array.from(keys)[0])}
            >
              <SelectItem key="continue">继续执行</SelectItem>
              <SelectItem key="skip">跳过下一步</SelectItem>
              <SelectItem key="land">立即降落</SelectItem>
              <SelectItem key="return">返回起点</SelectItem>
            </Select>
            <Select
              label="条件为假时"
              selectedKeys={[params.falseAction || 'land']}
              onSelectionChange={(keys) => updateParameter('falseAction', Array.from(keys)[0])}
            >
              <SelectItem key="continue">继续执行</SelectItem>
              <SelectItem key="skip">跳过下一步</SelectItem>
              <SelectItem key="land">立即降落</SelectItem>
              <SelectItem key="return">返回起点</SelectItem>
            </Select>
          </div>
        );

      case 'loop':
        return (
          <div className="space-y-4">
            <Input
              label="循环次数"
              type="number"
              value={params.iterations?.toString() || '3'}
              onChange={(e) => updateParameter('iterations', parseInt(e.target.value) || 3)}
              description="设置循环执行的次数"
            />
            <Input
              label="最大循环次数"
              type="number"
              value={params.maxIterations?.toString() || '10'}
              onChange={(e) => updateParameter('maxIterations', parseInt(e.target.value) || 10)}
              description="防止无限循环的安全限制"
            />
            <Input
              label="跳出条件"
              value={params.breakCondition || ''}
              onChange={(e) => updateParameter('breakCondition', e.target.value)}
              placeholder="例如: battery < 20"
              description="满足条件时提前跳出循环"
            />
          </div>
        );

      // 图像处理节点
      case 'take_photo':
        return (
          <div className="space-y-4">
            <Select
              label="图像分辨率"
              selectedKeys={[params.resolution || 'high']}
              onSelectionChange={(keys) => updateParameter('resolution', Array.from(keys)[0])}
            >
              <SelectItem key="low">低分辨率 (480p)</SelectItem>
              <SelectItem key="medium">中分辨率 (720p)</SelectItem>
              <SelectItem key="high">高分辨率 (1080p)</SelectItem>
            </Select>
            <Input
              label="文件名格式"
              value={params.filename || 'photo_{timestamp}'}
              onChange={(e) => updateParameter('filename', e.target.value)}
              description="支持 {timestamp} 占位符"
            />
            <Select
              label="图像格式"
              selectedKeys={[params.format || 'jpg']}
              onSelectionChange={(keys) => updateParameter('format', Array.from(keys)[0])}
            >
              <SelectItem key="jpg">JPEG</SelectItem>
              <SelectItem key="png">PNG</SelectItem>
              <SelectItem key="bmp">BMP</SelectItem>
            </Select>
            <Switch
              isSelected={params.saveLocal || true}
              onValueChange={(value) => updateParameter('saveLocal', value)}
            >
              保存到本地
            </Switch>
          </div>
        );

      case 'ai_detection':
        return (
          <div className="space-y-4">
            <Select
              label="AI模型"
              selectedKeys={[params.model || 'yolo']}
              onSelectionChange={(keys) => updateParameter('model', Array.from(keys)[0])}
            >
              <SelectItem key="yolo">YOLO v8</SelectItem>
              <SelectItem key="rcnn">R-CNN</SelectItem>
              <SelectItem key="ssd">SSD MobileNet</SelectItem>
            </Select>
            <div className="space-y-2">
              <label className="text-sm font-medium">置信度阈值: {params.confidence || 0.7}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={params.confidence || 0.7}
                onChange={(e) => updateParameter('confidence', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1</span>
                <span>1.0</span>
              </div>
            </div>
            <Input
              label="最大检测数量"
              type="number"
              value={params.maxDetections?.toString() || '10'}
              onChange={(e) => updateParameter('maxDetections', parseInt(e.target.value) || 10)}
            />
          </div>
        );

      case 'http_request':
        return (
          <div className="space-y-4">
            <Input
              label="请求URL"
              value={params.url || ''}
              onChange={(e) => updateParameter('url', e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
            <Select
              label="请求方法"
              selectedKeys={[params.method || 'POST']}
              onSelectionChange={(keys) => updateParameter('method', Array.from(keys)[0])}
            >
              <SelectItem key="GET">GET</SelectItem>
              <SelectItem key="POST">POST</SelectItem>
              <SelectItem key="PUT">PUT</SelectItem>
              <SelectItem key="DELETE">DELETE</SelectItem>
            </Select>
            <Input
              label="超时时间 (秒)"
              type="number"
              value={params.timeout?.toString() || '30'}
              onChange={(e) => updateParameter('timeout', parseInt(e.target.value) || 30)}
            />
          </div>
        );

      // PureChat AI 节点
      case 'purechat_chat':
        return (
          <div className="space-y-4">
            <AssistantSelector
              value={params.assistantId || ''}
              onChange={(assistantId) => updateParameter('assistantId', assistantId)}
              isRequired={true}
            />
            <Textarea
              label="提示词"
              value={params.prompt || ''}
              onChange={(e) => updateParameter('prompt', e.target.value)}
              placeholder="输入发送给AI的提示词..."
              description="描述你想让AI做什么"
              minRows={3}
              maxRows={6}
              isRequired={true}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">温度参数: {params.temperature || 0.7}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={params.temperature || 0.7}
                onChange={(e) => updateParameter('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 (精确)</span>
                <span>2 (创造性)</span>
              </div>
              <p className="text-xs text-gray-500">控制AI响应的随机性和创造性</p>
            </div>
            <Input
              label="最大Token数"
              type="number"
              value={params.maxTokens?.toString() || '1000'}
              onChange={(e) => updateParameter('maxTokens', parseInt(e.target.value) || 1000)}
              description="生成文本的最大长度 (100-4000)"
              min={100}
              max={4000}
            />
            <Input
              label="输出变量名"
              value={params.outputVariable || 'ai_response'}
              onChange={(e) => updateParameter('outputVariable', e.target.value)}
              description="存储AI响应的变量名"
              placeholder="ai_response"
              isRequired={true}
            />
          </div>
        );

      case 'purechat_image_analysis':
        return (
          <div className="space-y-4">
            <AssistantSelector
              value={params.assistantId || ''}
              onChange={(assistantId) => updateParameter('assistantId', assistantId)}
              isRequired={true}
            />
            <Select
              label="图像来源"
              selectedKeys={[params.imageSource || 'camera']}
              onSelectionChange={(keys) => updateParameter('imageSource', Array.from(keys)[0])}
              description="选择图像数据的来源"
            >
              <SelectItem key="camera">无人机摄像头</SelectItem>
              <SelectItem key="upload">上传图片</SelectItem>
              <SelectItem key="variable">变量引用</SelectItem>
            </Select>
            <Textarea
              label="分析提示"
              value={params.prompt || '请分析这张图片'}
              onChange={(e) => updateParameter('prompt', e.target.value)}
              placeholder="描述你想让AI分析什么..."
              description="告诉AI你想从图像中了解什么"
              minRows={3}
              maxRows={6}
              isRequired={true}
            />
            <Input
              label="输出变量名"
              value={params.outputVariable || 'image_analysis'}
              onChange={(e) => updateParameter('outputVariable', e.target.value)}
              description="存储分析结果的变量名"
              placeholder="image_analysis"
              isRequired={true}
            />
          </div>
        );

      case 'unipixel_segmentation':
        return (
          <div className="space-y-4">
            <Select
              label="图像来源"
              selectedKeys={[params.imageSource || 'camera']}
              onSelectionChange={(keys) => updateParameter('imageSource', Array.from(keys)[0])}
              description="选择图像数据的来源"
            >
              <SelectItem key="camera">无人机摄像头</SelectItem>
              <SelectItem key="upload">上传图片</SelectItem>
              <SelectItem key="variable">变量引用</SelectItem>
            </Select>
            <Textarea
              label="分割查询"
              value={params.query || ''}
              onChange={(e) => updateParameter('query', e.target.value)}
              placeholder="例如: 草莓, 成熟的水果, 叶子..."
              description="描述要分割的对象"
              minRows={2}
              maxRows={4}
              isRequired={true}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">置信度阈值: {params.confidence || 0.7}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={params.confidence || 0.7}
                onChange={(e) => updateParameter('confidence', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1 (宽松)</span>
                <span>1.0 (严格)</span>
              </div>
            </div>
            <Input
              label="采样帧数"
              type="number"
              value={params.sampleFrames?.toString() || '1'}
              onChange={(e) => updateParameter('sampleFrames', parseInt(e.target.value) || 1)}
              description="采样的视频帧数 (1-10)"
              min={1}
              max={10}
            />
            <Switch
              isSelected={params.visualize !== false}
              onValueChange={(value) => updateParameter('visualize', value)}
            >
              可视化分割结果
            </Switch>
            <Input
              label="输出变量名"
              value={params.outputVariable || 'segmentation_result'}
              onChange={(e) => updateParameter('outputVariable', e.target.value)}
              description="存储分割结果的变量名"
              placeholder="segmentation_result"
              isRequired={true}
            />
          </div>
        );

      case 'yolo_detection':
        return (
          <div className="space-y-4">
            <Select
              label="模型来源"
              selectedKeys={[params.modelSource || 'builtin']}
              onSelectionChange={(keys) => updateParameter('modelSource', Array.from(keys)[0])}
              description="选择YOLO模型来源"
            >
              <SelectItem key="builtin">内置模型</SelectItem>
              <SelectItem key="upload">上传模型</SelectItem>
              <SelectItem key="url">URL加载</SelectItem>
            </Select>
            
            {(params.modelSource === 'upload' || params.modelSource === 'url') && (
              <Input
                label={params.modelSource === 'url' ? '模型URL' : '模型路径'}
                value={params.modelPath || ''}
                onChange={(e) => updateParameter('modelPath', e.target.value)}
                placeholder={params.modelSource === 'url' ? 'https://example.com/model.pt' : '/path/to/model.pt'}
                description={params.modelSource === 'url' ? '输入模型文件的URL' : '输入模型文件的路径'}
                isRequired={true}
              />
            )}
            
            <Select
              label="图像来源"
              selectedKeys={[params.imageSource || 'camera']}
              onSelectionChange={(keys) => updateParameter('imageSource', Array.from(keys)[0])}
              description="选择图像数据的来源"
            >
              <SelectItem key="camera">无人机摄像头</SelectItem>
              <SelectItem key="upload">上传图片</SelectItem>
              <SelectItem key="variable">变量引用</SelectItem>
            </Select>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">置信度阈值: {params.confidence || 0.5}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={params.confidence || 0.5}
                onChange={(e) => updateParameter('confidence', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1 (宽松)</span>
                <span>1.0 (严格)</span>
              </div>
              <p className="text-xs text-gray-500">检测结果的最小置信度</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">IOU阈值: {params.iouThreshold || 0.45}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={params.iouThreshold || 0.45}
                onChange={(e) => updateParameter('iouThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1</span>
                <span>1.0</span>
              </div>
              <p className="text-xs text-gray-500">非极大值抑制(NMS)的IOU阈值</p>
            </div>
            
            <Input
              label="检测类别"
              value={params.classes || ''}
              onChange={(e) => updateParameter('classes', e.target.value)}
              placeholder="例如: person,car,dog (留空检测全部)"
              description="要检测的类别，用逗号分隔，留空检测全部类别"
            />
            
            <Switch
              isSelected={params.drawResults !== false}
              onValueChange={(value) => updateParameter('drawResults', value)}
            >
              绘制检测结果
            </Switch>
            
            <Input
              label="输出变量名"
              value={params.outputVariable || 'yolo_detections'}
              onChange={(e) => updateParameter('outputVariable', e.target.value)}
              description="存储检测结果的变量名"
              placeholder="yolo_detections"
              isRequired={true}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <Input
              label="节点名称"
              value={params.customName || config.label}
              onChange={(e) => updateParameter('customName', e.target.value)}
            />
            <Input
              label="描述"
              value={params.description || ''}
              onChange={(e) => updateParameter('description', e.target.value)}
              placeholder="添加节点描述..."
            />
          </div>
        );
    }
  };

  if (!config) return null;

  const modalStyle = useMemo(() => {
    const currentTheme = (theme || resolvedTheme) as 'light' | 'dark' | undefined;
    return getModalPanelStyle(currentTheme === 'light' ? 'light' : 'dark');
  }, [theme, resolvedTheme]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
    >
      <ModalContent style={modalStyle}>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">配置节点: {config.label}</h3>
          <p className="text-sm text-gray-500">设置节点的执行参数</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="节点标签"
              value={config.label}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              description="在工作流中显示的节点名称"
            />
            {renderParameterInputs()}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSave}>
            保存配置
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NodeConfigModal;