'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import WorkflowEditorLayout from '@/components/workflow/WorkflowEditorLayout';
import CollapsibleNodeLibrary from '@/components/workflow/CollapsibleNodeLibrary';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';
import { useTheme } from 'next-themes';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { migrateWorkflowData, needsMigration } from '@/lib/workflow/dataMigration';
import useWebSocket from '@/hooks/useWebSocket';
import toast, { Toaster } from 'react-hot-toast';
import 'reactflow/dist/style.css';
import '@/styles/workflow-redesign.css';

/**
 * Workflow Editor Page
 * 
 * This page provides a modern, Dify-style workflow editor for creating
 * and managing drone automation workflows.
 * 
 * Features:
 * - Three-column layout (Node Library | Canvas | Control Panel)
 * - Theme-aware design (light/dark mode)
 * - Drag-and-drop node creation
 * - Real-time workflow execution
 * - Visual feedback and status indicators
 * - WebSocket integration for live updates
 * - Workflow save/load functionality
 */

let nodeIdCounter = 0;
const generateNodeId = () => `node_${nodeIdCounter++}`;

export default function WorkflowPage() {
  const { theme: nextTheme, systemTheme } = useTheme();
  const currentTheme = (nextTheme === 'system' ? systemTheme : nextTheme) as 'light' | 'dark';
  const { theme } = useWorkflowTheme();
  
  // Workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Control panel state
  const [logs, setLogs] = useState<Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    nodeId?: string;
  }>>([]);
  
  const [results, setResults] = useState<Array<{
    id: string;
    nodeId: string;
    nodeName: string;
    result: any;
    resultType: string;
    timestamp: Date;
  }>>([]);
  
  const [workflowStatus, setWorkflowStatus] = useState<{
    isRunning: boolean;
    currentNode?: string;
    progress: number;
    startTime?: Date;
  }>({
    isRunning: false,
    progress: 0,
  });
  
  // WebSocket connection
  const { isConnected, lastMessage, sendMessage } = useWebSocket('ws://localhost:8080');
  
  // Connection status
  const connectionStatus = useMemo(() => ({
    drone: false, // TODO: Get from drone context
    websocket: isConnected,
    lastUpdate: new Date(),
  }), [isConnected]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        switch (data.type) {
          case 'log':
            addLog(data.payload.level || 'info', data.payload.message, data.payload.nodeId);
            break;
            
          case 'node_status_update':
            updateNodeStatus(data.payload.nodeId, data.payload.status);
            break;
            
          case 'task_result':
            addResult(data.payload);
            break;
            
          case 'workflow_started':
            setWorkflowStatus({
              isRunning: true,
              progress: 0,
              startTime: new Date(),
            });
            toast.success('工作流已开始执行');
            break;
            
          case 'workflow_finished':
            setWorkflowStatus(prev => ({
              ...prev,
              isRunning: false,
              progress: 100,
            }));
            toast.success(data.payload.message || '工作流执行完成');
            break;
            
          case 'workflow_error':
            setWorkflowStatus(prev => ({
              ...prev,
              isRunning: false,
            }));
            toast.error(data.payload.message || '工作流执行出错');
            addLog('error', data.payload.message, data.payload.nodeId);
            break;
            
          default:
            addLog('info', lastMessage.data);
        }
      } catch (e) {
        addLog('info', lastMessage.data);
      }
    }
  }, [lastMessage]);
  
  // Log connection status changes
  useEffect(() => {
    addLog(
      isConnected ? 'success' : 'warning',
      `WebSocket ${isConnected ? '已连接' : '已断开'}`
    );
  }, [isConnected]);
  
  // Helper functions
  const addLog = useCallback((level: 'info' | 'warning' | 'error' | 'success', message: string, nodeId?: string) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      nodeId,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);
  
  const updateNodeStatus = useCallback((nodeId: string, status: string) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);
  
  const addResult = useCallback((payload: any) => {
    const newResult = {
      id: `result_${Date.now()}`,
      nodeId: payload.nodeId || '',
      nodeName: payload.nodeName || 'Unknown',
      result: payload.result,
      resultType: payload.resultType || 'unknown',
      timestamp: new Date(),
    };
    setResults(prev => [...prev, newResult]);
  }, []);
  
  // Workflow actions
  const handleRun = useCallback(() => {
    if (!isConnected) {
      toast.error('WebSocket 未连接');
      return;
    }
    
    if (nodes.length === 0) {
      toast.error('工作流为空');
      return;
    }
    
    // Send workflow to backend
    sendMessage(JSON.stringify({
      type: 'run_workflow',
      payload: {
        nodes,
        edges,
      },
    }));
    
    addLog('info', '正在启动工作流...');
  }, [isConnected, nodes, edges, sendMessage, addLog]);
  
  const handleStop = useCallback(() => {
    sendMessage(JSON.stringify({
      type: 'stop_workflow',
    }));
    
    setWorkflowStatus(prev => ({
      ...prev,
      isRunning: false,
    }));
    
    addLog('warning', '工作流已停止');
  }, [sendMessage, addLog]);
  
  const handleSave = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      metadata: {
        name: 'Untitled Workflow',
        createdAt: new Date().toISOString(),
        version: '1.0',
      },
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('workflow-current', JSON.stringify(workflowData));
      toast.success('工作流已保存');
      addLog('success', '工作流已保存到本地');
    } catch (error) {
      toast.error('保存失败');
      addLog('error', '保存工作流失败');
    }
  }, [nodes, edges, addLog]);
  
  const handleClear = useCallback(() => {
    if (confirm('确定要清空工作流吗？')) {
      setNodes([]);
      setEdges([]);
      setResults([]);
      toast.success('工作流已清空');
      addLog('info', '工作流已清空');
    }
  }, [setNodes, setEdges, addLog]);
  
  const handleClearLogs = useCallback(() => {
    setLogs([]);
    toast.success('日志已清空');
  }, []);
  
  const handleExportLogs = useCallback((format: 'json' | 'txt') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `workflow-logs-${timestamp}.${format}`;
    
    let content: string;
    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
    } else {
      content = logs.map(log => 
        `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
      ).join('\n');
    }
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`日志已导出为 ${format.toUpperCase()}`);
  }, [logs]);
  
  // Canvas handlers
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Load saved workflow on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('workflow-current');
      if (saved) {
        const workflowData = JSON.parse(saved);
        
        // Check if migration is needed
        if (needsMigration(workflowData)) {
          const migrated = migrateWorkflowData(workflowData);
          setNodes(migrated.nodes);
          setEdges(migrated.edges);
          addLog('info', '工作流数据已迁移到新版本');
        } else {
          setNodes(workflowData.nodes || []);
          setEdges(workflowData.edges || []);
          addLog('success', '已加载保存的工作流');
        }
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      addLog('error', '加载工作流失败');
    }
  }, [setNodes, setEdges, addLog]);
  
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Toaster position="top-right" />
      <ReactFlowProvider>
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
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              theme={currentTheme}
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
              onRun={handleRun}
              onStop={handleStop}
              onSave={handleSave}
              onClear={handleClear}
              onClearLogs={handleClearLogs}
              onExportLogs={handleExportLogs}
            />
          }
          persistLayout={true}
        />
      </ReactFlowProvider>
    </div>
  );
}
