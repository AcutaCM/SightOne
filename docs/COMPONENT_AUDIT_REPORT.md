# 组件审计报告

生成时间: 2025/10/18 23:26:52

## 📊 总体统计

- **总组件数**: 87
- **已使用 HeroUI**: 44 (51%)
- **使用 NextUI**: 4
- **使用 Ant Design**: 3
- **使用 Material-UI**: 0
- **自定义实现**: 33
- **混合使用**: 3

**预计总工作量**: 158 小时 (20 工作日)

## 🎯 高优先级组件（需要迁移）

| 组件名 | 当前库 | 预计工时 | 文件路径 |
|--------|--------|----------|----------|
| index.tsx | antd | 50h | components\ChatbotChat\index.tsx |
| ReportPanel.tsx | mixed | 11h | components\ReportPanel.tsx |
| SimulationPanel.tsx | mixed | 8h | components\SimulationPanel.tsx |
| VideoControlPanel.tsx | mixed | 8h | components\VideoControlPanel.tsx |
| AIAnalysisReport.tsx | nextui | 7h | components\AIAnalysisReport.tsx |
| SettingsModal.tsx | antd | 4h | components\SettingsModal.tsx |
| QrGenerator.tsx | antd | 3h | components\ChatbotChat\QrGenerator.tsx |
| DronePositionPanel.tsx | nextui | 3h | components\DronePositionPanel.tsx |
| SizeControl.tsx | nextui | 3h | components\SizeControl.tsx |
| VirtualPositionView.tsx | nextui | 2h | components\VirtualPositionView.tsx |

## 📝 中优先级组件（自定义实现）

| 组件名 | 预计工时 | 文件路径 |
|--------|----------|----------|
| AIAnalysisManager.tsx | 4h | components\AIAnalysisManager.tsx |
| DraggableContainer.tsx | 4h | components\DraggableContainer.tsx |
| icons.tsx | 4h | components\icons.tsx |
| BatteryStatusPanel.tsx | 3h | components\BatteryStatusPanel.tsx |
| DecryptedText.tsx | 3h | components\DecryptedText.tsx |
| GlobalKnowledgeModal.tsx | 3h | components\GlobalKnowledgeModal.tsx |
| AnimatedList.tsx | 3h | components\ui\AnimatedList.tsx |
| ReportPanel.tsx | 2h | components\ChatbotChat\ReportPanel.tsx |
| DarkVeil.tsx | 2h | components\DarkVeil.tsx |
| DiagnosisReportViewer.tsx | 2h | components\DiagnosisReportViewer.tsx |
| DropZones.tsx | 2h | components\layout\DropZones.tsx |
| ManualControlPanel.tsx | 2h | components\ManualControlPanel.tsx |
| MessageMarkdown.tsx | 2h | components\markdown\MessageMarkdown.tsx |
| TextType.tsx | 2h | components\TextType.tsx |
| TrueFocus.tsx | 2h | components\TrueFocus.tsx |
| WorkflowEditor.tsx | 2h | components\WorkflowEditor.tsx |
| ChatDock.tsx | 1h | components\ChatDock.tsx |
| ControlStatusPanel.tsx | 1h | components\ControlStatusPanel.tsx |
| GridSystem.tsx | 1h | components\GridSystem.tsx |
| InternalDraggable.tsx | 1h | components\InternalDraggable.tsx |
| BackgroundLayer.tsx | 1h | components\login\BackgroundLayer.tsx |
| BrandingSection.tsx | 1h | components\login\BrandingSection.tsx |
| FeatureCard.tsx | 1h | components\login\FeatureCard.tsx |
| PageTransition.tsx | 1h | components\PageTransition.tsx |
| SnapLines.tsx | 1h | components\SnapLines.tsx |
| StatusNode.tsx | 1h | components\StatusNode.tsx |
| TaskNodeLibrary.tsx | 1h | components\TaskNodeLibrary.tsx |
| BlockNode.tsx | 1h | components\TTBlock\BlockNode.tsx |
| badge.tsx | 1h | components\ui\badge.tsx |
| button.tsx | 1h | components\ui\button.tsx |
| card.tsx | 1h | components\ui\card.tsx |
| meteors.tsx | 1h | components\ui\meteors.tsx |
| WorkflowCanvas.tsx | 1h | components\WorkflowCanvas.tsx |

## ✅ 已完成组件（使用 HeroUI）

共 44 个组件已使用 HeroUI：

