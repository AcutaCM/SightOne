"use client";

import React from "react";
import Image from "next/image";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { SearchIcon, BellIcon, SettingsIcon } from "@/components/icons";
import LayoutToggle from "@/components/LayoutToggle";
import ComponentSelectorButton from "@/components/ComponentSelectorButton";
import AuthButtons from "@/components/AuthButtons";
import { useLayout } from "@/contexts/LayoutContext";
import { useDrone } from "@/contexts/DroneContext";
import { useLayout as useLayoutContext } from "@/contexts/LayoutContext";
import { useRouter } from "next/navigation";
import { DarkModeTokens } from "@/lib/design-tokens-dark";

// 添加搜索结果类型
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'component' | 'setting' | 'mission' | 'drone';
  action: () => void;
}

// 搜索结果项组件
const SearchResultItem: React.FC<{ result: SearchResult }> = ({ result }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      className="px-4 py-3 cursor-pointer last:border-b-0 transition-all"
      style={{
        backgroundColor: isHovered ? DarkModeTokens.colors.background.panel : 'transparent',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: DarkModeTokens.colors.border.subtle,
        transition: `all ${DarkModeTokens.transitions.duration.fast} ${DarkModeTokens.transitions.easing.default}`,
      }}
      onClick={result.action}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: result.type === 'component' ? 'rgba(59, 130, 246, 0.1)' :
              result.type === 'setting' ? 'rgba(168, 85, 247, 0.1)' :
              result.type === 'mission' ? 'rgba(34, 197, 94, 0.1)' :
              'rgba(251, 191, 36, 0.1)',
          }}
        >
          {result.type === 'component' && (
            <svg className="w-4 h-4" style={{ color: 'rgba(96, 165, 250, 1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )}
          {result.type === 'setting' && (
            <SettingsIcon className="w-4 h-4" style={{ color: 'rgba(192, 132, 252, 1)' }} />
          )}
          {result.type === 'mission' && (
            <svg className="w-4 h-4" style={{ color: 'rgba(74, 222, 128, 1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
          {result.type === 'drone' && (
            <svg className="w-4 h-4" style={{ color: 'rgba(253, 224, 71, 1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div 
            className="text-sm font-medium truncate"
            style={{ 
              color: DarkModeTokens.colors.text.primary,
              opacity: DarkModeTokens.opacity.full,
            }}
          >
            {result.title}
          </div>
          <div 
            className="text-xs truncate"
            style={{ 
              color: DarkModeTokens.colors.text.secondary,
              opacity: DarkModeTokens.opacity.mediumLow,
            }}
          >
            {result.description}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DroneStatusProps {
  aiStatus: string;
  droneConnected: boolean;
  missionStatus: string;
  cruiseStatus: string;
  connectionStatus?: 'disconnected' | 'connecting' | 'connected' | 'error';
  aiConfigured?: boolean;
}

// 单个状态项组件 - iOS 16 风格
const StatusItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  variant: 'cruise' | 'mission' | 'drone' | 'ai';
  status?: 'normal' | 'active' | 'warning' | 'error' | 'connecting';
}> = ({ icon, label, variant, status = 'normal' }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // 根据状态确定样式和透明度
  const getStatusStyles = () => {
    const baseOpacity = isHovered ? DarkModeTokens.opacity.mediumHigh : DarkModeTokens.opacity.mediumLow;
    
    switch (status) {
      case 'active':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          color: 'rgba(34, 197, 94, 1)',
          opacity: DarkModeTokens.opacity.full,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderColor: 'rgba(251, 191, 36, 0.3)',
          color: 'rgba(251, 191, 36, 1)',
          opacity: DarkModeTokens.opacity.mediumHigh,
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: 'rgba(239, 68, 68, 1)',
          opacity: DarkModeTokens.opacity.high,
        };
      case 'connecting':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: 'rgba(59, 130, 246, 1)',
          opacity: DarkModeTokens.opacity.mediumLow,
        };
      default:
        return {
          backgroundColor: DarkModeTokens.colors.background.panel,
          borderColor: DarkModeTokens.colors.border.subtle,
          color: DarkModeTokens.colors.text.secondary,
          opacity: baseOpacity,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-[6px] rounded-[12px] transition-all ${status === 'connecting' ? 'animate-pulse' : ''}`}
      style={{
        backgroundColor: styles.backgroundColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: styles.borderColor,
        color: styles.color,
        opacity: styles.opacity,
        transition: `all ${DarkModeTokens.transitions.duration.normal} ${DarkModeTokens.transitions.easing.default}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-4 h-4">
        {icon}
      </div>
      <span className="text-[11px] font-medium whitespace-nowrap tracking-wide">{label}</span>
    </div>
  );
};

const DroneStatus: React.FC<DroneStatusProps> = ({
  aiStatus,
  droneConnected,
  missionStatus,
  cruiseStatus,
  connectionStatus,
  aiConfigured,
}) => {
  // 根据状态确定图标和样式
  const getCruiseStatus = () => {
    if (cruiseStatus.includes('飞行中') || cruiseStatus.includes('起飞')) return 'active';
    if (cruiseStatus.includes('降落')) return 'warning';
    return 'normal';
  };

  const getMissionStatus = () => {
    if (missionStatus.includes('执行中')) return 'active';
    if (missionStatus.includes('准备中')) return 'connecting';
    if (missionStatus.includes('失败')) return 'error';
    if (missionStatus.includes('已完成')) return 'active';
    return 'normal';
  };

  const getDroneStatus = () => {
    switch (connectionStatus) {
      case 'connected': return 'active';
      case 'connecting': return 'connecting';
      case 'error': return 'error';
      default: return 'normal';
    }
  };

  const getAIStatus = () => {
    if (aiStatus.includes('在线')) return 'active';
    if (aiStatus.includes('连接中')) return 'connecting';
    if (aiStatus.includes('错误')) return 'error';
    return 'normal';
  };

  return (
    <div 
      className="flex items-center gap-3"
      style={{
        transition: `all ${DarkModeTokens.transitions.duration.normal} ${DarkModeTokens.transitions.easing.default}`,
      }}
    >
      {/* 巡航状态 */}
      <StatusItem
        variant="cruise"
        status={getCruiseStatus()}
        icon={
          <svg viewBox="0 0 17 17" className="w-full h-full fill-current">
            <path d="M2 8.5L8.5 2L15 8.5L8.5 15L2 8.5Z" opacity="0.8"/>
            <circle cx="8.5" cy="8.5" r="2" fill="currentColor"/>
          </svg>
        }
        label={cruiseStatus}
      />
      
      {/* 任务状态 */}
      <StatusItem
        variant="mission"
        status={getMissionStatus()}
        icon={
          <svg viewBox="0 0 17 17" className="w-full h-full fill-current">
            <rect x="3" y="3" width="11" height="11" rx="2" opacity="0.6"/>
            <path d="M6 8.5L8 10.5L11 7.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        }
        label={missionStatus}
      />
      
      {/* 无人机连接状态 */}
      <StatusItem
        variant="drone"
        status={getDroneStatus()}
        icon={
          <svg viewBox="0 0 17 17" className="w-full h-full fill-current">
            <circle cx="8.5" cy="8.5" r="6" opacity="0.6"/>
            <rect x="7" y="7" width="3" height="3" rx="0.5"/>
            <path d="M5 5L12 12M12 5L5 12" stroke="currentColor" strokeWidth="1" opacity="0.8"/>
          </svg>
        }
        label={`无人机：${droneConnected ? "已连接" : "未连接"}`}
      />
      
      {/* AI状态 */}
      <StatusItem
        variant="ai"
        status={getAIStatus()}
        icon={
          <svg viewBox="0 0 17 17" className="w-full h-full fill-current">
            <circle cx="8.5" cy="8.5" r="6" opacity="0.6"/>
            <circle cx="6" cy="7" r="1" fill="currentColor"/>
            <circle cx="11" cy="7" r="1" fill="currentColor"/>
            <path d="M6 11Q8.5 13 11 11" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        }
        label={aiStatus}
      />
    </div>
  );
};

const TopNavbar: React.FC = () => {
  const { isEditMode, hasUnsavedChanges, saveLayouts, visibleComponents, toggleComponentVisibility } = useLayout();
  const { droneState, getStatusText, connectToDrone, disconnectFromDrone } = useDrone();
  const router = useRouter();
  
  // 确保路由在客户端正确挂载
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  const statusText = getStatusText();
  
  // 搜索处理函数
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim()) {
      setIsSearching(true);
      setShowSearchResults(true);
      
      // 模拟搜索过程
      setTimeout(() => {
        // 生成搜索结果
        const results: SearchResult[] = [];
        const query = value.toLowerCase();
        
        // 组件搜索
        const components = [
          { id: 'connection-control', name: '连接控制面板', desc: '管理无人机连接状态' },
          { id: 'mission-panel', name: '任务面板', desc: '创建和管理飞行任务' },
          { id: 'detection-control', name: '检测控制面板', desc: '控制AI视觉检测功能' },
          { id: 'video-stream', name: '视频流面板', desc: '查看实时视频流' },
          { id: 'strawberry-detection', name: '草莓检测卡片', desc: '查看草莓检测结果' },
          { id: 'manual-control', name: '手动控制面板', desc: '手动控制无人机' },
          { id: 'ai-analysis-report', name: 'AI分析报告', desc: '查看AI分析结果' },
          { id: 'challenge-cruise', name: '挑战巡航面板', desc: '执行预设巡航任务' },
          { id: 'system-log-panel', name: '系统日志面板', desc: '查看系统日志信息' },
          { id: 'chat-panel', name: '聊天面板', desc: '与AI助手交互' },
          { id: 'tello-workflow-panel', name: 'Tello工作流面板', desc: '可视化编排Tello无人机任务流程' },
        ];
        
        components.forEach(comp => {
          if (comp.name.toLowerCase().includes(query) || comp.desc.toLowerCase().includes(query)) {
            results.push({
              id: comp.id,
              title: comp.name,
              description: comp.desc,
              type: 'component',
              action: () => {
                toggleComponentVisibility(comp.id);
                setSearchQuery("");
                setShowSearchResults(false);
              }
            });
          }
        });
        
        // 设置搜索
        const settingsItems = [
          { id: 'settings-account', name: '账户设置', desc: '管理账户信息和系统偏好', path: '/settings' },
          { id: 'settings-profile', name: '个人信息', desc: '更新个人资料和头像', path: '/settings?tab=profile' },
          { id: 'settings-security', name: '安全设置', desc: '修改密码和安全选项', path: '/settings?tab=security' },
          { id: 'settings-preferences', name: '系统偏好', desc: '自定义界面和功能设置', path: '/settings?tab=preferences' },
        ];
        
        settingsItems.forEach(item => {
          if (item.name.includes(query) || item.desc.includes(query)) {
            results.push({
              id: item.id,
              title: item.name,
              description: item.desc,
              type: 'setting',
              action: () => {
                if (isClient) {
                  router.push(item.path);
                }
                setSearchQuery("");
                setShowSearchResults(false);
              }
            });
          }
        });
        
        // 任务相关搜索
        const missionItems = [
          { id: 'mission-create', name: '创建任务', desc: '新建飞行任务', action: () => console.log('创建新任务') },
          { id: 'mission-list', name: '任务列表', desc: '查看所有飞行任务', action: () => console.log('查看任务列表') },
          { id: 'mission-history', name: '历史任务', desc: '查看已完成的任务', action: () => console.log('查看历史任务') },
        ];
        
        missionItems.forEach(item => {
          if (item.name.includes(query) || item.desc.includes(query)) {
            results.push({
              id: item.id,
              title: item.name,
              description: item.desc,
              type: 'mission',
              action: () => {
                item.action();
                setSearchQuery("");
                setShowSearchResults(false);
              }
            });
          }
        });
        
        // 无人机相关搜索
        const droneItems = [
          { id: 'drone-status', name: '无人机状态', desc: '查看无人机连接和状态信息', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
          { id: 'drone-connect', name: '连接无人机', desc: '建立与无人机的连接', action: () => {
            connectToDrone();
            // 显示连接状态提示
            console.log('正在连接无人机...');
          } },
          { id: 'drone-disconnect', name: '断开连接', desc: '断开与无人机的连接', action: () => {
            disconnectFromDrone();
            // 显示断开状态提示
            console.log('正在断开无人机连接...');
          } },
          { id: 'drone-calibrate', name: '校准无人机', desc: '执行无人机校准程序', action: () => console.log('校准无人机') },
        ];
        
        droneItems.forEach(item => {
          if (item.name.includes(query) || item.desc.includes(query)) {
            results.push({
              id: item.id,
              title: item.name,
              description: item.desc,
              type: 'drone',
              action: () => {
                item.action();
                setSearchQuery("");
                setShowSearchResults(false);
              }
            });
          }
        });
        
        // 帮助和系统信息搜索
        const helpItems = [
          { id: 'help-docs', name: '使用文档', desc: '查看系统使用说明', action: () => window.open('/help', '_blank') },
          { id: 'help-tutorials', name: '视频教程', desc: '观看操作视频教程', action: () => window.open('/tutorials', '_blank') },
          { id: 'help-faq', name: '常见问题', desc: '查看常见问题解答', action: () => window.open('/faq', '_blank') },
          { id: 'system-info', name: '系统信息', desc: '查看系统版本和配置', action: () => console.log('显示系统信息') },
          { id: 'system-logs', name: '系统日志', desc: '查看详细系统日志', action: () => console.log('显示系统日志') },
        ];
        
        helpItems.forEach(item => {
          if (item.name.includes(query) || item.desc.includes(query)) {
            results.push({
              id: item.id,
              title: item.name,
              description: item.desc,
              type: 'setting', // 使用设置类型图标
              action: () => {
                item.action();
                setSearchQuery("");
                setShowSearchResults(false);
              }
            });
          }
        });
        
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };
  
  // 失去焦点时隐藏搜索结果
  const handleSearchBlur = () => {
    // 延迟隐藏，以便点击结果时不会立即消失
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };
  
  // 获得焦点时显示搜索结果
  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  return (
    <div 
      className="w-full h-[51px] flex items-center justify-between px-6 mt-4 relative transition-all duration-250"
      style={{ 
        backgroundColor: 'transparent', /* No background - clean look */
        transition: `background-color ${DarkModeTokens.transitions.duration.normal} ${DarkModeTokens.transitions.easing.default}`
      }}
    >
      {/* 左侧 Logo 区域 */}
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="SIGHTONE Logo" width={61} height={47} />
        <div>
          <div 
            className="text-base font-normal leading-6 transition-opacity duration-250"
            style={{ 
              color: DarkModeTokens.colors.text.primary,
              opacity: DarkModeTokens.opacity.full
            }}
          >
            SIGHTONE瞰析人工智能分析平台
          </div>
          <div 
            className="text-sm font-normal leading-tight transition-opacity duration-250"
            style={{ 
              color: DarkModeTokens.colors.text.secondary,
              opacity: DarkModeTokens.opacity.medium
            }}
          >
            AI ANALYSIS PLATFORM
          </div>
        </div>
      </div>
      
      {/* 中间 无人机状态 */}
      <DroneStatus
        aiStatus={statusText.ai}
        droneConnected={droneState.isConnected}
        missionStatus={statusText.mission}
        cruiseStatus={statusText.cruise}
        connectionStatus={droneState.connectionStatus}
        aiConfigured={droneState.aiApiConfigured}
      />
      
      {/* 右侧 用户操作区域 */}
      <div className="flex items-center gap-4">
        {/* 搜索框 */}
        <div className="w-[250px] relative mr-2">
          <Input
            placeholder="搜索组件、任务或设置..."
            size="sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            startContent={
              isSearching ? (
                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]"></div>
              ) : (
                <SearchIcon className="w-4 h-4 text-gray-600" />
              )
            }
            classNames={{
              base: "h-[35px]",
              mainWrapper: "h-full",
              input: "text-xs text-gray-200 placeholder:text-gray-500",
              inputWrapper: "h-full bg-content1 border-[0.5px] border-divider rounded-[15px] hover:border-white/50 focus-within:border-blue-400/70",
            }}
          />
          
          {/* 搜索结果下拉框 */}
          {showSearchResults && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 rounded-xl z-50 max-h-96 overflow-y-auto"
              style={{
                backgroundColor: DarkModeTokens.colors.background.dropdown,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: DarkModeTokens.colors.border.default,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              }}
              onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
            >
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <SearchResultItem key={result.id} result={result} />
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <div 
                    className="text-sm"
                    style={{ 
                      color: DarkModeTokens.colors.text.secondary,
                      opacity: DarkModeTokens.opacity.mediumLow,
                    }}
                  >
                    未找到相关结果
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 用户认证区域 */}
        <AuthButtons />
        
        {/* 设置图标 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="w-6 h-6 min-w-6 transition-opacity duration-250"
          style={{ 
            opacity: DarkModeTokens.opacity.mediumLow,
          }}
          onPress={() => isClient && router.push('/settings')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.mediumHigh);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.mediumLow);
          }}
        >
          <SettingsIcon className="w-4 h-4 text-white" />
        </Button>
        
        {/* 通知图标 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="w-6 h-6 min-w-6 transition-opacity duration-250"
          style={{ 
            opacity: DarkModeTokens.opacity.mediumLow,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.mediumHigh);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.mediumLow);
          }}
        >
          <BellIcon className="w-4 h-4 text-white" />
        </Button>

        {/* Dify 图标按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="w-6 h-6 min-w-6 transition-opacity duration-250"
          style={{ 
            opacity: DarkModeTokens.opacity.mediumHigh,
          }}
          onPress={() => { if (isClient) window.open('http://localhost', '_blank', 'noopener,noreferrer'); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.full);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = String(DarkModeTokens.opacity.mediumHigh);
          }}
          aria-label="Open Dify"
        >
          <Image src="/dify-logo.svg?v=1" alt="Dify" width={20} height={20} className="w-5 h-5" />
        </Button>
        
        {/* 组件选择器按钮 */}
        <ComponentSelectorButton />
        
        {/* 布局编辑图标 */}
        <LayoutToggle />

        {/* 应用更改按钮 - 仅在编辑模式且有未保存更改时显示 */}
        {isEditMode && hasUnsavedChanges && (
          <Button
            size="sm"
            color="success"
            variant="solid"
            onPress={saveLayouts}
            className="font-medium text-white shadow-lg shadow-green-500/30 animate-in fade-in zoom-in-90"
          >
            应用更改
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopNavbar;
