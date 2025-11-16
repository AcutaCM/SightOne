"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDroneControl } from "@/hooks/useDroneControl";
import { useAIConfig } from "@/hooks/useAIConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Badge } from "@heroui/badge";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Tooltip } from "@heroui/tooltip";
import ConnectionControlPanel from "@/components/ConnectionControlPanel";
import MissionPadPanel from "@/components/MissionPadPanel";
import DetectionControlPanel from "@/components/DetectionControlPanel";
import HelpPanel from "@/components/HelpPanel";
import ManualControlPanel from "@/components/ManualControlPanel";
import AIAnalysisReport from "@/components/AIAnalysisReport";
import AIAnalysisManager from "@/components/AIAnalysisManager";
import BatteryStatusPanel from "@/components/BatteryStatusPanel";
import AppInfoPanel from "@/components/AppInfoPanel";
import VirtualPositionView from "@/components/VirtualPositionView";
import StrawberryDetectionCard from "@/components/StrawberryDetectionCard";
import QRScanPanel from "@/components/QRScanPanel";
import DraggableContainer from "@/components/DraggableContainer";
import TopNavbar from "@/components/TopNavbar";
import GridSystem from "@/components/GridSystem";
import DropZones from "@/components/layout/DropZones";
import ComponentSelector from "@/components/ComponentSelector";
// Import additional components
import ChallengeCruisePanel from "@/components/ChallengeCruisePanel";





import SystemLogPanel from "@/components/SystemLogPanel";



import ChatDock from "@/components/ChatDock";
import PureChat from "@/components/ChatbotChat/PureChatWrapper";
import MemoryPanel from "@/components/MemoryPanel";
import DarkVeil from "@/components/DarkVeil";
import WorkflowEditor from "@/components/WorkflowEditor";
import TelloIntelligentAgent from "@/components/TelloIntelligentAgent";
import ModelManagerPanel from "@/components/ui/ModelManagerPanel";
import EnhancedModelSelector from "@/components/ui/EnhancedModelSelector";
import PlantQRGeneratorPanel from "@/components/PlantQRGeneratorPanel";
import { AssistantMessageDock } from "@/components/AssistantMessageDock";

import { LayoutProvider } from "@/contexts/LayoutContext";
import { DropZonesProvider, useDropZonesContext } from "@/contexts/DropZonesContext";
import { DroneProvider } from "@/contexts/DroneContext";
import { ChatProvider } from "@/contexts/ChatContext";

