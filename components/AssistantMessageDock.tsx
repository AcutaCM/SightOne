"use client";

import { useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MessageDock, Character } from "@/components/ui/message-dock";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@heroui/react";
import { useChatContextOptional } from "@/contexts/ChatContext";

/**
 * Assistant type matching the PURECHAT component structure
 */
type Assistant = {
  title: string;
  desc: string;
  emoji: string;
  prompt?: string;
};

/**
 * Props for the AssistantMessageDock component
 */
interface AssistantMessageDockProps {
  /**
   * Callback function triggered when a user sends a message through the MessageDock.
   * This should handle opening the chat interface with the selected assistant.
   * 
   * @param assistantTitle - The title of the selected assistant
   * @param initialMessage - The message text entered by the user
   * 
   * @example
   * ```tsx
   * const handleOpenChat = (assistantTitle: string, message: string) => {
   *   setCurrentAssistant(assistantList.find(a => a.title === assistantTitle));
   *   setInput(message);
   * };
   * ```
   */
  onOpenChat?: (assistantTitle: string, initialMessage: string) => void;
  
  /**
   * List of assistants from PURECHAT component
   * This should be passed from the parent component's assistantList state
   * If not provided, will be fetched from AssistantContext
   */
  assistantList?: Assistant[];
  
  /**
   * Additional CSS classes to apply to the MessageDock container.
   * Useful for controlling z-index, positioning, or custom styling.
   * 
   * @default ""
   * 
   * @example
   * ```tsx
   * <AssistantMessageDock className="z-50 custom-class" />
   * ```
   */
  className?: string;
}

/**
 * Color palettes used for generating unique gradient backgrounds for each assistant.
 * The palette is cycled through based on the assistant's index in the list.
 * 
 * Each palette contains:
 * - bg: Tailwind background color class
 * - from/to: Tailwind gradient color classes
 * - colors: Hex color values for CSS gradients
 * 
 * @constant
 */
const colorPalettes = [
  {
    bg: "bg-green-300",
    from: "from-green-300",
    to: "to-green-100",
    colors: "#86efac, #dcfce7",
  },
  {
    bg: "bg-purple-300",
    from: "from-purple-300",
    to: "to-purple-100",
    colors: "#c084fc, #f3e8ff",
  },
  {
    bg: "bg-yellow-300",
    from: "from-yellow-300",
    to: "to-yellow-100",
    colors: "#fde047, #fefce8",
  },
  {
    bg: "bg-blue-300",
    from: "from-blue-300",
    to: "to-blue-100",
    colors: "#93c5fd, #dbeafe",
  },
  {
    bg: "bg-pink-300",
    from: "from-pink-300",
    to: "to-pink-100",
    colors: "#f9a8d4, #fce7f3",
  },
];

/**
 * Default placeholder characters displayed when no published assistants are available.
 * Provides a fallback UI to ensure the MessageDock is never empty.
 * 
 * @constant
 */
const defaultCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  {
    emoji: "🤖",
    name: "AI Assistant",
    online: true,
    backgroundColor: "bg-blue-300",
    gradientFrom: "from-blue-300",
    gradientTo: "to-blue-100",
    gradientColors: "#93c5fd, #dbeafe",
  },
];

/**
 * Generates unique gradient colors for an assistant based on their index.
 * Uses modulo operation to cycle through the available color palettes.
 * 
 * @param index - The zero-based index of the assistant in the published assistants list
 * @returns A color palette object containing Tailwind classes and hex color values
 * 
 * @example
 * ```tsx
 * const colors = generateGradientColors(0); // Returns green palette
 * const colors = generateGradientColors(5); // Returns green palette (cycles back)
 * ```
 */
function generateGradientColors(index: number) {
  return colorPalettes[index % colorPalettes.length];
}

