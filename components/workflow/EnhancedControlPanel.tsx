'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  Save,
  FolderOpen,
  Trash2,
  Sparkles,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
} from 'lucide-react';
import { listItemAnimation, buttonClickAnimation } from '@/lib/workflow/animations';
import styles from '@/styles/WorkflowDesignSystem.module.css';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}

interface ResultEntry {
  id: string;
  task: string;
  result: any;
  resultType?: string;
  timestamp: Date;
}

interface EnhancedControlPanelProps {
  isConnected: boolean;
  wsConnected: boolean;
  isRunning: boolean;
  hasUnsavedChanges?: boolean;
  logs: string[];
  results: Array<{ task: string; result: any; resultType?: string }>;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onAIGenerate: () => void;
}

const EnhancedControlPanel: React.FC<EnhancedControlPanelProps> = ({
  isConnected,
  wsConnected,
  isRunning,
  hasUnsavedChanges = false,
  logs,
  results,
  onRun,
  onStop,
  onSave,
  onLoad,
  onClear,
  onAIGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<string>('logs');
  const [parsedLogs, setParsedLogs] = useState<LogEntry[]>([]);
  const [parsedResults, setParsedResults] = useState<ResultEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Parse logs into structured format
  useEffect(() => {
    const newLogs: LogEntry[] = logs.map((log, index) => {
      const level = log.toLowerCase().includes('error') ? 'error'
        : log.toLowerCase().includes('warning') ? 'warning'
        : log.toLowerCase().includes('成功') || log.toLowerCase().includes('完成') ? 'success'
        : 'info';

      return {
        id: `log-${index}-${Date.now()}`,
        timestamp: new Date(),
        level,
        message: log,
      };
    });
    setParsedLogs(newLogs);
  }, [logs]);

  // Parse results into structured format
  useEffect(() => {
    const newResults: ResultEntry[] = results.map((result, index) => ({
      id: `result-${index}-${Date.now()}`,
      task: result.task,
      result: result.result,
      resultType: result.resultType,
      timestamp: new Date(),
    }));
    setParsedResults(newResults);
  }, [results]);

  // Auto-scroll to bottom when new logs/results arrive
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [parsedLogs, activeTab]);

  useEffect(() => {
    if (activeTab === 'results' && resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [parsedResults, activeTab]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle size={14} className="text-danger" />;
      case 'warning':
        return <AlertCircle size={14} className="text-warning" />;
      case 'success':
        return <CheckCircle size={14} className="text-success" />;
      default:
        return <FileText size={14} className="text-default-400" />;
    }
  };

  const getLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return styles.logItemError;
      case 'warning':
        return styles.logItemWarning;
      case 'success':
        return styles.logItemSuccess;
      default:
        return '';
    }
  };

  return (
    <div className={styles.controlPanel}>
      {/* Header */}
      <div className={styles.controlPanelHeader}>
        <h4 className={styles.controlPanelTitle}>控制面板</h4>
        
        {/* Status Info */}
        <div className={styles.statusInfo}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>无人机:</span>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi size={14} className="text-success" />
                  <span className={`${styles.statusValue} ${styles.statusConnected}`}>
                    已连接
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-danger" />
                  <span className={`${styles.statusValue} ${styles.statusDisconnected}`}>
                    未连接
                  </span>
                </>
              )}
            </div>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>WebSocket:</span>
            <div className="flex items-center gap-1">
              {wsConnected ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className={`${styles.statusValue} ${styles.statusConnected}`}>
                    在线
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className={`${styles.statusValue} text-warning`}>
                    离线
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className={styles.controlButtons}>
        <motion.div
          variants={buttonClickAnimation}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            className={styles.runButton}
            onClick={onRun}
            isDisabled={!isConnected || isRunning}
            startContent={<Play size={16} />}
            fullWidth
          >
            {isRunning ? '运行中...' : '运行工作流'}
          </Button>
        </motion.div>

        <motion.div
          variants={buttonClickAnimation}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            className={styles.stopButton}
            onClick={onStop}
            isDisabled={!isRunning}
            startContent={<Square size={16} />}
            fullWidth
          >
            停止
          </Button>
        </motion.div>

        <motion.div
          variants={buttonClickAnimation}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            className={styles.aiButton}
            onClick={onAIGenerate}
            startContent={<Sparkles size={16} />}
            fullWidth
          >
            AI生成工作流
          </Button>
        </motion.div>

        <motion.div
          variants={buttonClickAnimation}
          whileHover="hover"
          whileTap="tap"
        >
          <Badge
            content={hasUnsavedChanges ? '●' : null}
            color="warning"
            size="sm"
            placement="top-right"
          >
            <Button
              className={`${styles.saveButton} ${hasUnsavedChanges ? styles.unsaved : ''}`}
              onClick={onSave}
              startContent={<Save size={16} />}
              fullWidth
            >
              保存工作流
            </Button>
          </Badge>
        </motion.div>

        <div className="flex gap-2">
          <motion.div
            className="flex-1"
            variants={buttonClickAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              className={styles.loadButton}
              onClick={onLoad}
              startContent={<FolderOpen size={16} />}
              fullWidth
            >
              加载
            </Button>
          </motion.div>

          <motion.div
            className="flex-1"
            variants={buttonClickAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              className={styles.clearButton}
              onClick={onClear}
              startContent={<Trash2 size={16} />}
              fullWidth
            >
              清空
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Output Panel with Tabs */}
      <div className={styles.outputPanel}>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "bg-content2",
            cursor: "bg-primary",
            tab: "data-[selected=true]:text-primary",
          }}
          fullWidth
        >
          <Tab
            key="logs"
            title={
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>日志</span>
                {parsedLogs.length > 0 && (
                  <Chip size="sm" variant="flat">
                    {parsedLogs.length}
                  </Chip>
                )}
              </div>
            }
          >
            <ScrollShadow className={styles.outputContent}>
              {parsedLogs.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={48} className={styles.emptyStateIcon} />
                  <p className={styles.emptyStateText}>暂无日志</p>
                </div>
              ) : (
                <div className={styles.logList}>
                  <AnimatePresence>
                    {parsedLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={listItemAnimation}
                        className={`${styles.logItem} ${getLevelClass(log.level)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getLevelIcon(log.level)}
                          <div className="flex-1">
                            <div className="text-xs text-default-400 mb-1">
                              {log.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="text-sm">{log.message}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={logsEndRef} />
                </div>
              )}
            </ScrollShadow>
          </Tab>

          <Tab
            key="results"
            title={
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                <span>结果</span>
                {parsedResults.length > 0 && (
                  <Chip size="sm" variant="flat">
                    {parsedResults.length}
                  </Chip>
                )}
              </div>
            }
          >
            <ScrollShadow className={styles.outputContent}>
              {parsedResults.length === 0 ? (
                <div className={styles.emptyState}>
                  <BarChart3 size={48} className={styles.emptyStateIcon} />
                  <p className={styles.emptyStateText}>暂无结果</p>
                </div>
              ) : (
                <div className={styles.resultList}>
                  <AnimatePresence>
                    {parsedResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={listItemAnimation}
                        className={styles.resultItem}
                      >
                        <div className={styles.resultItemHeader}>
                          <span className={styles.resultItemTitle}>
                            {result.task}
                          </span>
                          {result.resultType && (
                            <Chip size="sm" variant="flat" className={styles.resultItemBadge}>
                              {result.resultType}
                            </Chip>
                          )}
                        </div>
                        <div className="text-xs text-default-400 mb-2 flex items-center gap-1">
                          <Clock size={12} />
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                        <div className={styles.resultItemContent}>
                          {typeof result.result === 'object' 
                            ? JSON.stringify(result.result, null, 2)
                            : String(result.result)}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={resultsEndRef} />
                </div>
              )}
            </ScrollShadow>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedControlPanel;
