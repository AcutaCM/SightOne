# 控制面板集成示例

## 完整集成示例

这是一个完整的工作流编辑器页面示例，展示如何集成控制面板。

```typescript
// app/workflow/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import WorkflowEditorLayout from '@/components/workflow/WorkflowEditorLayout';
import CollapsibleNodeLibrary from '@/components/workflow/CollapsibleNodeLibrary';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';
import type { LogEntry, ResultEntry } from '@/components/workflow/OutputTabs';
import type { ConnectionStatus, WorkflowStatus } from '@/components/workflow/IntegratedControlPanel';

export default function WorkflowEditorPage() {
  // 连接状态
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    drone: false,
    websocket: false,
    lastUpdate: new Date(),
  });
  
  // 工作流状态
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    isRunning: false,
    progress: 0,
  });
  
  // 日志和结果
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ResultEntry[]>([]);
  
  // 工作流数据
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  
  // 添加日志的辅助函数
  const addLog = useCallback((
    level: LogEntry['level'],
    message: string,
    nodeId?: string
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      nodeId,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);
  
  // 添加结果的辅助函数
  const addResult = useCallback((
    nodeId: string,
    nodeName: string,
    result: any,
    resultType: string
  ) => {
    const newResult: ResultEntry = {
      id: `result-${Date.now()}-${Math.random()}`,
      nodeId,
      nodeName,
      result,
      resultType,
      timestamp: new Date(),
    };
    setResults(prev => [...prev, newResult]);
  }, []);
  
  // 运行工作流
  const handleRun = useCallback(async () => {
    addLog('info', '开始执行工作流');
    
    setWorkflowStatus({
      isRunning: true,
      progress: 0,
      startTime: new Date(),
    });
    
    try {
      // 模拟工作流执行
      addLog('info', '正在初始化节点...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('success', '节点初始化完成', 'node-1');
      addResult('node-1', '起飞节点', { altitude: 100 }, 'object');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('info', '正在执行检测...', 'node-2');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addLog('success', '检测完成', 'node-2');
      addResult('node-2', '检测节点', 'detection_result.jpg', 'image');
      
      addLog('success', '工作流执行完成');
      
      setWorkflowStatus({
        isRunning: false,
        progress: 100,
      });
    } catch (error) {
      addLog('error', `工作流执行失败: ${error}`);
      setWorkflowStatus({
        isRunning: false,
        progress: 0,
      });
    }
  }, [addLog, addResult]);
  
  // 停止工作流
  const handleStop = useCallback(() => {
    addLog('warning', '工作流已停止');
    setWorkflowStatus({
      isRunning: false,
      progress: 0,
    });
  }, [addLog]);
  
  // 保存工作流
  const handleSave = useCallback(() => {
    addLog('info', '正在保存工作流...');
    
    // 模拟保存
    setTimeout(() => {
      addLog('success', '工作流保存成功');
      setHasUnsavedChanges(false);
    }, 500);
  }, [addLog]);
  
  // 清空工作流
  const handleClear = useCallback(() => {
    if (window.confirm('确定要清空工作流吗？此操作不可撤销。')) {
      addLog('info', '工作流已清空');
      setIsEmpty(true);
      setHasUnsavedChanges(false);
      setLogs([]);
      setResults([]);
    }
  }, [addLog]);
  
  // 加载工作流
  const handleLoad = useCallback(() => {
    addLog('info', '正在加载工作流...');
    
    // 模拟加载
    setTimeout(() => {
      addLog('success', '工作流加载成功');
      setIsEmpty(false);
      setHasUnsavedChanges(false);
    }, 500);
  }, [addLog]);
  
  // AI生成工作流
  const handleAIGenerate = useCallback(() => {
    addLog('info', '正在使用AI生成工作流...');
    
    // 模拟AI生成
    setTimeout(() => {
      addLog('success', 'AI工作流生成成功');
      setIsEmpty(false);
      setHasUnsavedChanges(true);
    }, 2000);
  }, [addLog]);
  
  // 清空日志
  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  // 点击结果
  const handleResultClick = useCallback((result: ResultEntry) => {
    console.log('Result clicked:', result);
    addLog('info', `查看结果: ${result.nodeName}`);
  }, [addLog]);
  
  // 模拟连接状态更新
  React.useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WorkflowEditorLayout
        nodeLibrary={
          <CollapsibleNodeLibrary
            isCollapsed={false}
            width={280}
            onToggleCollapse={() => {}}
            onWidthChange={() => {}}
          />
        }
        canvas={
          <WorkflowCanvas
            nodes={[]}
            edges={[]}
            onNodesChange={() => {}}
            onEdgesChange={() => {}}
            onConnect={() => {}}
            theme="light"
          />
        }
        controlPanel={
          <IntegratedControlPanel
            isCollapsed={false}
            width={360}
            onToggleCollapse={() => {}}
            connectionStatus={connectionStatus}
            workflowStatus={workflowStatus}
            logs={logs}
            results={results}
            hasUnsavedChanges={hasUnsavedChanges}
            isEmpty={isEmpty}
            onRun={handleRun}
            onStop={handleStop}
            onSave={handleSave}
            onClear={handleClear}
            onLoad={handleLoad}
            onAIGenerate={handleAIGenerate}
            onClearLogs={handleClearLogs}
            onResultClick={handleResultClick}
          />
        }
      />
    </div>
  );
}
```

