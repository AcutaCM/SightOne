'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * 挑戰卡任務狀態 Context
 * 用於控制診斷工作流是否激活
 */

interface MissionContextType {
  isMissionActive: boolean;
  missionType: 'challenge_cruise' | 'diagnosis' | null;
  missionParams: {
    rounds?: number;
    height?: number;
    stayDuration?: number;
  };
  
  startDiagnosisMission: () => void;
  stopDiagnosisMission: () => void;
  startChallengeCruise: (params: { rounds: number; height: number; stayDuration: number }) => void;
  stopChallengeCruise: () => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMissionActive, setIsMissionActive] = useState(false);
  const [missionType, setMissionType] = useState<'challenge_cruise' | 'diagnosis' | null>(null);
  const [missionParams, setMissionParams] = useState<{
    rounds?: number;
    height?: number;
    stayDuration?: number;
  }>({});

  const startDiagnosisMission = useCallback(() => {
    setIsMissionActive(true);
    setMissionType('diagnosis');
    console.log('✅ 診斷任務已啟動');
  }, []);

  const stopDiagnosisMission = useCallback(() => {
    setIsMissionActive(false);
    setMissionType(null);
    setMissionParams({});
    console.log('⛔ 診斷任務已停止');
  }, []);

  const startChallengeCruise = useCallback((params: { rounds: number; height: number; stayDuration: number }) => {
    setIsMissionActive(true);
    setMissionType('challenge_cruise');
    setMissionParams(params);
    console.log('✅ 挑戰卡巡航任務已啟動', params);
  }, []);

  const stopChallengeCruise = useCallback(() => {
    setIsMissionActive(false);
    setMissionType(null);
    setMissionParams({});
    console.log('⛔ 挑戰卡巡航任務已停止');
  }, []);

  return (
    <MissionContext.Provider
      value={{
        isMissionActive,
        missionType,
        missionParams,
        startDiagnosisMission,
        stopDiagnosisMission,
        startChallengeCruise,
        stopChallengeCruise,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within MissionProvider');
  }
  return context;
};

