# useDroneControl Hook - 诊断集成指南

本文档说明如何修改 `useDroneControl` hook 以集成AI诊断功能。

## 需要添加的功能

### 1. 新增状态

在 hook 中添加诊断相关的状态：

```typescript
// 诊断报告状态
interface DiagnosisReport {
  id: string;
  plant_id: number;
  timestamp: string;
  original_image: string;
  mask_image: string | null;
  mask_prompt: string | null;
  markdown_report: string;
  summary: string;
  severity: 'low' | 'medium' | 'high';
  diseases: string[];
  recommendations: string[];
  ai_model: string;
  confidence: number;
  processing_time: number;
}

// 诊断进度状态
interface DiagnosisProgress {
  plant_id: number;
  stage: string;
  message: string;
  progress: number;
}

// 添加到 hook 状态
const [diagnosisReports, setDiagnosisReports] = useState<DiagnosisReport[]>([]);
const [currentDiagnosisProgress, setCurrentDiagnosisProgress] = useState<DiagnosisProgress | null>(null);
const [diagnosisErrors, setDiagnosisErrors] = useState<Record<number, string>>({});
```

---

### 2. 添加消息处理

在 `ws.onmessage` 的 switch 语句中添加以下 case：

```typescript
// 在 ws.onmessage 的 switch 语句中添加

case 'diagnosis_started':
  if (data.data) {
    const { plant_id, diagnosis_id, cooldown_seconds } = data.data;
    addLog('info', `🔍 开始诊断植株 ${plant_id}`);
    setCurrentDiagnosisProgress({
      plant_id,
      stage: 'started',
      message: '诊断已开始',
      progress: 0
    });
  }
  break;

case 'diagnosis_progress':
  if (data.data) {
    const { plant_id, stage, message, progress } = data.data;
    setCurrentDiagnosisProgress({
      plant_id,
      stage,
      message,
      progress
    });
    
    // 根据阶段显示不同的日志
    if (progress === 33) {
      addLog('info', `🤖 ${message}`);
    } else if (progress === 66) {
      addLog('info', `🎨 ${message}`);
    } else if (progress === 100) {
      addLog('success', `✅ ${message}`);
    }
  }
  break;

case 'diagnosis_complete':
  if (data.data && data.data.report) {
    const report: DiagnosisReport = data.data.report;
    
    // 添加到报告列表
    setDiagnosisReports(prev => [report, ...prev].slice(0, 50)); // 保留最近50个
    
    // 清除进度
    setCurrentDiagnosisProgress(null);
    
    // 显示成功通知
    addLog('success', `✅ 植株 ${report.plant_id} 诊断完成 (严重程度: ${report.severity})`);
    
    // 可选：显示Toast通知
    toast.success(`植株 ${report.plant_id} 诊断完成`, {
      duration: 3000
    });
  }
  break;

case 'diagnosis_cooldown':
  if (data.data) {
    const { plant_id, remaining_seconds, message } = data.data;
    addLog('warning', `⏳ ${message}`);
    
    // 可选：显示Toast通知
    toast(`植株 ${plant_id} 在冷却期 (${remaining_seconds}秒)`, {
      icon: '⏳',
      duration: 2000
    });
  }
  break;

case 'diagnosis_config_error':
  if (data.data) {
    const { plant_id, error_type, message } = data.data;
    addLog('error', `❌ ${message}`);
    
    // 记录错误
    setDiagnosisErrors(prev => ({
      ...prev,
      [plant_id]: message
    }));
    
    // 显示Toast通知
    toast.error(message, {
      duration: 5000
    });
  }
  break;

case 'diagnosis_error':
  if (data.data) {
    const { plant_id, error_type, message } = data.data;
    addLog('error', `❌ 诊断失败: ${message}`);
    
    // 清除进度
    setCurrentDiagnosisProgress(null);
    
    // 记录错误
    if (plant_id) {
      setDiagnosisErrors(prev => ({
        ...prev,
        [plant_id]: message
      }));
    }
    
    // 显示Toast通知
    toast.error(`诊断失败: ${message}`, {
      duration: 5000
    });
  }
  break;

case 'ai_config_updated':
  if (data.data) {
    const { provider, model, message } = data.data;
    addLog('success', `✅ ${message}`);
    
    // 显示Toast通知
    toast.success(`AI配置已更新: ${provider}/${model}`, {
      duration: 3000
    });
  }
  break;

case 'ai_config_status':
  // 这个消息由 useAIDiagnosisConfig hook 处理
  // 可以在这里添加日志
  if (data.data) {
    console.log('AI配置状态:', data.data);
  }
  break;
```

---

### 3. 添加辅助函数

在 hook 中添加发送AI配置的函数：

