"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";

interface QRCooldownSettingsProps {
  onSetCooldown: (seconds: number) => void;
  onClearCooldowns: () => void;
  currentCooldown?: number;
}

export default function QRCooldownSettings({
  onSetCooldown,
  onClearCooldowns,
  currentCooldown = 60
}: QRCooldownSettingsProps) {
  const [cooldownValue, setCooldownValue] = useState<string>(currentCooldown.toString());
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleCooldownChange = (value: string) => {
    setCooldownValue(value);
    const num = parseInt(value);
    setIsValid(!isNaN(num) && num >= 0);
  };

  const handleApply = () => {
    const num = parseInt(cooldownValue);
    if (!isNaN(num) && num >= 0) {
      onSetCooldown(num);
    }
  };

  const presetValues = [10, 30, 60, 120, 300];

  return (
    <Card className="w-full h-full bg-background/60 backdrop-blur-sm border border-divider rounded-[21px]">
      <CardBody className="p-6">
        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              QR扫描冷却设置
            </h3>
            <p className="text-sm text-foreground/60">
              防止重复扫描同一植株ID
            </p>
          </div>

          {/* 当前设置 */}
          <div className="bg-content2 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">当前冷却时间</span>
              <span className="text-lg font-bold text-primary">{currentCooldown}秒</span>
            </div>
          </div>

          {/* 输入框 */}
          <div>
            <Input
              type="number"
              label="冷却时间（秒）"
              placeholder="输入冷却时间"
              value={cooldownValue}
              onValueChange={handleCooldownChange}
              min={0}
              isInvalid={!isValid}
              errorMessage={!isValid ? "请输入有效的数字（≥0）" : ""}
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70"
              }}
            />
          </div>

          {/* 快捷按钮 */}
          <div>
            <p className="text-sm text-foreground/70 mb-2">快捷设置</p>
            <div className="flex flex-wrap gap-2">
              {presetValues.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={parseInt(cooldownValue) === value ? "solid" : "bordered"}
                  color={parseInt(cooldownValue) === value ? "primary" : "default"}
                  onPress={() => handleCooldownChange(value.toString())}
                  className="min-w-fit"
                >
                  {value}秒
                </Button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              color="primary"
              onPress={handleApply}
              isDisabled={!isValid}
              className="flex-1"
            >
              应用设置
            </Button>
            <Button
              color="warning"
              variant="bordered"
              onPress={onClearCooldowns}
              className="flex-1"
            >
              清空冷却
            </Button>
          </div>

          {/* 说明 */}
          <div className="bg-content2 rounded-lg p-3">
            <p className="text-xs text-foreground/60 leading-relaxed">
              💡 <strong>提示：</strong>
              <br />
              • 设置为0秒可禁用冷却功能
              <br />
              • 建议设置30-120秒避免重复扫描
              <br />
              • 清空冷却将立即允许所有植株重新扫描
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