## 使用自定义Hook管理状态

```typescript
// hooks/useWorkflowControl.ts
import { useState, useCallback } from 'react';
import type { LogEntry, ResultEntry } from '@/components/workflow/OutputTabs';
import type { ConnectionStatus, WorkflowStatus } from '@/components/workflow/IntegratedControlPanel';

export function useWorkflowControl() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    drone: false,
    websocket: false,
    lastUpdate: new Date(),
  });
  
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    isRunning: false,
    progress: 0,
  });
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ResultEntry[]>([]);
  
  const addLog = useCallback((
    level: LogEntry['level'],
    message: string,
    nodeId?: string
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      nodeId,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);
  
  const addResult = useCallback((
    nodeId: string,
    nodeName: string,
    result: any,
    resultType: string
  ) => {
    const newResult: ResultEntry = {
      id: `result-${Date.now()}-${Math.random()}`,
      nodeId,
      nodeName,
      result,
      resultType,
      timestamp: new Date(),
    };
    setResults(prev => [...prev, newResult]);
  }, []);
  
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);
  
  const updateConnectionStatus = useCallback((
    drone: boolean,
    websocket: boolean
  ) => {
    setConnectionStatus({
      drone,
      websocket,
      lastUpdate: new Date(),
    });
  }, []);
  
  const startWorkflow = useCallback(() => {
    setWorkflowStatus({
      isRunning: true,
      progress: 0,
      startTime: new Date(),
    });
  }, []);
  
  const stopWorkflow = useCallback(() => {
    setWorkflowStatus(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);
  
  const updateProgress = useCallback((progress: number) => {
    setWorkflowStatus(prev => ({
      ...prev,
      progress,
    }));
  }, []);
  
  return {
    connectionStatus,
    workflowStatus,
    logs,
    results,
    addLog,
    addResult,
    clearLogs,
    clearResults,
    updateConnectionStatus,
    startWorkflow,
    stopWorkflow,
    updateProgress,
  };
}
```

## 使用自定义Hook的示例

```typescript
// app/workflow/page.tsx
'use client';

import React from 'react';
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';
import { useWorkflowControl } from '@/hooks/useWorkflowControl';

export default function WorkflowEditorPage() {
  const {
    connectionStatus,
    workflowStatus,
    logs,
    results,
    addLog,
    addResult,
    clearLogs,
    updateConnectionStatus,
    startWorkflow,
    stopWorkflow,
  } = useWorkflowControl();
  
  const handleRun = async () => {
    addLog('info', '开始执行工作流');
    startWorkflow();
    
    // 执行工作流逻辑...
  };
  
  const handleStop = () => {
    addLog('warning', '工作流已停止');
    stopWorkflow();
  };
  
  return (
    <IntegratedControlPanel
      isCollapsed={false}
      width={360}
      onToggleCollapse={() => {}}
      connectionStatus={connectionStatus}
      workflowStatus={workflowStatus}
      logs={logs}
      results={results}
      onRun={handleRun}
      onStop={handleStop}
      onSave={() => addLog('success', '保存成功')}
      onClear={() => addLog('info', '已清空')}
      onClearLogs={clearLogs}
    />
  );
}
```

## WebSocket集成示例

