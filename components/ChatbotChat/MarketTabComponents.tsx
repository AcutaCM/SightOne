import styled from "@emotion/styled";
import React, { useEffect, useRef, useState, useCallback } from "react";

/* ========================================
   市场分栏动画组件
   ======================================== */

/* 分栏导航栏容器 */
export const TabBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  padding-bottom: 8px;
`;

/* 单个分栏标签 */
export const TabItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  user-select: none;
  
  /* 颜色过渡 */
  color: ${p => p.active
    ? 'hsl(var(--heroui-foreground))'
    : 'hsl(var(--heroui-foreground) / 0.5)'};
  
  /* 字重变化 */
  font-weight: ${p => p.active ? 600 : 400};
  
  /* 平滑过渡 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 悬停效果 */
  &:hover {
    color: hsl(var(--heroui-foreground));
    background: hsl(var(--heroui-content2));
    transform: translateY(-1px);
  }
  
  /* 点击效果 */
  &:active {
    transform: translateY(0);
  }
  
  /* 图标样式 */
  svg {
    transition: opacity 0.2s ease;
    opacity: ${p => p.active ? 0.9 : 0.7};
  }
  
  &:hover svg {
    opacity: 1;
  }
`;

/* 活动指示器 */
export const TabIndicator = styled.div<{ left: number; width: number }>`
  position: absolute;
  bottom: 0;
  left: ${p => p.left}px;
  width: ${p => p.width}px;
  height: 2px;
  background: linear-gradient(90deg, 
    hsl(var(--heroui-primary)), 
    hsl(var(--heroui-primary) / 0.8)
  );
  border-radius: 2px 2px 0 0;
  
  /* 平滑过渡 */
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 性能优化提示 */
  will-change: left, width;
  
  /* 添加光晕效果 */
  box-shadow: 0 0 8px hsl(var(--heroui-primary) / 0.5);
  
  /* 深色主题下的光晕增强 */
  .dark & {
    box-shadow: 0 0 12px hsl(var(--heroui-primary) / 0.6);
  }
`;

/* 内容区域包装器 */
export const MarketContentWrapper = styled.div<{ isAnimating?: boolean }>`
  flex: 1;
  min-height: 0;
  overflow: auto;
  
  /* 性能优化 */
  ${p => p.isAnimating && `
    will-change: opacity, transform;
  `}
`;


/* ========================================
   MarketTabBar 组件
   ======================================== */

interface TabConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface MarketTabBarProps {
  activeTab: string;
  tabs: TabConfig[];
  onTabChange: (tab: string) => void;
}

export const MarketTabBar: React.FC<MarketTabBarProps> = ({ activeTab, tabs, onTabChange }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 计算指示器位置和宽度
  const updateIndicator = useCallback(() => {
    requestAnimationFrame(() => {
      const activeTabElement = tabRefs.current[activeTab];
      const container = containerRef.current;

      if (activeTabElement && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();

        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      } else {
        // 使用默认值
        setIndicatorStyle({ left: 0, width: 100 });
      }
    });
  }, [activeTab]);

  // 当激活的标签改变时更新指示器
  useEffect(() => {
    updateIndicator();
  }, [activeTab, updateIndicator]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  return (
    <TabBarContainer ref={containerRef}>
      {tabs.map(tab => (
        <TabItem
          key={tab.key}
          ref={el => { tabRefs.current[tab.key] = el; }}
          active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </TabItem>
      ))}
      <TabIndicator left={indicatorStyle.left} width={indicatorStyle.width} />
    </TabBarContainer>
  );
};
