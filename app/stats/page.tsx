'use client';

/**
 * 使用统计页面
 * 显示智能代理助理的详细使用统计
 */

import React, { useState } from 'react';
import { Card, CardBody, Select, SelectItem } from '@heroui/react';
import { UsageStatsPanel } from '@/components/UsageStatsPanel';
import { useAssistants } from '@/contexts/AssistantContext';
import { Assistant } from '@/types/assistant';

export default function StatsPage() {
  const { assistantList } = useAssistants();
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(
    'tello-intelligent-agent'
  );

  // 过滤出已发布的助理
  const publishedAssistants = assistantList.filter(
    (a: Assistant) => a.status === 'published'
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">使用统计</h1>
        <p className="text-default-500">
          查看助理的使用情况、性能指标和常用命令
        </p>
      </div>

      {/* 助理选择器 */}
      {publishedAssistants.length > 1 && (
        <Card className="mb-6">
          <CardBody>
            <Select
              label="选择助理"
              selectedKeys={[selectedAssistantId]}
              onChange={(e) => setSelectedAssistantId(e.target.value)}
              className="max-w-xs"
            >
              {publishedAssistants.map((assistant: Assistant) => (
                <SelectItem key={assistant.id}>
                  {assistant.emoji} {assistant.title}
                </SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>
      )}

      {/* 统计面板 */}
      <UsageStatsPanel assistantId={selectedAssistantId} />
    </div>
  );
}