/**
 * Maps an Assistant object from PURECHAT to a Character object for MessageDock.
 * Performs the following transformations:
 * - Assistant.title → Character.id (using title as unique identifier)
 * - Assistant.emoji → Character.emoji
 * - Assistant.title → Character.name
 * - Generates unique gradient colors based on index
 * - Sets online status to true for all assistants
 * 
 * @param assistant - The assistant object from PURECHAT containing title, emoji, and desc
 * @param index - The index of the assistant in the list, used for color generation
 * @returns A Character object compatible with the MessageDock component
 * 
 * @example
 * ```tsx
 * const assistant = {
 *   title: "Code Helper",
 *   emoji: "🤖",
 *   desc: "Helps with coding"
 * };
 * const character = mapAssistantToCharacter(assistant, 0);
 * // Returns: {
 * //   id: "Code Helper",
 * //   emoji: "🤖",
 * //   name: "Code Helper",
 * //   online: true,
 * //   backgroundColor: "bg-green-300",
 * //   gradientFrom: "from-green-300",
 * //   gradientTo: "to-green-100",
 * //   gradientColors: "#86efac, #dcfce7"
 * // }
 * ```
 */
function mapAssistantToCharacter(
  assistant: Assistant,
  index: number
): Character {
  const colors = generateGradientColors(index);

  return {
    id: assistant.title, // Use title as unique identifier
    emoji: assistant.emoji,
    name: assistant.title,
    online: true, // All assistants are considered "online"
    backgroundColor: colors.bg,
    gradientFrom: colors.from,
    gradientTo: colors.to,
    gradientColors: colors.colors,
  };
}

/**
 * AssistantMessageDock - A wrapper component that bridges PURECHAT assistantList with the MessageDock UI.
 * 
 * This component serves as the integration layer between the PURECHAT component's assistant list
 * and the MessageDock UI component. It handles data transformation, theme detection,
 * and event routing.
 * 
 * ## Features
 * 
 * - **Direct Integration**: Receives assistantList directly from PURECHAT component
 * - **Data Mapping**: Transforms Assistant objects to Character format for MessageDock
 * - **Color Generation**: Assigns unique gradient colors to each assistant
 * - **Theme Support**: Automatically detects and applies light/dark theme using next-themes
 * - **Event Handling**: Routes message send events to the parent component (PURECHAT)
 * - **Assistant Limiting**: Displays maximum 5 assistants to prevent UI overflow
 * - **Fallback UI**: Shows default placeholder characters when no assistants are available
 * 
 * ## Usage
 * 
 * ```tsx
 * import { AssistantMessageDock } from "@/components/AssistantMessageDock";
 * 
 * function PureChat() {
 *   const [assistantList, setAssistantList] = useState<Assistant[]>([...]);
 *   
 *   const handleOpenChat = (assistantTitle: string, message: string) => {
 *     const assistant = assistantList.find(a => a.title === assistantTitle);
 *     setCurrentAssistant(assistant);
 *     setInput(message);
 *   };
 * 
 *   return (
 *     <div>
 *       {/* Your chat content *\/}
 *       <AssistantMessageDock 
 *         assistantList={assistantList}
 *         onOpenChat={handleOpenChat}
 *         className="z-50"
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * ## Positioning
 * 
 * The MessageDock is fixed at the bottom center of the viewport with the following CSS:
 * - `position: fixed`
 * - `bottom: 24px` (1.5rem)
 * - `left: 50%` with `transform: translateX(-50%)` for centering
 * - `z-index: 50` (configurable via className prop)
 * 
 * ## Accessibility
 * 
 * - Full keyboard navigation support (Tab, Enter, Escape)
 * - Screen reader compatible with ARIA labels
 * - Respects prefers-reduced-motion for animations
 * - Focus management and focus trap when expanded
 * 
 * @param props - Component props
 * @param props.assistantList - List of assistants from PURECHAT component
 * @param props.onOpenChat - Callback when user sends a message
 * @param props.className - Additional CSS classes for styling
 * 
 * @returns A fixed MessageDock component at the bottom center of the screen
 * 
 * @see {@link MessageDock} for the underlying UI component
 */