```typescript
/**
 * 发送AI配置到后端
 */
const sendAIConfig = useCallback((config: {
  provider: string;
  model: string;
  api_key: string;
  api_base?: string;
  max_tokens?: number;
  temperature?: number;
}) => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'set_ai_config',
      data: config
    }));
    addLog('info', `发送AI配置: ${config.provider}/${config.model}`);
  } else {
    addLog('error', 'WebSocket未连接，无法发送AI配置');
  }
}, [addLog]);

/**
 * 查询AI配置状态
 */
const queryAIConfigStatus = useCallback(() => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'get_ai_config_status',
      data: {}
    }));
  }
}, []);

/**
 * 清除诊断错误
 */
const clearDiagnosisError = useCallback((plantId: number) => {
  setDiagnosisErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[plantId];
    return newErrors;
  });
}, []);

/**
 * 清除所有诊断报告
 */
const clearDiagnosisReports = useCallback(() => {
  setDiagnosisReports([]);
  addLog('info', '已清除所有诊断报告');
}, [addLog]);
```

---

### 4. 更新返回值

在 hook 的返回对象中添加诊断相关的状态和方法：

```typescript
return {
  // ... 现有的返回值 ...
  
  // 诊断相关
  diagnosisReports,
  currentDiagnosisProgress,
  diagnosisErrors,
  sendAIConfig,
  queryAIConfigStatus,
  clearDiagnosisError,
  clearDiagnosisReports,
};
```

---

### 5. 连接时自动发送AI配置

在 WebSocket 连接成功后，自动发送AI配置：

```typescript
ws.onopen = () => {
  wsRef.current = ws;
  addLog('info', 'WebSocket连接成功，发送无人机连接命令...');
  ws.send(JSON.stringify({ type: 'drone_connect' }));
  setIsConnecting(false);
  setIsReconnecting(false);
  setReconnectAttempts(0);
  
  // 自动发送AI配置（如果已配置）
  // 这部分逻辑可以在组件中使用 useAIDiagnosisConfig hook 处理
};
```

---

## 使用示例

### 在组件中使用

```typescript
import { useDroneControl } from '@/hooks/useDroneControl';
import { useAIDiagnosisConfig } from '@/hooks/useAIDiagnosisConfig';

function DroneControlPanel() {
  const {
    droneStatus,
    diagnosisReports,
    currentDiagnosisProgress,
    diagnosisErrors,
    sendAIConfig,
    queryAIConfigStatus,
    clearDiagnosisReports,
    // ... 其他方法
  } = useDroneControl();
  
  const {
    config,
    isConfigured,
    sendConfigToBackend,
  } = useAIDiagnosisConfig();
  
  // 连接时发送AI配置
  useEffect(() => {
    if (droneStatus.connected && isConfigured) {
      sendConfigToBackend((type, data) => {
        sendAIConfig(data);
      });
    }
  }, [droneStatus.connected, isConfigured]);
  
  return (
    <div>
      {/* 显示诊断进度 */}
      {currentDiagnosisProgress && (
        <div className="diagnosis-progress">
          <div>植株 {currentDiagnosisProgress.plant_id}</div>
          <div>{currentDiagnosisProgress.message}</div>
          <div>进度: {currentDiagnosisProgress.progress}%</div>
        </div>
      )}
      
      {/* 显示诊断报告列表 */}
      <div className="diagnosis-reports">
        {diagnosisReports.map(report => (
          <div key={report.id}>
            <h3>植株 {report.plant_id}</h3>
            <p>{report.summary}</p>
            <span>严重程度: {report.severity}</span>
          </div>
        ))}
      </div>
      
      {/* 显示错误 */}
      {Object.entries(diagnosisErrors).map(([plantId, error]) => (
        <div key={plantId} className="error">
          植株 {plantId}: {error}
        </div>
      ))}
    </div>
  );
}
```

---

## 完整的消息流程

```
1. 组件加载
   ↓
2. useAIDiagnosisConfig 读取 localStorage
   ↓
3. WebSocket 连接成功
   ↓
4. 发送 AI 配置 (set_ai_config)
   ↓
5. 收到 ai_config_updated
   ↓
6. QR 检测到植株
   ↓
7. 收到 diagnosis_started
   ↓
8. 收到多次 diagnosis_progress (10% → 33% → 66% → 100%)
   ↓
9. 收到 diagnosis_complete (包含完整报告)
   ↓
10. 显示报告给用户
```

---

## 注意事项

1. **WebSocket 连接状态**: 确保在发送消息前检查 WebSocket 连接状态
2. **错误处理**: 所有诊断错误都应该显示给用户
3. **进度显示**: 使用进度条或加载动画显示诊断进度
4. **报告存储**: 限制存储的报告数量（建议50个）
5. **Toast 通知**: 使用 react-hot-toast 显示重要通知

---

## 测试清单

- [ ] WebSocket 连接成功后自动发送 AI 配置
- [ ] 收到 diagnosis_started 消息时显示进度
- [ ] 收到 diagnosis_progress 消息时更新进度
- [ ] 收到 diagnosis_complete 消息时显示报告
- [ ] 收到 diagnosis_error 消息时显示错误
- [ ] 收到 diagnosis_cooldown 消息时显示冷却提示
- [ ] 收到 diagnosis_config_error 消息时显示配置错误
- [ ] 可以清除诊断报告
- [ ] 可以查询 AI 配置状态

---

**文档版本**: 1.0.0  
**创建日期**: 2025-10-11  
**状态**: ✅ 完成
