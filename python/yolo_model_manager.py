#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YOLO Model Manager
管理YOLO模型的上传、验证、存储和加载
"""

import os
import json
import hashlib
import shutil
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import requests


class YOLOModelManager:
    """YOLO模型管理器"""
    
    def __init__(self, models_dir: str = None):
        """
        初始化模型管理器
        
        Args:
            models_dir: 模型存储目录，默认为 ./models/yolo
        """
        if models_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            models_dir = os.path.join(current_dir, 'models', 'yolo')
        
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # 模型元数据文件
        self.metadata_file = self.models_dir / 'models_metadata.json'
        self.metadata = self._load_metadata()
        
        # 内置模型配置
        self.builtin_models = {
            'yolov8n': {
                'name': 'YOLOv8 Nano',
                'description': '轻量级模型，速度快',
                'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt',
                'size': '6.2 MB',
                'classes': 80  # COCO数据集类别数
            },
            'yolov8s': {
                'name': 'YOLOv8 Small',
                'description': '小型模型，平衡速度和精度',
                'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8s.pt',
                'size': '22 MB',
                'classes': 80
            },
            'yolov8m': {
                'name': 'YOLOv8 Medium',
                'description': '中型模型，较高精度',
                'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt',
                'size': '52 MB',
                'classes': 80
            }
        }
        
        print(f"✅ YOLO模型管理器初始化成功，模型目录: {self.models_dir}")
    
    def _load_metadata(self) -> Dict:
        """加载模型元数据"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ 加载模型元数据失败: {e}")
                return {}
        return {}
    
    def _save_metadata(self):
        """保存模型元数据"""
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"❌ 保存模型元数据失败: {e}")
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """计算文件的MD5哈希值"""
        md5_hash = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5_hash.update(chunk)
        return md5_hash.hexdigest()
    
    def validate_model_file(self, file_path: str) -> Tuple[bool, str]:
        """
        验证模型文件是否有效
        
        Args:
            file_path: 模型文件路径
            
        Returns:
            (是否有效, 错误信息)
        """
        file_path = Path(file_path)
        
        # 检查文件是否存在
        if not file_path.exists():
            return False, "模型文件不存在"
        
        # 检查文件扩展名
        if file_path.suffix.lower() not in ['.pt', '.pth', '.onnx']:
            return False, "不支持的模型格式，仅支持 .pt, .pth, .onnx"
        
        # 检查文件大小（不能为空，不能超过500MB）
        file_size = file_path.stat().st_size
        if file_size == 0:
            return False, "模型文件为空"
        if file_size > 500 * 1024 * 1024:  # 500MB
            return False, "模型文件过大（超过500MB）"
        
        # 尝试加载模型验证其有效性
        try:
            from ultralytics import YOLO
            model = YOLO(str(file_path))
            # 验证模型是否有类别信息
            if not hasattr(model, 'names') or not model.names:
                return False, "模型缺少类别信息"
            return True, ""
        except Exception as e:
            return False, f"模型加载失败: {str(e)}"
    
    def upload_model(
        self, 
        source_path: str, 
        model_name: str,
        description: str = "",
        tags: List[str] = None
    ) -> Tuple[bool, str, Optional[str]]:
        """
        上传并注册模型
        
        Args:
            source_path: 源模型文件路径
            model_name: 模型名称
            description: 模型描述
            tags: 模型标签
            
        Returns:
            (是否成功, 消息, 模型ID)
        """
        # 验证模型文件
        is_valid, error_msg = self.validate_model_file(source_path)
        if not is_valid:
            return False, error_msg, None
        
        source_path = Path(source_path)
        
        # 生成模型ID（使用文件哈希）
        file_hash = self._calculate_file_hash(source_path)
        model_id = f"custom_{file_hash[:12]}"
        
        # 检查模型是否已存在
        if model_id in self.metadata:
            return False, "该模型已存在", model_id
        
        # 复制模型文件到模型目录
        dest_path = self.models_dir / f"{model_id}{source_path.suffix}"
        try:
            shutil.copy2(source_path, dest_path)
        except Exception as e:
            return False, f"复制模型文件失败: {e}", None
        
        # 获取模型信息
        try:
            from ultralytics import YOLO
            model = YOLO(str(dest_path))
            num_classes = len(model.names)
            class_names = list(model.names.values())
        except Exception as e:
            # 清理已复制的文件
            dest_path.unlink(missing_ok=True)
            return False, f"读取模型信息失败: {e}", None
        
        # 保存元数据
        self.metadata[model_id] = {
            'name': model_name,
            'description': description,
            'tags': tags or [],
            'file_path': str(dest_path),
            'file_size': dest_path.stat().st_size,
            'file_hash': file_hash,
            'num_classes': num_classes,
            'class_names': class_names,
            'format': source_path.suffix.lower(),
            'uploaded_at': str(Path(dest_path).stat().st_mtime),
            'type': 'custom'
        }
        
        self._save_metadata()
        
        return True, f"模型 '{model_name}' 上传成功", model_id
    
    def download_builtin_model(self, model_key: str) -> Tuple[bool, str, Optional[str]]:
        """
        下载内置模型
        
        Args:
            model_key: 内置模型键名（如 'yolov8n'）
            
        Returns:
            (是否成功, 消息, 模型路径)
        """
        if model_key not in self.builtin_models:
            return False, f"未知的内置模型: {model_key}", None
        
        model_info = self.builtin_models[model_key]
        model_path = self.models_dir / f"{model_key}.pt"
        
        # 如果模型已存在，直接返回
        if model_path.exists():
            return True, f"模型 '{model_info['name']}' 已存在", str(model_path)
        
        # 下载模型
        try:
            print(f"📥 正在下载 {model_info['name']}...")
            response = requests.get(model_info['url'], stream=True, timeout=300)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(model_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            progress = (downloaded / total_size) * 100
                            print(f"\r下载进度: {progress:.1f}%", end='')
            
            print(f"\n✅ 模型下载完成: {model_path}")
            
            # 验证下载的模型
            is_valid, error_msg = self.validate_model_file(str(model_path))
            if not is_valid:
                model_path.unlink(missing_ok=True)
                return False, f"下载的模型无效: {error_msg}", None
            
            # 保存元数据
            self.metadata[model_key] = {
                'name': model_info['name'],
                'description': model_info['description'],
                'tags': ['builtin', 'yolov8'],
                'file_path': str(model_path),
                'file_size': model_path.stat().st_size,
                'num_classes': model_info['classes'],
                'format': '.pt',
                'type': 'builtin',
                'source_url': model_info['url']
            }
            self._save_metadata()
            
            return True, f"模型 '{model_info['name']}' 下载成功", str(model_path)
            
        except requests.exceptions.RequestException as e:
            if model_path.exists():
                model_path.unlink(missing_ok=True)
            return False, f"下载失败: {e}", None
        except Exception as e:
            if model_path.exists():
                model_path.unlink(missing_ok=True)
            return False, f"下载过程出错: {e}", None
    
    def get_model_path(self, model_id: str) -> Optional[str]:
        """
        获取模型文件路径
        
        Args:
            model_id: 模型ID或内置模型键名
            
        Returns:
            模型文件路径，如果不存在返回None
        """
        # 检查是否为内置模型
        if model_id in self.builtin_models:
            model_path = self.models_dir / f"{model_id}.pt"
            if model_path.exists():
                return str(model_path)
            # 如果内置模型不存在，尝试下载
            success, msg, path = self.download_builtin_model(model_id)
            return path if success else None
        
        # 检查自定义模型
        if model_id in self.metadata:
            model_path = Path(self.metadata[model_id]['file_path'])
            if model_path.exists():
                return str(model_path)
        
        return None
    
    def list_models(self, include_builtin: bool = True) -> List[Dict]:
        """
        列出所有可用模型
        
        Args:
            include_builtin: 是否包含内置模型
            
        Returns:
            模型信息列表
        """
        models = []
        
        # 添加已下载的模型
        for model_id, info in self.metadata.items():
            model_path = Path(info['file_path'])
            if model_path.exists():
                models.append({
                    'id': model_id,
                    'name': info['name'],
                    'description': info.get('description', ''),
                    'type': info.get('type', 'custom'),
                    'tags': info.get('tags', []),
                    'num_classes': info.get('num_classes', 0),
                    'file_size': info.get('file_size', 0),
                    'format': info.get('format', '.pt'),
                    'downloaded': True
                })
        
        # 添加未下载的内置模型
        if include_builtin:
            for model_key, info in self.builtin_models.items():
                if model_key not in self.metadata:
                    models.append({
                        'id': model_key,
                        'name': info['name'],
                        'description': info['description'],
                        'type': 'builtin',
                        'tags': ['builtin', 'yolov8'],
                        'num_classes': info['classes'],
                        'file_size': info['size'],
                        'format': '.pt',
                        'downloaded': False
                    })
        
        return models
    
    def delete_model(self, model_id: str) -> Tuple[bool, str]:
        """
        删除模型
        
        Args:
            model_id: 模型ID
            
        Returns:
            (是否成功, 消息)
        """
        # 不允许删除内置模型的元数据，但可以删除文件
        if model_id in self.builtin_models:
            model_path = self.models_dir / f"{model_id}.pt"
            if model_path.exists():
                try:
                    model_path.unlink()
                    if model_id in self.metadata:
                        del self.metadata[model_id]
                        self._save_metadata()
                    return True, f"内置模型 '{model_id}' 文件已删除"
                except Exception as e:
                    return False, f"删除失败: {e}"
            return False, "模型文件不存在"
        
        # 删除自定义模型
        if model_id not in self.metadata:
            return False, "模型不存在"
        
        model_info = self.metadata[model_id]
        model_path = Path(model_info['file_path'])
        
        try:
            if model_path.exists():
                model_path.unlink()
            del self.metadata[model_id]
            self._save_metadata()
            return True, f"模型 '{model_info['name']}' 已删除"
        except Exception as e:
            return False, f"删除失败: {e}"
    
    def get_model_info(self, model_id: str) -> Optional[Dict]:
        """
        获取模型详细信息
        
        Args:
            model_id: 模型ID
            
        Returns:
            模型信息字典，如果不存在返回None
        """
        if model_id in self.metadata:
            return self.metadata[model_id].copy()
        
        if model_id in self.builtin_models:
            info = self.builtin_models[model_id].copy()
            model_path = self.models_dir / f"{model_id}.pt"
            info['downloaded'] = model_path.exists()
            info['id'] = model_id
            info['type'] = 'builtin'
            return info
        
        return None


# 测试代码
if __name__ == '__main__':
    manager = YOLOModelManager()
    
    print("\n📋 可用模型列表:")
    models = manager.list_models()
    for model in models:
        status = "✅ 已下载" if model['downloaded'] else "📥 未下载"
        print(f"  {status} {model['name']} ({model['id']}) - {model['description']}")
    
    print("\n测试完成！")
