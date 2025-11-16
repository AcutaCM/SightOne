/**
 * 测试用的 Mock 数据
 */

// Mock 用户数据
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user' as const,
}

export const mockAdminUser = {
  id: '2',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin' as const,
}

// Mock 无人机状态
export const mockDroneStatus = {
  connected: true,
  battery: 85,
  altitude: 10,
  speed: 5,
  temperature: 25,
}

// Mock 日志条目
export const mockLogEntries = [
  {
    id: '1',
    timestamp: '2025-10-18T10:00:00Z',
    level: 'info' as const,
    category: 'system',
    message: '系统启动成功',
  },
  {
    id: '2',
    timestamp: '2025-10-18T10:01:00Z',
    level: 'warning' as const,
    category: 'drone',
    message: '电池电量低于 20%',
  },
  {
    id: '3',
    timestamp: '2025-10-18T10:02:00Z',
    level: 'error' as const,
    category: 'connection',
    message: '连接超时',
  },
]

// Mock 工作流数据
export const mockWorkflow = {
  id: '1',
  name: '测试工作流',
  description: '这是一个测试工作流',
  nodes: [],
  edges: [],
  createdAt: '2025-10-18T10:00:00Z',
  updatedAt: '2025-10-18T10:00:00Z',
}

// Mock 分析报告
export const mockAnalysisReport = {
  id: '1',
  timestamp: '2025-10-18T10:00:00Z',
  type: 'strawberry',
  results: {
    total: 10,
    ripe: 6,
    unripe: 4,
  },
  images: [],
}