```typescript
// hooks/useWorkflowWebSocket.ts
import { useEffect } from 'react';
import { useWorkflowControl } from './useWorkflowControl';

export function useWorkflowWebSocket(url: string) {
  const {
    addLog,
    addResult,
    updateConnectionStatus,
    startWorkflow,
    stopWorkflow,
  } = useWorkflowControl();
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      addLog('success', 'WebSocket连接成功');
      updateConnectionStatus(false, true);
    };
    
    ws.onclose = () => {
      addLog('warning', 'WebSocket连接断开');
      updateConnectionStatus(false, false);
    };
    
    ws.onerror = (error) => {
      addLog('error', `WebSocket错误: ${error}`);
      updateConnectionStatus(false, false);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'log':
            addLog(data.level, data.message, data.nodeId);
            break;
          case 'result':
            addResult(
              data.nodeId,
              data.nodeName,
              data.result,
              data.resultType
            );
            break;
          case 'workflow_start':
            startWorkflow();
            addLog('info', '工作流开始执行');
            break;
          case 'workflow_stop':
            stopWorkflow();
            addLog('info', '工作流执行完成');
            break;
          case 'drone_status':
            updateConnectionStatus(data.connected, true);
            break;
        }
      } catch (error) {
        addLog('error', `消息解析失败: ${error}`);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [url, addLog, addResult, updateConnectionStatus, startWorkflow, stopWorkflow]);
}
```

## 实时日志流示例

```typescript
// 模拟实时日志流
function simulateLogStream(addLog: (level: string, message: string) => void) {
  const messages = [
    { level: 'info', message: '初始化系统...' },
    { level: 'success', message: '系统初始化完成' },
    { level: 'info', message: '连接无人机...' },
    { level: 'success', message: '无人机连接成功' },
    { level: 'info', message: '开始执行任务...' },
    { level: 'warning', message: '电量低于30%' },
    { level: 'success', message: '任务执行完成' },
  ];
  
  let index = 0;
  const interval = setInterval(() => {
    if (index < messages.length) {
      const { level, message } = messages[index];
      addLog(level as any, message);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}

// 使用示例
const handleRun = () => {
  const cleanup = simulateLogStream(addLog);
  return cleanup;
};
```

## 性能优化示例

```typescript
// 使用React.memo优化组件
import React from 'react';
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';

const MemoizedControlPanel = React.memo(
  IntegratedControlPanel,
  (prevProps, nextProps) => {
    // 自定义比较逻辑
    return (
      prevProps.isCollapsed === nextProps.isCollapsed &&
      prevProps.logs.length === nextProps.logs.length &&
      prevProps.results.length === nextProps.results.length &&
      prevProps.workflowStatus.isRunning === nextProps.workflowStatus.isRunning
    );
  }
);

// 使用useMemo缓存计算结果
const filteredLogs = React.useMemo(() => {
  return logs.filter(log => log.level === 'error');
}, [logs]);

// 使用useCallback稳定回调函数
const handleRun = React.useCallback(() => {
  // 执行逻辑
}, [/* 依赖项 */]);
```

## 错误处理示例

```typescript
// 错误边界组件
class ControlPanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Control Panel Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>控制面板加载失败</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用错误边界
<ControlPanelErrorBoundary>
  <IntegratedControlPanel {...props} />
</ControlPanelErrorBoundary>
```

## 测试示例

```typescript
// __tests__/IntegratedControlPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';

describe('IntegratedControlPanel', () => {
  const mockProps = {
    isCollapsed: false,
    width: 360,
    onToggleCollapse: jest.fn(),
    connectionStatus: {
      drone: true,
      websocket: true,
      lastUpdate: new Date(),
    },
    workflowStatus: {
      isRunning: false,
      progress: 0,
    },
    logs: [],
    results: [],
    onRun: jest.fn(),
    onStop: jest.fn(),
    onSave: jest.fn(),
    onClear: jest.fn(),
  };
  
  it('renders control panel', () => {
    render(<IntegratedControlPanel {...mockProps} />);
    expect(screen.getByText('控制面板')).toBeInTheDocument();
  });
  
  it('shows connection status', () => {
    render(<IntegratedControlPanel {...mockProps} />);
    expect(screen.getByText('已连接')).toBeInTheDocument();
  });
  
  it('calls onRun when run button is clicked', () => {
    render(<IntegratedControlPanel {...mockProps} />);
    const runButton = screen.getByText('运行');
    fireEvent.click(runButton);
    expect(mockProps.onRun).toHaveBeenCalled();
  });
  
  it('displays logs correctly', () => {
    const logs = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info' as const,
        message: 'Test log',
      },
    ];
    render(<IntegratedControlPanel {...mockProps} logs={logs} />);
    expect(screen.getByText('Test log')).toBeInTheDocument();
  });
});
```

## 总结

这些示例展示了如何在实际项目中集成和使用控制面板组件。关键点包括:

1. **状态管理**: 使用自定义Hook管理复杂状态
2. **WebSocket集成**: 实时接收和显示日志
3. **性能优化**: 使用React优化技术
4. **错误处理**: 使用错误边界保护组件
5. **测试**: 编写单元测试确保功能正常

根据项目需求，可以灵活调整和扩展这些示例。
