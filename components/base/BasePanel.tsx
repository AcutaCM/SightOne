"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface BasePanelProps {
  /** 面板标题 */
  title: string;
  /** 标题图标 */
  icon?: React.ReactNode;
  /** 操作按钮区域 */
  actions?: React.ReactNode;
  /** 面板内容 */
  children: React.ReactNode;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认是否折叠 */
  defaultCollapsed?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 头部自定义类名 */
  headerClassName?: string;
  /** 内容区自定义类名 */
  bodyClassName?: string;
  /** 是否显示分隔线 */
  showDivider?: boolean;
  /** 卡片变体 */
  variant?: 'flat' | 'bordered' | 'shadow';
  /** 是否全高度 */
  fullHeight?: boolean;
}

/**
 * 统一的面板基础组件
 * 基于 HeroUI Card 构建，提供标准化的面板布局
 */
export const BasePanel: React.FC<BasePanelProps> = ({
  title,
  icon,
  actions,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  showDivider = true,
  variant = 'bordered',
  fullHeight = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Card
      className={`${fullHeight ? 'h-full' : ''} ${className}`}
      variant={variant}
    >
      <CardHeader
        className={`flex items-center justify-between gap-3 ${
          collapsible ? 'cursor-pointer' : ''
        } ${headerClassName}`}
        onClick={collapsible ? toggleCollapse : undefined}
      >
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          
          {collapsible && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={toggleCollapse}
              aria-label={isCollapsed ? '展开' : '折叠'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {showDivider && <Divider />}

      {!isCollapsed && (
        <CardBody className={bodyClassName}>
          {children}
        </CardBody>
      )}
    </Card>
  );
};

export default BasePanel;
