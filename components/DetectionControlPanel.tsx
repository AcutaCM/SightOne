import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Switch } from "@heroui/switch";

interface DetectionControlPanelProps {
  isConnected: boolean;
  onStartDetection: () => void;
  onConfigAPI: () => void;
  rippleDetectionEnabled: boolean;
  qrDetectionEnabled: boolean;
  diagnosisWorkflowEnabled: boolean;
  onRippleDetectionChange: (enabled: boolean) => void;
  onQRDetectionChange: (enabled: boolean) => void;
  onDiagnosisWorkflowChange: (enabled: boolean) => void;
  startRippleDetection: () => void;
  stopRippleDetection: () => void;
  startQRDetection: () => void;
  stopQRDetection: () => void;
  startDiagnosisWorkflow: () => void;
  stopDiagnosisWorkflow: () => void;
  // 新增：从videoStream.detectionStatus获取的实际状态
  detectionStatus?: {
    qr_enabled: boolean;
    strawberry_enabled: boolean;
    diagnosis_workflow_enabled: boolean;
  };
}

const DetectionControlPanel: React.FC<DetectionControlPanelProps> = ({
  isConnected,
  onStartDetection,
  onConfigAPI,
  rippleDetectionEnabled,
  qrDetectionEnabled,
  onRippleDetectionChange,
  onQRDetectionChange,
  startRippleDetection,
  stopRippleDetection,
  startQRDetection,
  stopQRDetection,
  diagnosisWorkflowEnabled,
  onDiagnosisWorkflowChange,
  startDiagnosisWorkflow,
  stopDiagnosisWorkflow,
  detectionStatus,
}) => {
  const { user } = useAuth();
  
  // 使用后端返回的实际状态（如果可用），否则使用本地状态
  const actualRippleEnabled = detectionStatus?.strawberry_enabled ?? rippleDetectionEnabled;
  const actualQREnabled = detectionStatus?.qr_enabled ?? qrDetectionEnabled;
  const actualDiagnosisEnabled = detectionStatus?.diagnosis_workflow_enabled ?? diagnosisWorkflowEnabled;

  return (
    <Card className="w-full h-full bg-content1 border-divider">
      <CardBody className="p-[4%] flex flex-col h-full">
        {/* 标题 */}
        <div className="mb-[6%]">
          <h2 className="text-foreground font-extrabold text-[1.25rem] leading-tight">
            检测控制
          </h2>
          <p className="text-foreground/80 font-extrabold text-[1.25rem] leading-tight">
            DETECTION CONTROL
          </p>
        </div>
        
        {/* 检测区域 */}
        <div className="flex gap-[3%] mb-[6%] flex-1">
          {/* 诊断工作流 - 仅管理员可见 */}
          {user?.role === 'admin' && (
            <div className="relative flex-1 bg-content2 rounded-[9px] p-[4%] border-2 border-primary/50">
              <div className="text-foreground font-semibold text-[1.25rem] leading-tight">
                <div>诊断工作流</div>
                <div className="text-foreground/80 text-[0.875rem] mt-1">DIAGNOSIS WORKFLOW</div>
              </div>
              <div className="absolute bottom-[4%] left-1/2 transform -translate-x-1/2">
                <Switch
                  size="sm"
                  color="primary"
                  isSelected={actualDiagnosisEnabled}
                  onValueChange={(enabled) => {
                    onDiagnosisWorkflowChange(enabled);
                    if (enabled) {
                      startDiagnosisWorkflow();
                      // 注意：后端会自动启用QR和草莓检测，UI会通过detection_status消息更新
                    } else {
                      stopDiagnosisWorkflow();
                    }
                  }}
                  isDisabled={!isConnected}
                />
              </div>
              <Badge
                color="danger"
                variant="shadow"
                size="sm"
                className="absolute top-[4%] right-[4%]"
              >
                Admin
              </Badge>
            </div>
          )}

          {/* 草莓成熟度检测 */}
          <div className="relative flex-1 bg-content2 rounded-[9px] p-[4%]">
            <div className="text-foreground font-normal text-[1.25rem] leading-tight">
              <div>草莓成熟度检测</div>
              <div className="text-foreground/80 text-[0.875rem] mt-1">RIPPLE DETECTION</div>
            </div>
            
            {/* 开关 */}
            <div className="absolute bottom-[4%] left-1/2 transform -translate-x-1/2">
              <Switch
                size="sm"
                color="primary"
                isSelected={actualRippleEnabled}
                onValueChange={(enabled) => {
                  onRippleDetectionChange(enabled);
                  if (enabled) {
                    startRippleDetection();
                  } else {
                    stopRippleDetection();
                  }
                }}
                isDisabled={!isConnected}
              />
            </div>
            
            {/* 徽章 */}
            <Badge
              color="success"
              variant="shadow"
              size="sm"
              className="absolute top-[4%] right-[4%]"
            >
              5
            </Badge>
          </div>
          
          {/* QR码检测 */}
          <div className="relative flex-1 bg-content2 rounded-[9px] p-[4%]">
            <div className="text-foreground font-semibold text-[1.25rem] leading-tight">
              <div>QR码检测</div>
              <div className="text-foreground/80 text-[0.875rem] mt-1">QR DETECTION</div>
            </div>
            
            {/* 开关 */}
            <div className="absolute bottom-[4%] left-1/2 transform -translate-x-1/2">
              <Switch
                size="sm"
                color="primary"
                isSelected={actualQREnabled}
                onValueChange={(enabled) => {
                  onQRDetectionChange(enabled);
                  if (enabled) {
                    startQRDetection();
                  } else {
                    stopQRDetection();
                  }
                }}
                isDisabled={!isConnected}
              />
            </div>
            
            {/* 徽章 */}
            <Badge
              color="default"
              variant="shadow"
              size="sm"
              className="absolute top-[4%] right-[4%]"
            >
              5
            </Badge>
          </div>
        </div>
        
        {/* API配置按钮 */}
        <Button
          color="primary"
          variant="bordered"
          size="lg"
          radius="lg"
          className="w-full font-normal"
          style={{height: 'min(12%, 48px)'}}
          onPress={onConfigAPI}
          isDisabled={!isConnected}
        >
          API配置
        </Button>
      </CardBody>
    </Card>
  );
};

export default DetectionControlPanel;