import { DroneIcon, AiIcon, MissionIcon, CruiseIcon } from "@/components/icons";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Drone control hooks and state
  const {
    droneStatus,
    missionStatus,
    detectionStats,
    logs,
    videoStream: rawVideoStream,
    isConnecting,
    connectToDrone,
    disconnectFromDrone,
    takeoff,
    land,
    startMission,
    pauseMission,
    resumeMission,
    stopMission,
    startDetection,
    stopDetection,
    startRippleDetection,
    stopRippleDetection,
    startQRDetection,
    stopQRDetection,
    startDiagnosisWorkflow,
    stopDiagnosisWorkflow,
    startVideoStream,
    stopVideoStream,
    clearLogs,
    manualControl,
    sendMessage,
    missionPosition,
    missionMessages,
    qrScan,
    startChallengeCruise,
    stopChallengeCruise,
  } = useDroneControl();

  const {
    aiConfig,
    analysisResults,
    isAnalyzing,
    testResult,
    updateAIConfig,
    testAIConnection,
    analyzeImage,
    clearAnalysisResults,
    exportAnalysisResults,
    getAnalysisStats
  } = useAIConfig();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Component state
  const [flightAltitude, setFlightAltitude] = useState<string>("2.5");
  const [waypointSpacing, setWaypointSpacing] = useState<string>("1.0");
  const [dwellSeconds, setDwellSeconds] = useState<string>("1.0");
  const [gridEnabled, setGridEnabled] = useState<boolean>(false);
  const [gridType, setGridType] = useState<string>("thirds");
  const [overlayEnabled, setOverlayEnabled] = useState<boolean>(false);
  const [delayArmed, setDelayArmed] = useState<boolean>(false);
  const [delaySeconds, setDelaySeconds] = useState<string>("3");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [rippleDetectionEnabled, setRippleDetectionEnabled] = useState<boolean>(false);
  const [qrDetectionEnabled, setQRDetectionEnabled] = useState<boolean>(false);
  const [diagnosisWorkflowEnabled, setDiagnosisWorkflowEnabled] = useState<boolean>(false);
  const [strawberryDetections, setStrawberryDetections] = useState<any[]>([]);
  const [latestStrawberryDetection, setLatestStrawberryDetection] = useState<any>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recSeconds, setRecSeconds] = useState<number>(0);

  // Global message handler setup
  useEffect(() => {
    (globalThis as any).__droneSendMessage = sendMessage;
    return () => {
      if ((globalThis as any).__droneSendMessage === sendMessage) {
        delete (globalThis as any).__droneSendMessage;
      }
    };
  }, [sendMessage]);
  
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [activeLevels, setActiveLevels] = useState<string[]>(["success", "info", "warning", "error"]);
  const [logKeyword, setLogKeyword] = useState<string>("");
  const [showAllDiseases, setShowAllDiseases] = useState(false);

  // Refs
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Mock strawberry detection data
  useEffect(() => {
    if (rippleDetectionEnabled) {
      const interval = setInterval(() => {
        const newDetection = {
          id: Date.now(),
          name: `Strawberry ${Math.random() > 0.66 ? 'A' : Math.random() > 0.33 ? 'B' : 'C'}`,
          maturity: Math.random() > 0.66 ? 'ripe' : Math.random() > 0.33 ? 'semi-ripe' : 'unripe',
          location: `L[${Math.floor(Math.random()*100)},${Math.floor(Math.random()*100)},${Math.floor(Math.random()*10)}]`,
          timestamp: new Date().toLocaleString(),
          confidence: 0.8 + Math.random() * 0.2
        };
        
        setStrawberryDetections(prev => [newDetection, ...prev.slice(0, 49)]); // Keep last 50 detections
        setLatestStrawberryDetection(newDetection);
      }, 2000 + Math.random() * 3000); // 2-5 seconds interval
      
      return () => clearInterval(interval);
    }
  }, [rippleDetectionEnabled]);

  // Video stream status sync
  useEffect(() => {
    if (droneStatus?.connected && !rawVideoStream?.isStreaming) {
      startVideoStream();
    } else if (!droneStatus?.connected && rawVideoStream?.isStreaming) {
      stopVideoStream();
    }
  }, [droneStatus?.connected, rawVideoStream?.isStreaming, startVideoStream, stopVideoStream]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  useEffect(() => {
    // Cleanup countdown timer on unmount
    return () => {
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcuts: G-Grid, O-Overlay, F-Fullscreen, R-Record, S-Screenshot, D-Delay
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return el.isContentEditable || tag === "input" || tag === "textarea" || tag === "select";
    };
    const onKey = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "g") { e.preventDefault(); setGridEnabled((v) => !v); }
      else if (key === "o") { e.preventDefault(); setOverlayEnabled((v) => !v); }
      else if (key === "f") { e.preventDefault(); handleToggleFullscreen(); }
      else if (key === "r") { e.preventDefault(); handleToggleRecording(); }
      else if (key === "s") { e.preventDefault(); handleScreenshot(); }
      else if (key === "d") { e.preventDefault(); setDelayArmed((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return null;
  }

  // Ensure videoStream has default values
  const videoStream = rawVideoStream || {
    isStreaming: false,
    currentFrame: null,
    fps: 0,
    resolution: '0x0',
    timestamp: '',
    fileMode: false,
    detectionStatus: {
      qr_enabled: false,
      strawberry_enabled: false,
      ai_enabled: false
    }
  };

  const analysisStats = getAnalysisStats();

  // MISSIONPAD validation helpers
  const toNum = (v: string) => Number.parseFloat(v);
  const isValidFlightAltitude = Number.isFinite(toNum(flightAltitude)) && toNum(flightAltitude) >= 0.5 && toNum(flightAltitude) <= 15;
  const isValidWaypointSpacing = Number.isFinite(toNum(waypointSpacing)) && toNum(waypointSpacing) >= 0.3 && toNum(waypointSpacing) <= 10;
  const isValidDwellSeconds = Number.isFinite(toNum(dwellSeconds)) && toNum(dwellSeconds) >= 0 && toNum(dwellSeconds) <= 10;
  const missionFormInvalid = !isValidFlightAltitude || !isValidWaypointSpacing || !isValidDwellSeconds;

  // Strawberry maturity statistics
  const strawberryMaturityStats = {
    ripe: strawberryDetections.filter(d => d.maturity === "ripe").length,
    halfRipe: strawberryDetections.filter(d => d.maturity === "semi-ripe").length,
    unripe: strawberryDetections.filter(d => d.maturity === "unripe").length
  };

  const handleToggleFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleToggleRecording = () => {
    setIsRecording((r) => {
      if (r) setRecSeconds(0);
      return !r;
    });
  };

  const handleScreenshot = () => {
    const capture = () => {
      // TODO: Implement actual screenshot capture using Canvas API
      window.alert("Screenshot captured! This is a placeholder implementation.");
    };

    if (delayArmed) {
      const start = parseInt(delaySeconds, 10);
      if (!Number.isFinite(start) || start <= 0) return capture();

      // Clear any existing countdown timer
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }

      setCountdown(start);
      setShowCountdown(true);
      countdownTimerRef.current = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (countdownTimerRef.current) {
              window.clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setShowCountdown(false);
            capture();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      capture();
    }
  };

  const recMM = String(Math.floor(recSeconds / 60)).padStart(2, "0");
  const recSS = String(recSeconds % 60).padStart(2, "0");

  // Log filtering helpers
  const allLevels = ["success", "info", "warning", "error"] as const;

  const toggleLevel = (lvl: string) => {
    setActiveLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const filteredLogs = logs
    .filter((log: any) => activeLevels.includes((log.level || "info").toLowerCase()))
    .filter((log: any) => (logKeyword ? (log.message || "").toLowerCase().includes(logKeyword.toLowerCase()) : true))
    .slice(0, 5);

  // AI analysis statistics
  const latestResult = analysisResults[0];
  const latestScore = latestResult?.analysis?.healthScore ?? 0;
  const avgScore = Math.round(analysisStats.averageHealthScore);
  const confidencePercent = Math.round((latestResult?.confidence ?? 0) * 100);
  
  // Health score ring styling
  const ringClasses = latestScore >= 85 ? "border-green-400 text-green-400" : 
                      latestScore >= 70 ? "border-blue-400 text-blue-400" : 
                      latestScore >= 50 ? "border-yellow-400 text-yellow-400" : 
                      "border-red-400 text-red-400";
  
  // Recent health scores for trend analysis
  const recentScores = analysisResults.slice(0, 10).reverse().map(result => result.analysis.healthScore);
  const hasScoreTrend = recentScores.length > 1;

  // Battery level calculations
  const batteryLevel = Math.max(0, Math.min(100, Number(droneStatus.battery ?? 85)));
  const batteryAngle = (batteryLevel / 100) * 360;
  const batteryProgressColor = batteryLevel > 50 ? "#22c55e" : batteryLevel > 20 ? "#f59e0b" : "#ef4444";
  const batteryTextClass = batteryLevel > 50 ? "text-green-400" : batteryLevel > 20 ? "text-yellow-400" : "text-red-400";

  // CSV export handler
  const handleExportCSV = () => {
    if (analysisResults.length === 0) return;
    
    const csvHeader = "Timestamp,Health Score,Plant Count,Mature Strawberries,Immature Strawberries,Disease Detected,Confidence\n";
    const csvData = analysisResults.map(result => 
      `${new Date(result.timestamp).toLocaleString()},${result.analysis.healthScore},${result.analysis.plantCount},${result.analysis.matureStrawberries},${result.analysis.immatureStrawberries},${result.analysis.diseaseDetected ? 'Yes' : 'No'},${result.confidence}`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DroneProvider>
      <LayoutProvider>
        <DropZonesProvider>
        <MainContent 
          droneStatus={droneStatus}
          isConnecting={isConnecting}
          connectToDrone={connectToDrone}
          disconnectFromDrone={disconnectFromDrone}
          missionStatus={missionStatus}
          startMission={startMission}
          stopMission={stopMission}
          startDetection={startDetection}
          onOpen={onOpen}
          rippleDetectionEnabled={rippleDetectionEnabled}
          qrDetectionEnabled={qrDetectionEnabled}
          diagnosisWorkflowEnabled={diagnosisWorkflowEnabled}
          setRippleDetectionEnabled={setRippleDetectionEnabled}
          setQRDetectionEnabled={setQRDetectionEnabled}
          setDiagnosisWorkflowEnabled={setDiagnosisWorkflowEnabled}
          startRippleDetection={startRippleDetection}
          stopRippleDetection={stopRippleDetection}
          startQRDetection={startQRDetection}
          stopQRDetection={stopQRDetection}
          startDiagnosisWorkflow={startDiagnosisWorkflow}
          stopDiagnosisWorkflow={stopDiagnosisWorkflow}
          takeoff={takeoff}
          land={land}
          analysisResults={analysisResults}
          handleExportCSV={handleExportCSV}
          exportAnalysisResults={exportAnalysisResults}
          clearAnalysisResults={clearAnalysisResults}
          batteryLevel={batteryLevel}
          manualControl={manualControl}
          videoStream={videoStream}
          logs={logs}
          clearLogs={clearLogs}
          sendMessage={sendMessage}
          missionPosition={missionPosition}
          missionMessages={missionMessages}
          strawberryDetections={strawberryDetections}
          latestStrawberryDetection={latestStrawberryDetection}
          strawberryMaturityStats={strawberryMaturityStats}
          qrScan={qrScan}
          startChallengeCruise={startChallengeCruise}
          stopChallengeCruise={stopChallengeCruise}
        />
      </DropZonesProvider>
    </LayoutProvider>
  </DroneProvider>
  );
}

// Main content component with DropZonesContext
interface MainContentProps {
  droneStatus: any;
  isConnecting: boolean;
  connectToDrone: () => void;
  disconnectFromDrone: () => void;
  missionStatus: any;
  startMission: () => void;
  stopMission: () => void;
  startDetection: () => void;
  onOpen: () => void;
  rippleDetectionEnabled: boolean;
  qrDetectionEnabled: boolean;
  diagnosisWorkflowEnabled: boolean;
  setRippleDetectionEnabled: (enabled: boolean) => void;
  setQRDetectionEnabled: (enabled: boolean) => void;
  setDiagnosisWorkflowEnabled: (enabled: boolean) => void;
  startRippleDetection: () => void;
  stopRippleDetection: () => void;
  startQRDetection: () => void;
  stopQRDetection: () => void;
  startDiagnosisWorkflow: () => void;
  stopDiagnosisWorkflow: () => void;
  takeoff: () => void;
  land: () => void;
  analysisResults: any[];
  handleExportCSV: () => void;
  exportAnalysisResults: () => void;
  clearAnalysisResults: () => void;
  batteryLevel: number;
  manualControl: (direction: 'up' | 'down' | 'left' | 'right' | 'center') => void;
  videoStream: any;
  logs: any[];
  clearLogs: () => void;
  sendMessage: (type: string, data?: any) => boolean;
  missionPosition?: any;
  missionMessages?: any[];
  strawberryDetections: any[];
  latestStrawberryDetection: any;
  strawberryMaturityStats: any;
  qrScan: any;
  startChallengeCruise: (params?: { rounds?: number; height?: number; stayDuration?: number }) => boolean;
  stopChallengeCruise: () => boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  droneStatus,
  isConnecting,
  connectToDrone,
  disconnectFromDrone,
  missionStatus,
  startMission,
  stopMission,
  startDetection,
  onOpen,
  rippleDetectionEnabled,
  qrDetectionEnabled,
  diagnosisWorkflowEnabled,
  setRippleDetectionEnabled,
  setQRDetectionEnabled,
  setDiagnosisWorkflowEnabled,
  startRippleDetection,
  stopRippleDetection,
  startQRDetection,
  stopQRDetection,
  startDiagnosisWorkflow,
  stopDiagnosisWorkflow,
  takeoff,
  land,
  analysisResults,
  handleExportCSV,
  exportAnalysisResults,
  clearAnalysisResults,
  batteryLevel,
  manualControl,
  videoStream,
  logs,
  clearLogs,
  sendMessage,
  missionPosition,
  missionMessages,
  strawberryDetections,
  latestStrawberryDetection,
  strawberryMaturityStats,
  qrScan,
  startChallengeCruise,
  stopChallengeCruise,
}) => {
  const {
    isEditMode,
    isComponentVisible,
    toggleComponentVisibility,
    showComponentSelector,
    setShowComponentSelector,
    visibleComponents 
  } = useLayout();

  const dropZonesContext = useDropZonesContext();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [containerOffset, setContainerOffset] = useState<{left: number; top: number; width?: number; height?: number}>({ left: 0, top: 64 });

  /**
   * State management for PureChat integration with AssistantMessageDock.
   * 
   * These state variables maintain the context when transitioning from
   * MessageDock to the full PureChat interface.
   */
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');

  /**
   * Handles opening the chat interface from AssistantMessageDock.
   * 
   * This callback is triggered when a user sends a message through the MessageDock.
   * It manages the transition from the compact dock interface to the full chat panel.
   * 
   * Flow:
   * 1. Stores the selected assistant ID and initial message in state
   * 2. Ensures the chat panel is visible (toggles visibility if needed)
   * 3. The PureChat component will use these state values to initialize the conversation
   * 
   * Integration Points:
   * - AssistantMessageDock: Calls this function when user sends a message
   * - PureChat: Receives selectedAssistantId and initialMessage as props
   * - LayoutContext: Manages chat panel visibility
   * 
   * @param assistantId - The unique identifier of the selected assistant
   * @param message - The initial message text entered by the user
   * 
   * @see {@link AssistantMessageDock} for the message dock component
   * @see {@link PureChat} for the chat interface component
   * 
   * @example
   * ```tsx
   * // User clicks assistant and types "Hello"
   * handleOpenChat("asst_123", "Hello");
   * // Result: Chat panel opens with assistant asst_123 and message "Hello"
   * ```
   */
  const handleOpenChat = (assistantId: string, message: string) => {
    // Store the selected assistant and initial message for PureChat
    setSelectedAssistantId(assistantId);
    setInitialMessage(message);
    
    // Ensure the chat panel is visible
    if (!isComponentVisible('chat-panel')) {
      toggleComponentVisibility('chat-panel');
    }
    
    // Log for debugging and monitoring
    console.log('Opening chat with assistant:', assistantId, 'Message:', message);
    
    // TODO: Update PureChat component to accept and use these props
    // The PureChat component should be modified to:
    // 1. Accept assistantId and initialMessage as props
    // 2. Auto-select the assistant based on assistantId
    // 3. Pre-populate the input field with initialMessage
    // 4. Optionally auto-send the message on mount
  };

  // Video stream reference and state
  const vs = videoStream;

  // Video container and recording state
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Countdown state for delayed screenshots
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const handleToggleFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };
  const toggleFullscreen = handleToggleFullscreen;

  const handleScreenshot = () => {
    // TODO: Implement actual screenshot functionality
    window.alert("Screenshot captured! This is a placeholder implementation.");
  };
  const takeScreenshot = handleScreenshot;

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  useEffect(() => {
    const updateOffset = () => {
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerOffset({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  return (
    <>
      {/* Beautiful white-blue gradient background */}
      <div className="fixed inset-0 z-[-30] bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-zinc-950 dark:via-blue-950 dark:to-zinc-900" />
      
      {/* Grid system - subtle grid for visual interest */}
      <GridSystem 
        gridSize={20}
        showGrid={true}
        gridColor="#000000"
        gridOpacity={0.03}
      />
      
      {/* Drop zones */}
      <DropZones 
        zones={dropZonesContext.zones}
        showZones={dropZonesContext.showZones}
        onZoneHover={dropZonesContext.setHoveredZone}
        draggedComponent={dropZonesContext.draggedComponent}
        containerOffset={containerOffset}
      />
      
      <TopNavbar />
      
      {/* Component selector */}
      <ComponentSelector
        isVisible={showComponentSelector}
        onSelectComponent={toggleComponentVisibility}
        onClose={() => setShowComponentSelector(false)}
        selectedComponents={visibleComponents}
      />
      
      <div ref={contentRef} className="relative z-10 min-h-[calc(100vh-64px)] p-3" style={{ position: 'relative', overflow: 'visible' }}>
        {/* Left control panel - Static container for layout */}
        <DraggableContainer
          componentId="left-control-panel"
          initialPosition={{ x: 20, y: 20 }}
          initialSize={{ width: 352, height: 800 }}
          enableContentScaling={true}
          enableInternalDragging={true}
          enableDrag={false}
          enableResize={false}
          showResizeHandles={false}
        >
          <div className="w-full h-full space-y-3 overflow-y-auto p-2">
            {/* This container is for layout purposes */}
          </div>
        </DraggableContainer>

        {/* Connection Control Panel */}
        {isComponentVisible('connection-control') && (
          <DraggableContainer
            componentId="connection-control"
            initialPosition={{ x: 400, y: 20 }}
            initialSize={{ width: 352, height: 251 }}
            enableContentScaling={true}
            enableInternalDragging={false}
            enableDropZones={true}
            strictDropZones={false}
          >
            <Card className="bg-content1 border-divider rounded-[21px]" style={{width: '100%', height: '100%'}}>
              <CardBody className="flex flex-col" style={{padding: '27px 36px'}}>
                <ConnectionControlPanel
                  isConnecting={isConnecting}
                  isConnected={droneStatus.connected}
                  onConnect={connectToDrone}
                  onDisconnect={disconnectFromDrone}
                />
              </CardBody>
            </Card>
          </DraggableContainer>
        )}

        {/* Mission Panel */}
        {isComponentVisible('mission-panel') && (
          <DraggableContainer
            componentId="mission-panel"
            initialPosition={{ x: 800, y: 20 }}
            initialSize={{ width: 352, height: 377 }}
            enableContentScaling={true}
            enableInternalDragging={false}
            enableDropZones={true}
            strictDropZones={false}
          >
            <MissionPadPanel
              isConnected={droneStatus.connected}
              onStartMission={startChallengeCruise}
              onStopMission={stopChallengeCruise}
              missionActive={missionStatus.active}
            />
          </DraggableContainer>
        )}

        {/* Detection Control Panel */}
        {isComponentVisible('detection-control') && (
          <DraggableContainer
            componentId="detection-control"
            initialPosition={{ x: 1200, y: 20 }}
            initialSize={{ width: 352, height: 370 }}
            enableContentScaling={true}
            enableInternalDragging={false}
            enableDropZones={true}
            strictDropZones={false}
          >
            <DetectionControlPanel
              isConnected={droneStatus.connected}
              onStartDetection={startDetection}
              onConfigAPI={onOpen}
              rippleDetectionEnabled={rippleDetectionEnabled}
              qrDetectionEnabled={qrDetectionEnabled}
              diagnosisWorkflowEnabled={diagnosisWorkflowEnabled}
              onRippleDetectionChange={setRippleDetectionEnabled}
              onQRDetectionChange={setQRDetectionEnabled}
              onDiagnosisWorkflowChange={setDiagnosisWorkflowEnabled}
              startRippleDetection={startRippleDetection}
              stopRippleDetection={stopRippleDetection}
              startQRDetection={startQRDetection}
              stopQRDetection={stopQRDetection}
              startDiagnosisWorkflow={startDiagnosisWorkflow}
              stopDiagnosisWorkflow={stopDiagnosisWorkflow}
            />
          </DraggableContainer>
        )}

        {/* Help Panel */}
        {isComponentVisible('help-panel') && (
          <DraggableContainer
            componentId="help-panel"
            initialPosition={{ x: 1600, y: 20 }}
            initialSize={{ width: 352, height: 319 }}
            enableContentScaling={true}
            enableInternalDragging={false}
            enableDropZones={true}
            strictDropZones={false}
          >
            <HelpPanel
              onViewHelp={() => window.open('/help', '_blank')}
            />
          </DraggableContainer>
        )}

        {/* Video Stream Panel */}
        {isComponentVisible('video-stream') && (
          <DraggableContainer
            componentId="video-stream"
            initialPosition={{ x: 400, y: 20 }}
            initialSize={{ width: 800, height: 600 }}
            enableDropZones={true}
            strictDropZones={false}
          >
          <Card className="bg-content1 border-divider w-full h-full">
            <CardBody className="p-0 flex flex-row w-full h-full bg-content1 rounded-[20px]">
              {/* Left sidebar with controls */}
              <div className="w-[280px] p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-foreground flex-shrink-0">
                    <h2 className="text-lg font-semibold leading-tight">
                      Video Stream<br />
                      <span className="text-sm font-normal opacity-80">STREAMING</span>
                    </h2>
                  </div>
                  
                  {/* Stream info */}
                  <div className="bg-content2 rounded-[12px] p-4 flex-shrink-0 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-foreground text-sm font-medium">Stream Info</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-foreground text-sm">
                      <div>
                        <div className="text-xs opacity-70 mb-1">FPS:</div>
                        <div className="font-medium">{vs?.fps || 0}fps</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-70 mb-1">Resolution:</div>
                        <div className="font-medium">{vs?.resolution || '0x0'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Altitude info */}
                  <div className="bg-content2 rounded-[12px] p-4 flex-shrink-0 mt-6">
                    <div className="text-foreground text-sm font-medium mb-3">Flight Altitude</div>
                    <div className="text-foreground text-2xl font-bold mb-2">{droneStatus.altitude?.toFixed(1) || '0.0'}m</div>
                    <div className="w-full h-[6px] bg-content3 rounded-full">
                      <div className="w-2/3 h-full bg-primary rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* System logs */}
                  <div className="bg-content2 rounded-[12px] p-4 flex-1 flex flex-col mt-6 min-h-0">
                    <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-foreground text-sm font-medium">System Logs</span>
                      <button 
                        onClick={clearLogs}
                        className="ml-auto w-6 h-6 bg-danger hover:bg-danger/80 rounded-full flex items-center justify-center transition-colors"
                        title="Clear logs"
                      >
                        <svg className="w-3 h-3 text-danger-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Log entries */}
                    <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                      {logs.length === 0 ? (
                        <div className="text-foreground/50 text-xs text-center py-2">
                          No logs available
                        </div>
                      ) : (
                        logs.slice(-10).map((log, index) => (
                          <div key={index} className="text-xs text-foreground/80 bg-content3 rounded px-2 py-1 flex-shrink-0">
                            <span className="text-foreground/60">[{log.timestamp}]</span>
                            <span className={`ml-2 ${
                              log.level === 'error' ? 'text-danger' :
                              log.level === 'warning' ? 'text-warning' :
                              log.level === 'success' ? 'text-success' :
                              'text-foreground/80'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              </div>
              
              {/* Main video display area */}
              <div className="flex-1 relative bg-content1/30 rounded-r-[20px] overflow-hidden" ref={videoContainerRef}>
                  {/* Video stream or placeholder */}
                  {vs?.isStreaming && vs?.currentFrame ? (
                    <img 
                      src={vs?.currentFrame?.startsWith('data:image') ? (vs.currentFrame as string) : (`data:image/jpeg;base64,${vs?.currentFrame}` as string)}
                      alt="Drone Video Stream"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* No stream placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
                      <img 
                        src="/images/video-loading-icon.svg" 
                        alt="Loading" 
                        className="w-[103px] h-[82px] opacity-30 mb-4"
                      />
                      <p className="text-sm opacity-60">
                        {droneStatus.connected ? 'Waiting for video stream...' : 'Connect to drone to view stream'}
                      </p>
                    </div>
                  )}
                  
                  {/* Countdown overlay */}
                  {showCountdown && (
                    <div className="absolute inset-0 bg-content2 flex items-center justify-center">
                      <div className="text-foreground text-6xl font-bold">{countdown}</div>
                    </div>
                  )}
                  
                  {/* Bottom controls */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    {/* Stream status */}
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        vs?.isStreaming ? 'bg-success' :
                        droneStatus.connected ? 'bg-warning' : 'bg-danger'
                      }`}></div>
                      <span className="text-foreground text-sm">
                        {vs?.isStreaming ? 'Streaming' : 
                               droneStatus.connected ? 'Waiting for stream' : 'Disconnected'}
                      </span>
                      <svg className="w-4 h-4 text-foreground ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    
                    {/* Control buttons */}
                    <div className="flex items-center gap-3">
                      {/* Fullscreen button */}
                      <button 
                        onClick={handleToggleFullscreen}
                        className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors"
                        title="Toggle fullscreen"
                      >
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                      
                      {/* Screenshot button */}
                      <button 
                        onClick={handleScreenshot}
                        className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Take screenshot"
                        disabled={!vs?.isStreaming}
                      >
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

              </div>
            </CardBody>
          </Card>
          </DraggableContainer>
        )}



        {/* Strawberry Detection Card */}
        {isComponentVisible('strawberry-detection') && (
          <DraggableContainer
            componentId="strawberry-detection"
            initialPosition={{ x: 400, y: 650 }}
            initialSize={{ width: 300, height: 200 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <StrawberryDetectionCard 
              detectedCount={strawberryDetections.length}
              latestDetection={latestStrawberryDetection || {
                name: "No detections",
                location: "--",
                timestamp: "--",
                maturity: "--"
              }}
              maturityStats={strawberryMaturityStats}
            />
          </DraggableContainer>
        )}
        
        {/* Manual Control Panel */}
        {isComponentVisible('manual-control') && (
          <DraggableContainer
            componentId="manual-control"
            initialPosition={{ x: 720, y: 650 }}
            initialSize={{ width: 300, height: 200 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <ManualControlPanel
              onTakeoff={takeoff}
              onLanding={land}
              onDirectionControl={manualControl}
            />
          </DraggableContainer>
        )}

        {/* QR Scan Panel */}
        {isComponentVisible('qr-scan') && (
          <DraggableContainer
            componentId="qr-scan"
            initialPosition={{ x: 1040, y: 650 }}
            initialSize={{ width: 250, height: 180 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <QRScanPanel 
              scanResult={qrScan?.lastScan}
              cooldownTime={qrScan?.lastScan ? qrScan.cooldowns[qrScan.lastScan.plantId] : null}
              scanHistory={qrScan?.scanHistory}
            />
          </DraggableContainer>
        )}

        {/* Virtual Position View */}
        {isComponentVisible('virtual-position') && (
          <DraggableContainer
            componentId="virtual-position"
            initialPosition={{ x: 400, y: 870 }}
            initialSize={{ width: 490, height: 240 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <VirtualPositionView position={missionPosition} messages={missionMessages} />
          </DraggableContainer>
        )}

        {/* AI Analysis Report */}
        {isComponentVisible('ai-analysis-report') && (
          <DraggableContainer
            componentId="ai-analysis-report"
            initialPosition={{ x: 1220, y: 20 }}
            initialSize={{ width: 350, height: 400 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <AIAnalysisReport 
              analysisResults={analysisResults}
              onExportCSV={handleExportCSV}
              onExportJSON={exportAnalysisResults}
              onClear={clearAnalysisResults}
            />
          </DraggableContainer>
        )}

        {/* AI Analysis Manager */}
        {isComponentVisible('ai-analysis-manager') && (
          <DraggableContainer
            componentId="ai-analysis-manager"
            initialPosition={{ x: 1600, y: 20 }}
            initialSize={{ width: 400, height: 500 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <AIAnalysisManager />
          </DraggableContainer>
        )}

        {/* Battery Status Panel */}
        {isComponentVisible('battery-status') && (
          <BatteryStatusPanel 
            batteryLevel={batteryLevel}
            isCharging={false}
          />
        )}

        {/* App Info Panel */}
        {isComponentVisible('app-info') && (
          <DraggableContainer
            componentId="app-info"
            initialPosition={{ x: 1220, y: 660 }}
            initialSize={{ width: 350, height: 150 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <AppInfoPanel />
          </DraggableContainer>
        )}

        {/* Challenge Cruise Panel */}
        {isComponentVisible('challenge-cruise') && (
          <DraggableContainer
            componentId="challenge-cruise"
            initialPosition={{ x: 1600, y: 360 }}
            initialSize={{ width: 350, height: 400 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <ChallengeCruisePanel 
              isConnected={droneStatus.connected}
              cruiseActive={Boolean(missionStatus?.active)}
              onStartCruise={async (params) => { 
                // First takeoff if not already flying
                if (!droneStatus.flying) {
                  const takeoffSuccess = takeoff();
                  if (!takeoffSuccess) {
                    return;
                  }
                  // Wait a bit for the drone to stabilize after takeoff
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }
                // Then start the cruise mission
                sendMessage('challenge_cruise_start', params); 
              }}
              onStopCruise={() => { sendMessage('challenge_cruise_stop'); }}
              cruiseProgress={missionStatus?.progress ?? 0}
              currentRound={missionStatus?.currentRound ?? 0}
              totalRounds={missionStatus?.totalRounds ?? 0}
            />
          </DraggableContainer>
        )}







        {/* System Log Panel */}
        {isComponentVisible('system-log-panel') && (
          <DraggableContainer
            componentId="system-log-panel"
            initialPosition={{ x: 2820, y: 20 }}
            initialSize={{ width: 400, height: 600 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <SystemLogPanel 
              logs={logs}
              onClearLogs={clearLogs}
              onExportLogs={() => {
                const logData = logs.map(log => ({
                  timestamp: log.timestamp,
                  level: log.level,
                  category: log.category,
                  message: log.message,
                  details: log.details
                }));
                const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `system-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            />
          </DraggableContainer>
        )}

        {/* Chat Panel */}
        {isComponentVisible('chat-panel') && (
          <DraggableContainer
            componentId="chat-panel"
            initialPosition={{ x: 1680, y: 980 }}
            initialSize={{ width: 420, height: 560 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <PureChat 
              selectedAssistantId={selectedAssistantId}
              initialMessage={initialMessage}
              onMessageSent={() => {
                // Clear the initial message after it's sent
                setInitialMessage('');
              }}
            />
          </DraggableContainer>
        )}

        {/* Memory Panel */}
        {isComponentVisible('memory-panel') && (
          <DraggableContainer
            componentId="memory-panel"
            initialPosition={{ x: 2120, y: 980 }}
            initialSize={{ width: 420, height: 560 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <MemoryPanel />
          </DraggableContainer>
        )}




        {/* Tello Intelligent Agent */}
        {isComponentVisible('tello-intelligent-agent') && (
          <DraggableContainer
            componentId="tello-intelligent-agent"
            initialPosition={{ x: 1300, y: 100 }}
            initialSize={{ width: 600, height: 800 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <TelloIntelligentAgent />
          </DraggableContainer>
        )}

        {/* YOLO Model Manager Panel */}
        {isComponentVisible('yolo-model-manager') && (
          <DraggableContainer
            componentId="yolo-model-manager"
            initialPosition={{ x: 1280, y: 1080 }}
            initialSize={{ width: 400, height: 500 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <ModelManagerPanel />
          </DraggableContainer>
        )}

        {/* Enhanced Model Selector Panel */}
        {isComponentVisible('enhanced-model-selector') && (
          <DraggableContainer
            componentId="enhanced-model-selector"
            initialPosition={{ x: 50, y: 400 }}
            initialSize={{ width: 600, height: 700 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <EnhancedModelSelector 
              onModelChange={(modelName, modelType) => {
                console.log(`模型已切换: ${modelName} (${modelType})`);
                // 这里可以添加模型切换后的回调逻辑
              }}
              showUpload={true}
              compactMode={false}
            />
          </DraggableContainer>
        )}

        {/* Compact Model Selector Panel */}
        {isComponentVisible('compact-model-selector') && (
          <DraggableContainer
            componentId="compact-model-selector"
            initialPosition={{ x: 50, y: 50 }}
            initialSize={{ width: 500, height: 150 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <EnhancedModelSelector 
              onModelChange={(modelName, modelType) => {
                console.log(`模型已切换: ${modelName} (${modelType})`);
              }}
              showUpload={false}
              compactMode={true}
            />
          </DraggableContainer>
        )}

        {/* Tello Workflow Panel */}
        {isComponentVisible('tello-workflow-panel') && (
          <DraggableContainer
            componentId="tello-workflow-panel"
            initialPosition={{ x: 300, y: 150 }}
            initialSize={{ width: 900, height: 600 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <WorkflowEditor />
          </DraggableContainer>
        )}

        {/* Plant QR Generator Panel */}
        {isComponentVisible('plant-qr-generator') && (
          <DraggableContainer
            componentId="plant-qr-generator"
            initialPosition={{ x: 800, y: 100 }}
            initialSize={{ width: 380, height: 520 }}
            enableDropZones={true}
            strictDropZones={false}
          >
            <PlantQRGeneratorPanel 
              onQRGenerated={(plantId, qrData) => {
                console.log(`QR码已生成: 植株ID ${plantId}`);
              }}
            />
          </DraggableContainer>
        )}
      </div>
      
      {/* 
        MessageDock Integration
        
        The AssistantMessageDock provides quick access to AI assistants from anywhere on the page.
        It's positioned at the bottom center of the viewport and remains fixed during scrolling.
        
        Features:
        - Displays up to 5 published assistants from AssistantContext
        - Automatically adapts to light/dark theme
        - Routes messages to PureChat via handleOpenChat callback
        - Non-draggable, always accessible interface
        - Z-index of 50 ensures it appears above content but below modals
        
        Integration:
        - Data Source: AssistantContext (publishedAssistants)
        - Theme: next-themes (automatic light/dark detection)
        - Message Routing: handleOpenChat → PureChat component
        - Positioning: Fixed at bottom center (z-50)
        
        Requirements Satisfied:
        - Req 1.1-1.5: Component integration and display
        - Req 2.1-2.5: Assistant-to-Character mapping
        - Req 3.1-3.4: Theme integration
        - Req 4.1-4.4: Message routing to PureChat
        - Req 5.1-5.5: Fixed positioning and layout
        - Req 6.1-6.5: Animations and interactions
        
        @see {@link AssistantMessageDock} for component implementation
        @see {@link handleOpenChat} for message routing logic
        @see docs/MESSAGE_DOCK_USAGE_GUIDE.md for detailed usage guide
      */}
      <AssistantMessageDock 
        onOpenChat={handleOpenChat}
        className="z-50"
      />
      
      {/* 打开组件选择器的按钮 */}
      <Button
        isIconOnly
        color="primary"
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-2xl"
        onPress={() => setShowComponentSelector(true)}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </>
  );
};