export function AssistantMessageDock({
  assistantList: assistantListProp,
  onOpenChat,
  className,
}: AssistantMessageDockProps) {
  
  // Get assistantList from ChatContext (ChatbotChat component) if not provided as prop
  const chatContext = useChatContextOptional();
  const assistantList = assistantListProp ?? chatContext?.assistantList ?? [];
  
  // Get theme information from next-themes
  const { theme, systemTheme } = useTheme();

  // State for dock visibility (collapsed/expanded)
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // State for assistant selector modal
  const [showAssistantSelector, setShowAssistantSelector] = useState(false);

  // State for selected assistant titles (which assistants to show in dock)
  const [selectedAssistantTitles, setSelectedAssistantTitles] = useState<string[]>([]);

  // Load selected assistants from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("messageDock.selectedAssistants");
      if (saved) {
        setSelectedAssistantTitles(JSON.parse(saved));
      } else {
        // Default: show all assistants
        setSelectedAssistantTitles(assistantList.map(a => a.title));
      }
    } catch (error) {
      console.error("Failed to load selected assistants:", error);
      setSelectedAssistantTitles(assistantList.map(a => a.title));
    }
  }, []);

  // Save selected assistants to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "messageDock.selectedAssistants",
        JSON.stringify(selectedAssistantTitles)
      );
    } catch (error) {
      console.error("Failed to save selected assistants:", error);
    }
  }, [selectedAssistantTitles]);

  // Update selected assistants when assistantList changes
  useEffect(() => {
    if (assistantList.length > 0 && selectedAssistantTitles.length === 0) {
      setSelectedAssistantTitles(assistantList.map(a => a.title));
    }
  }, [assistantList]);

  /**
   * Determine the current theme, resolving 'system' to actual theme.
   * This ensures the MessageDock always has a concrete theme value (light/dark).
   */
  const currentTheme = theme === "system" ? systemTheme : theme;

  /**
   * Memoized character list derived from assistantList.
   * 
   * Behavior:
   * - If no assistants exist, returns default placeholder characters
   * - Otherwise, filters assistants based on selectedAssistantTitles
   * - Maps up to 5 selected assistants to Character format
   * - Adds a sparkle button at the beginning for visual interest
   * - Menu button is handled internally by MessageDock component
   * 
   * The memoization prevents unnecessary recalculations when assistantList
   * reference changes but content remains the same.
   */
  const characters = useMemo(() => {
    if (!assistantList || assistantList.length === 0) {
      return defaultCharacters;
    }

    // Filter assistants based on selectedAssistantTitles
    const filteredAssistants = assistantList.filter(assistant =>
      selectedAssistantTitles.includes(assistant.title)
    );

    // Take first 5 selected assistants and map to Character format
    const mappedCharacters = filteredAssistants
      .slice(0, 5)
      .map((assistant, index) => mapAssistantToCharacter(assistant, index));

    // Add sparkle button at the beginning
    return [
      { emoji: "✨", name: "Sparkle", online: false },
      ...mappedCharacters,
      // Menu placeholder is added by MessageDock internally
    ];
  }, [assistantList, selectedAssistantTitles]);

  /**
   * Handles the message send event from the MessageDock.
   * 
   * This function is called when a user types a message and presses send.
   * It validates the selection and routes the message to the parent component
   * via the onOpenChat callback.
   * 
   * Validation:
   * - Skips the sparkle button (index 0) which is decorative
   * - Ensures the character has a valid ID (which is the assistant title)
   * - Verifies the ID is a string (assistant titles are strings)
   * 
   * @param message - The message text entered by the user
   * @param character - The selected character object
   * @param characterIndex - The index of the character in the characters array
   * 
   * @fires onOpenChat - When a valid message is sent with a valid assistant
   */
  const handleMessageSend = (
    message: string,
    character: Character,
    characterIndex: number
  ) => {
    // Skip if it's the sparkle button (index 0) - decorative only
    if (characterIndex === 0 || !character.id) {
      return;
    }

    // Call the onOpenChat handler with assistant title and initial message
    if (onOpenChat && typeof character.id === "string") {
      onOpenChat(character.id, message);
    }
  };

  /**
   * Handles character selection (click) events.
   * 
   * This function is called when a user clicks on a character button to expand
   * the MessageDock. It can be extended with additional logic such as analytics
   * tracking, pre-loading assistant data, or showing tooltips.
   * 
   * Special handling:
   * - Index 0 (sparkle): Toggles dock collapsed state
   * - Other indices: Normal character selection
   * 
   * @param character - The selected character object
   * @param characterIndex - The index of the character in the characters array
   */
  const handleCharacterSelect = (character: Character, characterIndex: number) => {
    // Sparkle button (index 0) toggles dock visibility
    if (character.name === "Sparkle" || characterIndex === 0) {
      setIsDockCollapsed(true);
      return;
    }

    // Log selection for debugging
    console.log("Character selected:", character.name);
  };

  /**
   * Handles the menu button click to open assistant selector
   */
  const handleMenuClick = () => {
    setShowAssistantSelector(true);
  };

  /**
   * Handles toggling an assistant's visibility in the dock
   */
  const handleToggleAssistant = (assistantTitle: string) => {
    setSelectedAssistantTitles((prev: string[]) => {
      if (prev.includes(assistantTitle)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((title: string) => title !== assistantTitle);
      } else {
        // Don't allow more than 5 assistants
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, assistantTitle];
      }
    });
  };

  /**
   * Handles selecting all assistants
   */
  const handleSelectAll = () => {
    setSelectedAssistantTitles(assistantList.slice(0, 5).map((a: Assistant) => a.title));
  };

  /**
   * Handles deselecting all assistants (keeps at least one)
   */
  const handleDeselectAll = () => {
    if (assistantList.length > 0) {
      setSelectedAssistantTitles([assistantList[0].title]);
    }
  };

  // Don't render if dock is collapsed
  if (isDockCollapsed) {
    return (
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer group"
        onClick={() => setIsDockCollapsed(false)}
      >
        <div className="w-14 h-14 rounded-full bg-content1 flex items-center justify-center border border-divider shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)] hover:scale-110 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16),0_6px_20px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)]">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-200">✨</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <MessageDock
        characters={characters}
        onMessageSend={handleMessageSend}
        onCharacterSelect={handleCharacterSelect}
        onMenuClick={handleMenuClick}
        theme={currentTheme === "dark" ? "dark" : "light"}
        className={className}
        expandedWidth={560}
        position="bottom"
        showSparkleButton={true}
        showMenuButton={true}
        enableAnimations={true}
        animationDuration={1}
        placeholder={(name: string) => `Message ${name}...`}
        autoFocus={true}
        closeOnClickOutside={true}
        closeOnEscape={true}
        closeOnSend={true}
      />

      {/* Assistant Selector Modal */}
      <Modal
        isOpen={showAssistantSelector}
        onClose={() => setShowAssistantSelector(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "bg-content1 shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)]",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">选择显示的助理</h3>
            <p className="text-sm text-foreground-500 font-normal">
              最多可选择 5 个助理显示在消息栏中
            </p>
          </ModalHeader>
          <ModalBody>
            {assistantList.length === 0 ? (
              <div className="text-center text-foreground-400 py-8">
                暂无可用助理
              </div>
            ) : (
              <div className="space-y-2">
                {assistantList.map((assistant) => (
                  <div
                    key={assistant.title}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-content2 transition-colors cursor-pointer"
                    onClick={() => handleToggleAssistant(assistant.title)}
                  >
                    <Checkbox
                      isSelected={selectedAssistantTitles.includes(assistant.title)}
                      onValueChange={() => handleToggleAssistant(assistant.title)}
                      isDisabled={
                        selectedAssistantTitles.length >= 5 &&
                        !selectedAssistantTitles.includes(assistant.title)
                      }
                      classNames={{
                        base: "m-0",
                      }}
                    />
                    <span className="text-2xl">{assistant.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">
                        {assistant.title}
                      </div>
                      <div className="text-sm text-foreground-500 line-clamp-1">
                        {assistant.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleDeselectAll}
              className="bg-content2"
            >
              取消全选
            </Button>
            <Button
              variant="flat"
              onPress={handleSelectAll}
              className="bg-content2"
            >
              全选
            </Button>
            <Button
              color="primary"
              onPress={() => setShowAssistantSelector(false)}
            >
              完成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
