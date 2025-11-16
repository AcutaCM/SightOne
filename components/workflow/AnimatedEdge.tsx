'use client';

import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { motion } from 'framer-motion';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

interface AnimatedEdgeProps extends EdgeProps {
  data?: {
    isActive?: boolean;
    isConditional?: boolean;
    label?: string;
  };
  selected?: boolean;
}

const AnimatedEdge: React.FC<AnimatedEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected = false,
}) => {
  const theme = useWorkflowTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.isActive || false;
  const isConditional = data?.isConditional || false;
  const label = data?.label;

  // Determine edge color and style using theme colors
  // Requirements: 1.1 - 使用黑白灰主题色系
  const getEdgeColor = () => {
    if (selected) return theme.node.selected; // 选中状态使用主题选中色
    if (isActive) return theme.status.warning; // 活动状态使用警告色
    if (isConditional) return theme.text.secondary; // 条件边使用次要文本色
    return theme.node.border; // 默认使用边框色
  };

  const edgeColor = getEdgeColor();
  const strokeWidth = selected ? 3 : isActive ? 2.5 : 2;
  const strokeDasharray = isConditional ? '5 5' : '0';

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Background path for better visibility */}
      <path
        id={`${id}-bg`}
        style={{
          ...style,
          strokeWidth: strokeWidth + 2,
          stroke: theme.node.bg,
          fill: 'none',
          opacity: 0.5,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />

      {/* Main edge path with theme colors and animations */}
      {/* Requirements: 1.1 - 应用主题颜色 */}
      <motion.path
        id={id}
        style={{
          ...style,
          strokeWidth,
          stroke: edgeColor,
          fill: 'none',
          strokeDasharray,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isHovered ? 1 : 0.8,
          strokeWidth: isHovered ? strokeWidth + 0.5 : strokeWidth,
          strokeDashoffset: isActive ? [20, 0] : 0,
        }}
        transition={{
          pathLength: { duration: 0.5, ease: 'easeInOut' },
          opacity: { duration: 0.2 },
          strokeWidth: { duration: 0.2 },
          strokeDashoffset: isActive ? {
            duration: 0.5,
            repeat: Infinity,
            ease: 'linear',
          } : {},
        }}
      />

      {/* Animated particles for active edges */}
      {/* Requirements: 7.1 - 添加流动动画，优化动画性能 */}
      {isActive && (
        <>
          <motion.circle
            r="3"
            fill={edgeColor}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              offsetPath: `path('${edgePath}')`,
              offsetRotate: '0deg',
              willChange: 'offset-distance, opacity',
            }}
          />
          <motion.circle
            r="3"
            fill={edgeColor}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.5,
            }}
            style={{
              offsetPath: `path('${edgePath}')`,
              offsetRotate: '0deg',
              willChange: 'offset-distance, opacity',
            }}
          />
          <motion.circle
            r="3"
            fill={edgeColor}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 1,
            }}
            style={{
              offsetPath: `path('${edgePath}')`,
              offsetRotate: '0deg',
              willChange: 'offset-distance, opacity',
            }}
          />
        </>
      )}

      {/* Edge label with theme colors */}
      {/* Requirements: 1.1 - 使用主题颜色 */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <motion.rect
            x={-30}
            y={-10}
            width={60}
            height={20}
            rx={4}
            fill={theme.node.headerBg}
            stroke={edgeColor}
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHovered ? 1.05 : 1, 
              opacity: 1 
            }}
            transition={{ 
              scale: { duration: 0.2 },
              opacity: { delay: 0.3, duration: 0.2 }
            }}
            style={{ willChange: 'transform, opacity' }}
          />
          <motion.text
            x={0}
            y={5}
            textAnchor="middle"
            fontSize={10}
            fill={theme.text.primary}
            fontWeight={500}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.2 }}
          >
            {label}
          </motion.text>
        </g>
      )}

      {/* Hover glow effect */}
      {/* Requirements: 7.1 - 添加悬停效果 */}
      {isHovered && (
        <motion.path
          style={{
            strokeWidth: strokeWidth + 4,
            stroke: edgeColor,
            fill: 'none',
            opacity: 0.2,
            filter: 'blur(4px)',
          }}
          d={edgePath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </g>
  );
};

export default AnimatedEdge;
