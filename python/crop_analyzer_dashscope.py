# Shim module to expose CropAnalyzer from backup package for relative imports
try:
    from .backup_before_cleanup_20251009_142123.crop_analyzer_dashscope import CropAnalyzer
except Exception as e:
    CropAnalyzer = None
    print(f"✗ 加载 CropAnalyzer 失败: {e}")