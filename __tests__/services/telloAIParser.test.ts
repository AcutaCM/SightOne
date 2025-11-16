/**
 * Tello AI 解析器测试
 */

import { TelloAIParser, AIConfig, DroneCommand } from '@/lib/services/telloAIParser';

describe('TelloAIParser', () => {
  let parser: TelloAIParser;
  let mockConfig: AIConfig;

  beforeEach(() => {
    mockConfig = {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'test-key',
      temperature: 0.1,
      maxTokens: 1000
    };

    parser = new TelloAIParser(mockConfig);
  });

  describe('parseAIResponse', () => {
    it('应该正确解析标准 JSON 响应', () => {
      const response = JSON.stringify({
        commands: [
          {
            action: 'takeoff',
            params: {},
            description: '起飞'
          },
          {
            action: 'forward',
            params: { distance: 100 },
            description: '向前飞行 100cm'
          }
        ],
        safety_checks: ['检查电池电量', '检查周围环境'],
        estimated_time: 15,
        battery_required: 25
      });

      const result = (parser as any).parseAIResponse(response);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.commands).toHaveLength(2);
      expect(result.data!.commands[0].action).toBe('takeoff');
      expect(result.data!.safety_checks).toHaveLength(2);
    });

    it('应该正确解析代码块中的 JSON', () => {
      const response = `这是一些文本
\`\`\`json
{
  "commands": [
    {
      "action": "land",
      "params": {},
      "description": "降落"
    }
  ],
  "safety_checks": [],
  "estimated_time": 5,
  "battery_required": 10
}
\`\`\`
更多文本`;

      const result = (parser as any).parseAIResponse(response);

      expect(result.success).toBe(true);
      expect(result.data!.commands).toHaveLength(1);
      expect(result.data!.commands[0].action).toBe('land');
    });

    it('应该处理无效的 JSON 响应', () => {
      const response = '这不是有效的 JSON';

      const result = (parser as any).parseAIResponse(response);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该标准化命令格式', () => {
      const response = JSON.stringify({
        commands: [
          {
            action: 'up',
            parameters: { distance: 50 }, // 使用 parameters 而不是 params
            description: '向上飞行'
          }
        ],
        safety_checks: [],
        estimated_time: 10,
        battery_required: 15
      });

      const result = (parser as any).parseAIResponse(response);

      expect(result.success).toBe(true);
      expect(result.data!.commands[0].params).toBeDefined();
      expect(result.data!.commands[0].params.distance).toBe(50);
    });
  });

  describe('validateCommands', () => {
    it('应该验证有效的命令', () => {
      const data = {
        commands: [
          {
            action: 'takeoff',
            params: {},
            description: '起飞'
          },
          {
            action: 'forward',
            params: { distance: 100 },
            description: '向前飞行'
          }
        ],
        safety_checks: [],
        estimated_time: 15,
        battery_required: 25
      };

      const result = (parser as any).validateCommands(data);

      expect(result.success).toBe(true);
    });

    it('应该拒绝空命令列表', () => {
      const data = {
        commands: [],
        safety_checks: [],
        estimated_time: 0,
        battery_required: 0
      };

      const result = (parser as any).validateCommands(data);

      expect(result.success).toBe(false);
      expect(result.error).toContain('命令列表为空');
    });

    it('应该验证距离参数范围', () => {
      const data = {
        commands: [
          {
            action: 'forward',
            params: { distance: 1000 }, // 超出范围
            description: '向前飞行'
          }
        ],
        safety_checks: [],
        estimated_time: 10,
        battery_required: 20
      };

      const result = (parser as any).validateCommands(data);

      expect(result.success).toBe(false);
      expect(result.error).toContain('距离参数无效');
    });

    it('应该验证角度参数范围', () => {
      const data = {
        commands: [
          {
            action: 'cw',
            params: { degrees: 400 }, // 超出范围
            description: '顺时针旋转'
          }
        ],
        safety_checks: [],
        estimated_time: 5,
        battery_required: 10
      };

      const result = (parser as any).validateCommands(data);

      expect(result.success).toBe(false);
      expect(result.error).toContain('角度参数无效');
    });
  });

  describe('estimateTime', () => {
    it('应该正确估算起飞和降落时间', () => {
      const commands: DroneCommand[] = [
        { action: 'takeoff', params: {}, description: '起飞' },
        { action: 'land', params: {}, description: '降落' }
      ];

      const time = (parser as any).estimateTime(commands);

      expect(time).toBe(10); // 5 + 5
    });

    it('应该根据距离估算移动时间', () => {
      const commands: DroneCommand[] = [
        { action: 'forward', params: { distance: 100 }, description: '向前' }
      ];

      const time = (parser as any).estimateTime(commands);

      expect(time).toBeGreaterThan(0);
    });

    it('应该根据角度估算旋转时间', () => {
      const commands: DroneCommand[] = [
        { action: 'cw', params: { degrees: 180 }, description: '旋转' }
      ];

      const time = (parser as any).estimateTime(commands);

      expect(time).toBeGreaterThan(0);
    });
  });

  describe('estimateBattery', () => {
    it('应该估算基本命令的电量消耗', () => {
      const commands: DroneCommand[] = [
        { action: 'takeoff', params: {}, description: '起飞' },
        { action: 'land', params: {}, description: '降落' }
      ];

      const battery = (parser as any).estimateBattery(commands);

      expect(battery).toBeGreaterThan(0);
      expect(battery).toBeLessThanOrEqual(100);
    });

    it('应该根据距离估算移动电量消耗', () => {
      const commands: DroneCommand[] = [
        { action: 'forward', params: { distance: 200 }, description: '向前' }
      ];

      const battery = (parser as any).estimateBattery(commands);

      expect(battery).toBeGreaterThan(0);
    });

    it('应该包含安全余量', () => {
      const commands: DroneCommand[] = [
        { action: 'takeoff', params: {}, description: '起飞' }
      ];

      const battery = (parser as any).estimateBattery(commands);

      expect(battery).toBeGreaterThanOrEqual(15); // 5 + 10 (安全余量)
    });

    it('应该限制最大电量为 100%', () => {
      const commands: DroneCommand[] = Array(50).fill({
        action: 'forward',
        params: { distance: 500 },
        description: '向前'
      });

      const battery = (parser as any).estimateBattery(commands);

      expect(battery).toBeLessThanOrEqual(100);
    });
  });

  describe('updateConfig', () => {
    it('应该更新配置', () => {
      const newConfig = {
        model: 'gpt-3.5-turbo',
        temperature: 0.5
      };

      parser.updateConfig(newConfig);

      expect((parser as any).config.model).toBe('gpt-3.5-turbo');
      expect((parser as any).config.temperature).toBe(0.5);
      expect((parser as any).config.provider).toBe('openai'); // 保持原有配置
    });
  });
});