- AIAnalysisPanel.tsx
- AppInfoPanel.tsx
- AuthButtons.tsx
- ChallengeCruisePanel.tsx
- ComponentSelector.tsx
- ComponentSelectorButton.tsx
- ConfigurationPanel.tsx
- ConnectionControlPanel.tsx
- DemoReportGenerator.tsx
- DetectionControlPanel.tsx
- DroneControlPanel.tsx
- HelpPanel.tsx
- ComponentGroupManager.tsx
- LayoutControl.tsx
- LayoutToggle.tsx
- FormInput.tsx
- LoginCard.tsx
- PasswordInput.tsx
- MemoryPanel.tsx
- MissionPadPanel.tsx
- ModelSwitcher.tsx
- NodeConfigModal.tsx
- PlantAnalysisWorkflow.tsx
- PlantQRGeneratorPanel.tsx
- QRCooldownSettings.tsx
- QRScanPanel.tsx
- StatusInfoPanel.tsx
- StrawberryDetectionCard.tsx
- SystemLogPanel.tsx
- TelloControlPanel.tsx
- TelloIntelligentAgent.tsx
- TelloWorkflowPanel.tsx
- theme-switch.tsx
- ToolsPanel.tsx
- TopNavbar.tsx
- NodeConfigModal.tsx
- TTBlockPanel.tsx
- EnhancedModelSelector.tsx
- ModelManagerPanel.tsx
- ModelSelectorDemo.tsx
- UserMenu.tsx
- WorkflowManagerModal.tsx
- WorkflowPanel.tsx
- YOLOModelManager.tsx

## 📋 详细组件清单

### 按库分类

#### HEROUI

- **AIAnalysisPanel.tsx** (0h) - components\AIAnalysisPanel.tsx
- **AppInfoPanel.tsx** (0h) - components\AppInfoPanel.tsx
- **AuthButtons.tsx** (0h) - components\AuthButtons.tsx
- **ChallengeCruisePanel.tsx** (0h) - components\ChallengeCruisePanel.tsx
- **ComponentSelector.tsx** (0h) - components\ComponentSelector.tsx
- **ComponentSelectorButton.tsx** (0h) - components\ComponentSelectorButton.tsx
- **ConfigurationPanel.tsx** (0h) - components\ConfigurationPanel.tsx
- **ConnectionControlPanel.tsx** (0h) - components\ConnectionControlPanel.tsx
- **DemoReportGenerator.tsx** (0h) - components\DemoReportGenerator.tsx
- **DetectionControlPanel.tsx** (0h) - components\DetectionControlPanel.tsx
- **DroneControlPanel.tsx** (0h) - components\DroneControlPanel.tsx
- **HelpPanel.tsx** (0h) - components\HelpPanel.tsx
- **ComponentGroupManager.tsx** (0h) - components\layout\ComponentGroupManager.tsx
- **LayoutControl.tsx** (0h) - components\LayoutControl.tsx
- **LayoutToggle.tsx** (0h) - components\LayoutToggle.tsx
- **FormInput.tsx** (0h) - components\login\FormInput.tsx
- **LoginCard.tsx** (0h) - components\login\LoginCard.tsx
- **PasswordInput.tsx** (0h) - components\login\PasswordInput.tsx
- **MemoryPanel.tsx** (0h) - components\MemoryPanel.tsx
- **MissionPadPanel.tsx** (0h) - components\MissionPadPanel.tsx
- **ModelSwitcher.tsx** (0h) - components\ModelSwitcher.tsx
- **NodeConfigModal.tsx** (0h) - components\NodeConfigModal.tsx
- **PlantAnalysisWorkflow.tsx** (0h) - components\PlantAnalysisWorkflow.tsx
- **PlantQRGeneratorPanel.tsx** (0h) - components\PlantQRGeneratorPanel.tsx
- **QRCooldownSettings.tsx** (0h) - components\QRCooldownSettings.tsx
- **QRScanPanel.tsx** (0h) - components\QRScanPanel.tsx
- **StatusInfoPanel.tsx** (0h) - components\StatusInfoPanel.tsx
- **StrawberryDetectionCard.tsx** (0h) - components\StrawberryDetectionCard.tsx
- **SystemLogPanel.tsx** (0h) - components\SystemLogPanel.tsx
- **TelloControlPanel.tsx** (0h) - components\TelloControlPanel.tsx
- **TelloIntelligentAgent.tsx** (0h) - components\TelloIntelligentAgent.tsx
- **TelloWorkflowPanel.tsx** (0h) - components\TelloWorkflowPanel.tsx
- **theme-switch.tsx** (0h) - components\theme-switch.tsx
- **ToolsPanel.tsx** (0h) - components\ToolsPanel.tsx
- **TopNavbar.tsx** (0h) - components\TopNavbar.tsx
- **NodeConfigModal.tsx** (0h) - components\TTBlock\NodeConfigModal.tsx
- **TTBlockPanel.tsx** (0h) - components\TTBlock\TTBlockPanel.tsx
- **EnhancedModelSelector.tsx** (0h) - components\ui\EnhancedModelSelector.tsx
- **ModelManagerPanel.tsx** (0h) - components\ui\ModelManagerPanel.tsx
- **ModelSelectorDemo.tsx** (0h) - components\ui\ModelSelectorDemo.tsx
- **UserMenu.tsx** (0h) - components\UserMenu.tsx
- **WorkflowManagerModal.tsx** (0h) - components\WorkflowManagerModal.tsx
- **WorkflowPanel.tsx** (0h) - components\WorkflowPanel.tsx
- **YOLOModelManager.tsx** (0h) - components\YOLOModelManager.tsx

