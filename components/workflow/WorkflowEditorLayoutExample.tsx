/**
 * WorkflowEditorLayout Example
 * 
 * Example usage of the WorkflowEditorLayout component.
 * This demonstrates how to integrate the layout with node library,
 * canvas, and control panel components.
 */

'use client';

import React from 'react';
import WorkflowEditorLayout from './WorkflowEditorLayout';

/**
 * Example Node Library Component
 */
const ExampleNodeLibrary: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
        节点库
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--wf-panel-hover)',
          cursor: 'pointer',
        }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>基础节点</div>
          <div style={{ fontSize: '12px', color: 'var(--wf-panel-text-secondary)' }}>
            开始、结束、延时
          </div>
        </div>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--wf-panel-hover)',
          cursor: 'pointer',
        }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>移动节点</div>
          <div style={{ fontSize: '12px', color: 'var(--wf-panel-text-secondary)' }}>
            起飞、降落、移动
          </div>
        </div>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--wf-panel-hover)',
          cursor: 'pointer',
        }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>检测节点</div>
          <div style={{ fontSize: '12px', color: 'var(--wf-panel-text-secondary)' }}>
            YOLO、分割、识别
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example Canvas Component
 */
const ExampleCanvas: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--wf-canvas-bg)',
    }}>
      <div style={{
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'var(--wf-panel-bg)',
        border: '1px solid var(--wf-panel-border)',
        textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>
          工作流画布
        </h2>
        <p style={{ color: 'var(--wf-panel-text-secondary)', fontSize: '14px' }}>
          拖拽节点到此处开始构建工作流
        </p>
      </div>
    </div>
  );
};

/**
 * Example Control Panel Component
 */
const ExampleControlPanel: React.FC = () => {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          控制面板
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--wf-status-success)',
            color: 'white',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            运行
          </button>
          <button style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--wf-panel-border)',
            backgroundColor: 'transparent',
            color: 'var(--wf-panel-text)',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            停止
          </button>
        </div>
      </div>
      
      <div>
        <h4 style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>
          日志
        </h4>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--wf-panel-hover)',
          fontSize: '12px',
          fontFamily: 'var(--wf-font-mono)',
          maxHeight: '200px',
          overflow: 'auto',
        }}>
          <div style={{ color: 'var(--wf-status-success)' }}>
            [INFO] 工作流已准备就绪
          </div>
          <div style={{ color: 'var(--wf-panel-text-secondary)' }}>
            [INFO] 等待用户操作...
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * WorkflowEditorLayout Example Component
 */
export const WorkflowEditorLayoutExample: React.FC = () => {
  const handleLayoutChange = (state: any) => {
    console.log('Layout state changed:', state);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkflowEditorLayout
        nodeLibrary={<ExampleNodeLibrary />}
        canvas={<ExampleCanvas />}
        controlPanel={<ExampleControlPanel />}
        onLayoutChange={handleLayoutChange}
        persistLayout={true}
      />
    </div>
  );
};

export default WorkflowEditorLayoutExample;
