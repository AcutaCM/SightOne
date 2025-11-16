'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { nodeExecutionAnimation, nodeHoverAnimation } from '@/lib/workflow/animations';
import { getNodeStyle, getStatusIndicatorStyle, NodeStatus } from '@/lib/workflow/designSystem';
import { WorkflowNodeDefinition } from '@/lib/workflow/nodeDefinitions';

interface AnimatedWorkflowNodeProps extends NodeProps {
  data: {
    label: string;
    status?: NodeStatus;
    nodeType: string;
    parameters?: Record<string, any>;
    category?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    color?: string;
  };
}

const AnimatedWorkflowNode: React.FC<AnimatedWorkflowNodeProps> = ({ data, selected }) => {
  const status = data.status || 'idle';
  const category = data.category || 'basic';
  const Icon = data.icon;

  // Get node style based on category and status
  const nodeStyle = getNodeStyle(category as any, status);
  const statusIndicatorStyle = getStatusIndicatorStyle(status);

  // Determine animation variant based on status
  const animationVariant = status === 'running' 
    ? nodeExecutionAnimation.running 
    : status === 'success'
    ? nodeExecutionAnimation.success
    : status === 'error'
    ? nodeExecutionAnimation.error
    : nodeExecutionAnimation.idle;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: data.color || '#64FFDA',
          width: 10,
          height: 10,
          border: '2px solid #0A192F',
        }}
      />
      
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={nodeHoverAnimation}
        animate={status === 'running' ? 'running' : 'idle'}
        style={{
          ...nodeStyle,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none',
          border: selected 
            ? `2px solid ${data.color || '#64FFDA'}` 
            : `2px solid ${nodeStyle.borderColor}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Status Indicator */}
        <motion.div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            ...statusIndicatorStyle,
          }}
          animate={status === 'running' ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: status === 'running' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Node Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {Icon && (
            <motion.div
              animate={status === 'running' ? {
                rotate: [0, 360],
              } : {}}
              transition={{
                duration: 2,
                repeat: status === 'running' ? Infinity : 0,
                ease: 'linear',
              }}
            >
              <Icon size={20} className={`text-[${data.color || '#64FFDA'}]`} />
            </motion.div>
          )}
          <div style={{
            flex: 1,
            fontSize: '14px',
            fontWeight: 500,
            color: '#E6F1FF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {data.label}
          </div>
        </div>

        {/* Node Type Badge */}
        <div style={{
          fontSize: '10px',
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {data.nodeType}
        </div>

        {/* Parameters Preview (if any) */}
        {data.parameters && Object.keys(data.parameters).length > 0 && (
          <div style={{
            fontSize: '11px',
            color: '#64748B',
            borderTop: '1px solid rgba(100, 255, 218, 0.2)',
            paddingTop: '6px',
            marginTop: '2px',
          }}>
            {Object.keys(data.parameters).length} 个参数
          </div>
        )}

        {/* Running Progress Bar */}
        {status === 'running' && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #F59E0B, #D97706)',
              borderRadius: '0 0 6px 6px',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: data.color || '#64FFDA',
          width: 10,
          height: 10,
          border: '2px solid #0A192F',
        }}
      />
    </>
  );
};

export default AnimatedWorkflowNode;
