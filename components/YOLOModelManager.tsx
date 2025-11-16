'use client';

/**
 * YOLO模型管理器组件
 * 提供模型热插拔的可视化界面
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import toast from 'react-hot-toast';

interface YOLOModel {
  id: string;
  name: string;
  type: string;
  path: string;
  classes: string[];
  loaded_at: string;
  is_default: boolean;
  is_active: boolean;
}

export default function YOLOModelManager() {
  const [models, setModels] = useState<YOLOModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // 上传表单状态
  const [uploadForm, setUploadForm] = useState({
    model_path: '',
    model_name: '',
    model_type: 'custom'
  });

  // 加载模型列表
  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/models/hot-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.models) {
        setModels(result.data.models);
      } else {
        toast.error('加载模型列表失败');
      }
    } catch (error) {
      console.error('加载模型列表错误:', error);
      toast.error('加载模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换模型
  const switchModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/models/hot-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'switch',
          model_id: modelId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.data.message || '模型切换成功');
        loadModels(); // 重新加载列表
      } else {
        toast.error(result.error || '模型切换失败');
      }
    } catch (error) {
      console.error('切换模型错误:', error);
      toast.error('模型切换失败');
    }
  };

  // 删除模型
  const deleteModel = async (modelId: string, modelName: string) => {
    if (!confirm(`确定要删除模型 "${modelName}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch('/api/models/hot-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          model_id: modelId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.data.message || '模型删除成功');
        loadModels(); // 重新加载列表
      } else {
        toast.error(result.error || '模型删除失败');
      }
    } catch (error) {
      console.error('删除模型错误:', error);
      toast.error('模型删除失败');
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件扩展名
      if (!file.name.endsWith('.pt')) {
        toast.error('请选择 .pt 格式的模型文件');
        return;
      }
      
      setSelectedFile(file);
      // 自动填充模型名称（去掉.pt后缀）
      if (!uploadForm.model_name) {
        const nameWithoutExt = file.name.replace('.pt', '');
        setUploadForm({ ...uploadForm, model_name: nameWithoutExt });
      }
      
      toast.success(`已选择文件: ${file.name}`);
    }
  };

  // 上传模型
  const uploadModel = async () => {
    if (!selectedFile || !uploadForm.model_name) {
      toast.error('请选择模型文件并填写模型名称');
      return;
    }

    setUploading(true);
    try {
      // 创建 FormData 对象上传文件
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model_name', uploadForm.model_name);
      formData.append('model_type', uploadForm.model_type);

      const response = await fetch('/api/models/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || '模型上传成功');
        setIsUploadModalOpen(false);
        setUploadForm({ model_path: '', model_name: '', model_type: 'custom' });
        setSelectedFile(null);
        loadModels(); // 重新加载列表
      } else {
        toast.error(result.error || '模型上传失败');
      }
    } catch (error) {
      console.error('上传模型错误:', error);
      toast.error('模型上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 组件挂载时加载模型
  useEffect(() => {
    loadModels();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">YOLO模型管理</h3>
          <p className="text-sm text-gray-500">模型热插拔 · 实时切换</p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            size="sm"
            onPress={() => setIsUploadModalOpen(true)}
          >
            + 上传模型
          </Button>
          <Button
            variant="bordered"
            size="sm"
            onPress={loadModels}
            isLoading={loading}
          >
            刷新
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {models.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无模型，请上传YOLO模型
          </div>
        ) : (
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  model.is_active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{model.name}</h4>
                      {model.is_active && (
                        <Badge color="success" variant="flat">
                          当前使用
                        </Badge>
                      )}
                      {model.is_default && (
                        <Badge color="primary" variant="flat">
                          默认
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Chip size="sm" variant="flat">
                        {model.type === 'strawberry' ? '草莓检测' : 
                         model.type === 'custom' ? '自定义' : model.type}
                      </Chip>
                      <Chip size="sm" variant="flat" color="default">
                        {model.classes.length} 个类别
                      </Chip>
                    </div>
                    <p className="text-xs text-gray-500">
                      路径: {model.path}
                    </p>
                    <p className="text-xs text-gray-500">
                      加载时间: {new Date(model.loaded_at).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!model.is_active && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => switchModel(model.id)}
                      >
                        切换
                      </Button>
                    )}
                    {!model.is_default && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => deleteModel(model.id, model.name)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                </div>

                {model.classes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">检测类别:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.classes.map((cls, idx) => (
                        <Chip key={idx} size="sm" variant="bordered">
                          {cls}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {/* 上传模型弹窗 */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setUploadForm({ model_path: '', model_name: '', model_type: 'custom' });
        }}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>上传YOLO模型</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* 文件选择器 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">选择模型文件</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pt"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="model-file-input"
                    aria-label="选择YOLO模型文件"
                  />
                  <Button
                    color="primary"
                    variant="bordered"
                    onPress={() => document.getElementById('model-file-input')?.click()}
                    className="flex-1"
                  >
                    📁 选择 .pt 文件
                  </Button>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      ✓ 已选择: {selectedFile.name}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="模型名称"
                placeholder="例如: 我的草莓检测模型"
                value={uploadForm.model_name}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, model_name: e.target.value })
                }
                description="模型名称将用于识别和管理"
              />

              <Select
                label="模型类型"
                selectedKeys={[uploadForm.model_type]}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, model_type: e.target.value })
                }
              >
                <SelectItem key="custom" value="custom">
                  自定义模型
                </SelectItem>
                <SelectItem key="strawberry" value="strawberry">
                  草莓检测
                </SelectItem>
                <SelectItem key="object_detection" value="object_detection">
                  通用目标检测
                </SelectItem>
              </Select>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>提示:</strong> 模型文件会被上传到服务器并保存在系统模型目录中
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
                setUploadForm({ model_path: '', model_name: '', model_type: 'custom' });
              }}
              isDisabled={uploading}
            >
              取消
            </Button>
            <Button 
              color="primary" 
              onPress={uploadModel}
              isLoading={uploading}
              isDisabled={!selectedFile || !uploadForm.model_name}
            >
              {uploading ? '上传中...' : '上传'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}

                    </span>
                  </div>
                )}
              </div>

              <Input
                label="模型名称"
                placeholder="例如: 我的草莓检测模型"
                value={uploadForm.model_name}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, model_name: e.target.value })
                }
                description="模型名称将用于识别和管理"
              />

              <Select
                label="模型类型"
                selectedKeys={[uploadForm.model_type]}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, model_type: e.target.value })
                }
              >
                <SelectItem key="custom" value="custom">
                  自定义模型
                </SelectItem>
                <SelectItem key="strawberry" value="strawberry">
                  草莓检测
                </SelectItem>
                <SelectItem key="object_detection" value="object_detection">
                  通用目标检测
                </SelectItem>
              </Select>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>提示:</strong> 模型文件会被上传到服务器并保存在系统模型目录中
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
                setUploadForm({ model_path: '', model_name: '', model_type: 'custom' });
              }}
              isDisabled={uploading}
            >
              取消
            </Button>
            <Button 
              color="primary" 
              onPress={uploadModel}
              isLoading={uploading}
              isDisabled={!selectedFile || !uploadForm.model_name}
            >
              {uploading ? '上传中...' : '上传'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}

