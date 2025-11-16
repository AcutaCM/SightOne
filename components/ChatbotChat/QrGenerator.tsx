"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { getCardPanelStyle } from "@/lib/panel-styles";

type Props = {
  defaultText?: string;
  onClose?: () => void;
};

const ERROR_LEVELS = [
  { label: "L (7%)", value: "L" },
  { label: "M (15%)", value: "M" },
  { label: "Q (25%)", value: "Q" },
  { label: "H (30%)", value: "H" },
];

const QrGenerator: React.FC<Props> = ({ defaultText = "", onClose }) => {
  const { theme } = useTheme();
  const [text, setText] = useState<string>(defaultText);
  const [size, setSize] = useState<number>(240);
  const [margin, setMargin] = useState<number>(2);
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  
  // Get unified card panel style
  const cardStyle = useMemo(() => {
    return getCardPanelStyle(theme as 'light' | 'dark' || 'dark');
  }, [theme]);

  // 使用公开服务生成二维码图片（无需依赖）
  const imgUrl = useMemo(() => {
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    const params = new URLSearchParams({
      size: `${Math.max(64, Math.min(1024, size))}x${Math.max(64, Math.min(1024, size))}`,
      data: text || "",
      margin: String(Math.max(0, Math.min(16, margin))),
      ecc,
      qzone: String(Math.max(0, Math.min(16, margin))), // 兼容参数名
      format: "png",
    });
    return `${base}?${params.toString()}`;
  }, [text, size, margin, ecc]);

  const onDownload = async () => {
    try {
      if (!text) {
        toast.warning("请输入要编码的文本或植株ID");
        return;
      }
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safe = text.replace(/[^\w\-]+/g, "_").slice(0, 32) || "qr";
      a.download = `${safe}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("已下载二维码 PNG");
    } catch (e:any) {
      toast.error(`下载失败：${e?.message || String(e)}`);
    }
  };

  return (
    <Card className="w-full" style={cardStyle}>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">二维码生成器</span>
          <Chip size="sm" variant="flat">即时预览</Chip>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" onPress={() => setText("")}>清空</Button>
          <Button size="sm" color="primary" onPress={onDownload}>下载PNG</Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
      {/* 左侧：参数与输入 */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-xs text-default-500 mb-1">文本 / 植株ID</div>
          <Textarea
            minRows={3}
            maxRows={6}
            placeholder="输入要编码为二维码的内容，例如：plant-000123"
            value={text}
            onValueChange={setText}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-default-500 mb-1">尺寸（px）</div>
            <Input
              type="number"
              min={64}
              max={1024}
              value={String(size)}
              onValueChange={(v) => setSize(Number(v) || 240)}
            />
          </div>
          <div>
            <div className="text-xs text-default-500 mb-1">边距</div>
            <Input
              type="number"
              min={0}
              max={16}
              value={String(margin)}
              onValueChange={(v) => setMargin(Number(v) || 2)}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-default-500 mb-1">纠错级别</div>
          <Select
            selectedKeys={[ecc]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as "L" | "M" | "Q" | "H";
              setEcc(selected);
            }}
          >
            {ERROR_LEVELS.map((level) => (
              <SelectItem key={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Divider className="my-2" />

        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => {
              navigator.clipboard.writeText(text || "");
              toast.success("已复制文本");
            }}
          >
            复制文本
          </Button>
          <Tooltip content="关闭生成器">
            <Button variant="flat" onPress={onClose}>关闭</Button>
          </Tooltip>
        </div>
      </div>

      {/* 右侧：二维码预览 */}
      <div className="flex items-center justify-center">
        <div
          className="rounded-xl border border-divider bg-content2 flex items-center justify-center overflow-hidden"
          style={{ width: size, height: size }}
        >
          {text ? (
            <img
              src={imgUrl}
              alt="qr"
              className="block w-full h-full object-contain"
            />
          ) : (
            <div className="text-default-400">请输入内容</div>
          )}
        </div>
      </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default QrGenerator;