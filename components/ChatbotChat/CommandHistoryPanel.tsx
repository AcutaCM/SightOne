'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { History } from 'lucide-react';

interface CommandHistoryPanelProps {
  history?: Array<{
    id: string;
    command: string;
    timestamp: number;
    status: 'success' | 'error' | 'pending';
  }>;
  onSelectCommand?: (command: string) => void;
}

const CommandHistoryPanel: React.FC<CommandHistoryPanelProps> = ({
  history = [],
  onSelectCommand
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-2 items-center">
        <History size={20} />
        <span className="font-semibold">命令历史</span>
      </CardHeader>
      <CardBody>
        {history.length === 0 ? (
          <div className="text-center text-default-400 py-4">
            暂无历史记录
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-default-100 hover:bg-default-200 cursor-pointer transition-colors"
                onClick={() => onSelectCommand?.(item.command)}
              >
                <div className="text-sm font-medium">{item.command}</div>
                <div className="text-xs text-default-400 mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                  <span className={`ml-2 ${
                    item.status === 'success' ? 'text-success' :
                    item.status === 'error' ? 'text-danger' :
                    'text-warning'
                  }`}>
                    {item.status === 'success' ? '✓' :
                     item.status === 'error' ? '✗' : '⋯'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CommandHistoryPanel;
