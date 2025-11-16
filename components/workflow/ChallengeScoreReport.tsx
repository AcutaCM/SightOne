import React from 'react';
import { Trophy, Clock, Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export interface ChallengeScore {
  taskType: '8_flight' | 'obstacle' | 'precision_land';
  score: number;
  completionTime: number;
  details: Record<string, any>;
  timestamp: Date;
}

interface ChallengeScoreReportProps {
  scores: ChallengeScore[];
  onClose?: () => void;
}

export const ChallengeScoreReport: React.FC<ChallengeScoreReportProps> = ({ scores, onClose }) => {
  const getTaskName = (taskType: string) => {
    switch (taskType) {
      case '8_flight': return '8字飞行';
      case 'obstacle': return '穿越障碍';
      case 'precision_land': return '精准降落';
      default: return taskType;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const averageScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    : 0;

  const totalTime = scores.reduce((sum, s) => sum + s.completionTime, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E3A5F] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">挑战卡任务评分报告</h2>
                <p className="text-gray-300 text-sm mt-1">
                  完成时间: {new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A192F] rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm">平均评分</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              等级: {getScoreGrade(averageScore)}
            </div>
          </div>

          <div className="bg-[#0A192F] rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-300 text-sm">总用时</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {totalTime.toFixed(1)}s
            </div>
            <div className="text-gray-400 text-sm mt-1">
              平均: {(totalTime / scores.length).toFixed(1)}s
            </div>
          </div>

          <div className="bg-[#0A192F] rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">完成任务</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {scores.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              成功率: 100%
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">详细评分</h3>
          
          {scores.map((score, index) => (
            <div
              key={index}
              className="bg-[#0A192F] rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{getTaskName(score.taskType)}</h4>
                  <p className="text-gray-400 text-sm">
                    {score.timestamp.toLocaleTimeString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                    {score.score.toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {getScoreGrade(score.score)} 级
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">完成时间</div>
                  <div className="text-white font-medium">
                    {score.completionTime.toFixed(1)}s
                  </div>
                </div>

                {/* Task-specific details */}
                {score.taskType === '8_flight' && (
                  <>
                    <div>
                      <div className="text-gray-400">循环次数</div>
                      <div className="text-white font-medium">
                        {score.details.loops_completed || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">轨迹点数</div>
                      <div className="text-white font-medium">
                        {score.details.trajectory_points || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">平均偏差</div>
                      <div className="text-white font-medium">
                        {(score.details.average_deviation || 0).toFixed(1)}cm
                      </div>
                    </div>
                  </>
                )}

                {score.taskType === 'obstacle' && (
                  <>
                    <div>
                      <div className="text-gray-400">通过障碍</div>
                      <div className="text-white font-medium">
                        {score.details.obstacles_cleared || 0}/{score.details.total_obstacles || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">成功率</div>
                      <div className="text-white font-medium">
                        {(score.details.success_rate || 0).toFixed(0)}%
                      </div>
                    </div>
                  </>
                )}

                {score.taskType === 'precision_land' && (
                  <>
                    <div>
                      <div className="text-gray-400">最终误差</div>
                      <div className="text-white font-medium">
                        {(score.details.final_error || 0).toFixed(1)}cm
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">尝试次数</div>
                      <div className="text-white font-medium">
                        {score.details.attempts || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">精度达标</div>
                      <div className="text-white font-medium">
                        {score.details.precision_achieved ? '是' : '否'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      score.score >= 90 ? 'bg-green-500' :
                      score.score >= 70 ? 'bg-cyan-500' :
                      score.score >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${score.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#0A192F]/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              继续努力，挑战更高分数！
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