#### NEXTUI

- **AIAnalysisReport.tsx** (7h) - components\AIAnalysisReport.tsx
- **DronePositionPanel.tsx** (3h) - components\DronePositionPanel.tsx
- **SizeControl.tsx** (3h) - components\SizeControl.tsx
- **VirtualPositionView.tsx** (2h) - components\VirtualPositionView.tsx

#### ANTD

- **index.tsx** (50h) - components\ChatbotChat\index.tsx
- **SettingsModal.tsx** (4h) - components\SettingsModal.tsx
- **QrGenerator.tsx** (3h) - components\ChatbotChat\QrGenerator.tsx

#### MIXED

- **ReportPanel.tsx** (11h) - components\ReportPanel.tsx
- **SimulationPanel.tsx** (8h) - components\SimulationPanel.tsx
- **VideoControlPanel.tsx** (8h) - components\VideoControlPanel.tsx

#### CUSTOM

- **AIAnalysisManager.tsx** (4h) - components\AIAnalysisManager.tsx
- **DraggableContainer.tsx** (4h) - components\DraggableContainer.tsx
- **icons.tsx** (4h) - components\icons.tsx
- **BatteryStatusPanel.tsx** (3h) - components\BatteryStatusPanel.tsx
- **DecryptedText.tsx** (3h) - components\DecryptedText.tsx
- **GlobalKnowledgeModal.tsx** (3h) - components\GlobalKnowledgeModal.tsx
- **AnimatedList.tsx** (3h) - components\ui\AnimatedList.tsx
- **ReportPanel.tsx** (2h) - components\ChatbotChat\ReportPanel.tsx
- **DarkVeil.tsx** (2h) - components\DarkVeil.tsx
- **DiagnosisReportViewer.tsx** (2h) - components\DiagnosisReportViewer.tsx
- **DropZones.tsx** (2h) - components\layout\DropZones.tsx
- **ManualControlPanel.tsx** (2h) - components\ManualControlPanel.tsx
- **MessageMarkdown.tsx** (2h) - components\markdown\MessageMarkdown.tsx
- **TextType.tsx** (2h) - components\TextType.tsx
- **TrueFocus.tsx** (2h) - components\TrueFocus.tsx
- **WorkflowEditor.tsx** (2h) - components\WorkflowEditor.tsx
- **ChatDock.tsx** (1h) - components\ChatDock.tsx
- **ControlStatusPanel.tsx** (1h) - components\ControlStatusPanel.tsx
- **GridSystem.tsx** (1h) - components\GridSystem.tsx
- **InternalDraggable.tsx** (1h) - components\InternalDraggable.tsx
- **BackgroundLayer.tsx** (1h) - components\login\BackgroundLayer.tsx
- **BrandingSection.tsx** (1h) - components\login\BrandingSection.tsx
- **FeatureCard.tsx** (1h) - components\login\FeatureCard.tsx
- **PageTransition.tsx** (1h) - components\PageTransition.tsx
- **SnapLines.tsx** (1h) - components\SnapLines.tsx
- **StatusNode.tsx** (1h) - components\StatusNode.tsx
- **TaskNodeLibrary.tsx** (1h) - components\TaskNodeLibrary.tsx
- **BlockNode.tsx** (1h) - components\TTBlock\BlockNode.tsx
- **badge.tsx** (1h) - components\ui\badge.tsx
- **button.tsx** (1h) - components\ui\button.tsx
- **card.tsx** (1h) - components\ui\card.tsx
- **meteors.tsx** (1h) - components\ui\meteors.tsx
- **WorkflowCanvas.tsx** (1h) - components\WorkflowCanvas.tsx

