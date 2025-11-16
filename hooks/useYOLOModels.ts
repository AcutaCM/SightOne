/**
 * YOLO模型管理Hook
 * 提供模型操作的React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface YOLOModel {
  id: string;
  name: string;
  type: string;
  path: string;
  classes: string[];
  loaded_at: string;
  is_default: boolean;
  is_active: boolean;
}

export function useYOLOModels() {
  const [models, setModels] = useState<YOLOModel[]>([]);
  const [activeModel, setActiveModel] = useState<YOLOModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载模型列表
  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/models/hot-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.models) {
        setModels(result.data.models);
        
        // 找到当前活动模型
        const active = result.data.models.find((m: YOLOModel) => m.is_active);
        setActiveModel(active || null);
      } else {
        throw new Error(result.error || '加载模型列表失败');
      }
    } catch (err: any) {
      const errorMsg = err.message || '加载模型列表失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 切换模型
  const switchModel = useCallback(async (modelId: string) => {
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
        await loadModels(); // 重新加载列表
        return true;
      } else {
        throw new Error(result.error || '模型切换失败');
      }
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }, [loadModels]);

  // 删除模型
  const deleteModel = useCallback(async (modelId: string) => {
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
        await loadModels(); // 重新加载列表
        return true;
      } else {
        throw new Error(result.error || '模型删除失败');
      }
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  }, [loadModels]);

  // 上传模型
  const uploadModel = useCallback(async (
    modelPath: string,
    modelName: string,
    modelType: string = 'custom'
  ) => {
    try {
      const response = await fetch('/api/models/hot-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          model_path: modelPath,
          model_name: modelName,
          model_type: modelType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.data.message || '模型上传成功');
        await loadModels(); // 重新加载列表
        return { success: true, modelId: result.data.model_id };
      } else {
        throw new Error(result.error || '模型上传失败');
      }
    } catch (err: any) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [loadModels]);

  // 初始加载
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    models,
    activeModel,
    loading,
    error,
    loadModels,
    switchModel,
    deleteModel,
    uploadModel
  };
}










