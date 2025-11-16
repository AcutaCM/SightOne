import { useState, useCallback } from 'react';

export interface ChallengeScore {
  taskType: '8_flight' | 'obstacle' | 'precision_land';
  score: number;
  completionTime: number;
  details: Record<string, any>;
  timestamp: Date;
}

export interface ChallengeScoreStats {
  totalTasks: number;
  averageScore: number;
  totalTime: number;
  bestScore: number;
  worstScore: number;
  scoresByTask: Record<string, number[]>;
}

export function useChallengeScores() {
  const [scores, setScores] = useState<ChallengeScore[]>([]);

  /**
   * Add a new score
   */
  const addScore = useCallback((score: Omit<ChallengeScore, 'timestamp'>) => {
    const newScore: ChallengeScore = {
      ...score,
      timestamp: new Date(),
    };
    setScores((prev) => [...prev, newScore]);
  }, []);

  /**
   * Clear all scores
   */
  const clearScores = useCallback(() => {
    setScores([]);
  }, []);

  /**
   * Get scores for a specific task type
   */
  const getScoresByTask = useCallback((taskType: string) => {
    return scores.filter((s) => s.taskType === taskType);
  }, [scores]);

  /**
   * Calculate statistics
   */
  const getStats = useCallback((): ChallengeScoreStats => {
    if (scores.length === 0) {
      return {
        totalTasks: 0,
        averageScore: 0,
        totalTime: 0,
        bestScore: 0,
        worstScore: 0,
        scoresByTask: {},
      };
    }

    const scoreValues = scores.map((s) => s.score);
    const totalTime = scores.reduce((sum, s) => sum + s.completionTime, 0);
    const averageScore = scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length;
    const bestScore = Math.max(...scoreValues);
    const worstScore = Math.min(...scoreValues);

    // Group scores by task type
    const scoresByTask: Record<string, number[]> = {};
    scores.forEach((score) => {
      if (!scoresByTask[score.taskType]) {
        scoresByTask[score.taskType] = [];
      }
      scoresByTask[score.taskType].push(score.score);
    });

    return {
      totalTasks: scores.length,
      averageScore,
      totalTime,
      bestScore,
      worstScore,
      scoresByTask,
    };
  }, [scores]);

  /**
   * Get improvement trend
   */
  const getImprovementTrend = useCallback((taskType?: string) => {
    const relevantScores = taskType
      ? scores.filter((s) => s.taskType === taskType)
      : scores;

    if (relevantScores.length < 2) {
      return 0; // No trend
    }

    // Calculate linear regression slope
    const n = relevantScores.length;
    const xSum = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const ySum = relevantScores.reduce((sum, s) => sum + s.score, 0);
    const xySum = relevantScores.reduce((sum, s, i) => sum + i * s.score, 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);

    return slope; // Positive = improving, Negative = declining
  }, [scores]);

  /**
   * Export scores as JSON
   */
  const exportScores = useCallback(() => {
    const dataStr = JSON.stringify(scores, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `challenge-scores-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [scores]);

  /**
   * Import scores from JSON
   */
  const importScores = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        const validScores = imported.map((s) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
        setScores(validScores);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import scores:', error);
      return false;
    }
  }, []);

  return {
    scores,
    addScore,
    clearScores,
    getScoresByTask,
    getStats,
    getImprovementTrend,
    exportScores,
    importScores,
  };
}
