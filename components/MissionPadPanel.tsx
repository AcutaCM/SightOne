import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";

interface MissionPadPanelProps {
  isConnected: boolean;
  onStartMission: (params: { rounds: number; height: number; stayDuration: number }) => void;
  onStopMission: () => void;
  missionActive?: boolean;
}

const MissionPadPanel: React.FC<MissionPadPanelProps> = ({
  isConnected,
  onStartMission,
  onStopMission,
  missionActive = false,
}) => {
  const [rounds, setRounds] = useState<number>(3);
  const [height, setHeight] = useState<number>(100);
  const [stayDuration, setStayDuration] = useState<number>(5);

  const handleStartMission = () => {
    onStartMission({ rounds, height, stayDuration });
  };

  return (
    <Card className="h-full bg-content1 border-divider shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]">
      <CardBody className="p-5 h-full flex flex-col">
        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-foreground font-extrabold text-[20px] leading-[27px]">
            挑战卡任务控制
          </h2>
          <p className="text-foreground/80 font-extrabold text-[20px] leading-[27px]">
            MISSIONPAD
          </p>
        </div>
        
        {/* 输入框区域 */}
        <div className="flex-1 space-y-4">
          {/* 第一行：任务轮次和执行高度 */}
          <div className="flex gap-4">
            <Input
              label="任务轮次"
              labelPlacement="inside"
              variant="bordered"
              color="primary"
              size="sm"
              radius="md"
              className="flex-1"
              type="number"
              value={rounds.toString()}
              onChange={(e) => setRounds(Number(e.target.value) || 3)}
              min={1}
              max={10}
            />
            <Input
              label="执行高度(cm)"
              labelPlacement="inside"
              variant="bordered"
              color="primary"
              size="sm"
              radius="md"
              className="flex-1"
              type="number"
              value={height.toString()}
              onChange={(e) => setHeight(Number(e.target.value) || 100)}
              min={50}
              max={200}
            />
          </div>
          
          {/* 第二行：卡停留时间 */}
          <Input
            label="卡停留时间(s)"
            labelPlacement="inside"
            variant="bordered"
            color="primary"
            size="sm"
            radius="md"
            className="w-full"
            type="number"
            value={stayDuration.toString()}
            onChange={(e) => setStayDuration(Number(e.target.value) || 5)}
            min={1}
            max={20}
          />
        </div>
        
        {/* 按钮区域 */}
        <div className="flex gap-3 mt-6">
          <Button
            color={missionActive ? "warning" : "primary"}
            variant="bordered"
            size="lg"
            radius="lg"
            className="flex-1 h-[48px] font-medium"
            onPress={handleStartMission}
            isDisabled={!isConnected || missionActive}
          >
            {missionActive ? "任务进行中..." : "开始任务"}
          </Button>
          <Button
            color="danger"
            variant="bordered"
            size="lg"
            radius="lg"
            className="flex-1 h-[48px] font-medium"
            onPress={onStopMission}
            isDisabled={!isConnected || !missionActive}
          >
            停止任务
          </Button>
        </div>
        
        {/* 状态徽章 */}
        <Badge
          color={missionActive ? "warning" : "success"}
          variant="shadow"
          size="sm"
          className="absolute top-4 right-4"
        >
          {missionActive ? "运行中" : "就绪"}
        </Badge>
      </CardBody>
    </Card>
  );
};

export default MissionPadPanel;