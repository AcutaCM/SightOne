/**
 * UI 組件統一導出
 * 
 * 本文件統一導出所有 HeroUI 組件，確保項目中使用一致的 UI 組件庫
 * 
 * @module components/ui
 * @author 前端團隊
 * @lastModified 2025-10-09
 */

// ============= 基礎組件 =============

/**
 * 按鈕組件
 * @see https://heroui.com/docs/components/button
 */
export { Button } from '@heroui/button';
export type { ButtonProps } from '@heroui/button';

/**
 * 卡片組件
 * @see https://heroui.com/docs/components/card
 */
export { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
export type { CardProps } from '@heroui/card';

/**
 * 輸入框組件
 * @see https://heroui.com/docs/components/input
 */
export { Input } from '@heroui/input';
export type { InputProps } from '@heroui/input';

/**
 * 下拉選擇組件
 * @see https://heroui.com/docs/components/select
 */
export { Select, SelectItem, SelectSection } from '@heroui/select';
export type { SelectProps } from '@heroui/select';

// ============= 數據展示 =============

/**
 * 徽章組件
 * @see https://heroui.com/docs/components/badge
 */
export { Badge } from '@heroui/badge';
export type { BadgeProps } from '@heroui/badge';

/**
 * 標籤組件
 * @see https://heroui.com/docs/components/chip
 */
export { Chip } from '@heroui/chip';
export type { ChipProps } from '@heroui/chip';

/**
 * 代碼顯示組件
 * @see https://heroui.com/docs/components/code
 */
export { Code } from '@heroui/code';
export type { CodeProps } from '@heroui/code';

/**
 * 進度條組件
 * @see https://heroui.com/docs/components/progress
 */
export { Progress } from '@heroui/progress';
export type { ProgressProps } from '@heroui/progress';

/**
 * 代碼片段組件
 * @see https://heroui.com/docs/components/snippet
 */
export { Snippet } from '@heroui/snippet';
export type { SnippetProps } from '@heroui/snippet';

// ============= 反饋組件 =============

/**
 * 模態框組件
 * @see https://heroui.com/docs/components/modal
 */
export { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure
} from '@heroui/modal';
export type { ModalProps } from '@heroui/modal';

// ============= 導航組件 =============

/**
 * 鏈接組件
 * @see https://heroui.com/docs/components/link
 */
export { Link } from '@heroui/link';
export type { LinkProps } from '@heroui/link';

/**
 * 標籤頁組件
 * @see https://heroui.com/docs/components/tabs
 */
export { Tabs, Tab } from '@heroui/tabs';
export type { TabsProps } from '@heroui/tabs';

/**
 * 下拉菜單組件
 * @see https://heroui.com/docs/components/dropdown
 */
export { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection
} from '@heroui/dropdown';
export type { DropdownProps } from '@heroui/dropdown';

/**
 * 列表框組件
 * @see https://heroui.com/docs/components/listbox
 */
export { Listbox, ListboxItem, ListboxSection } from '@heroui/listbox';
export type { ListboxProps } from '@heroui/listbox';

// ============= 佈局組件 =============

/**
 * 分隔線組件
 * @see https://heroui.com/docs/components/divider
 */
export { Divider } from '@heroui/divider';
export type { DividerProps } from '@heroui/divider';

/**
 * 間隔組件
 * @see https://heroui.com/docs/components/spacer
 */
export { Spacer } from '@heroui/spacer';
export type { SpacerProps } from '@heroui/spacer';

/**
 * 滾動陰影組件
 * @see https://heroui.com/docs/components/scroll-shadow
 */
export { ScrollShadow } from '@heroui/scroll-shadow';
export type { ScrollShadowProps } from '@heroui/scroll-shadow';

// ============= 表單組件 =============

/**
 * 開關組件
 * @see https://heroui.com/docs/components/switch
 */
export { Switch } from '@heroui/switch';
export type { SwitchProps } from '@heroui/switch';

// ============= 其他組件 =============

/**
 * 用戶頭像組件
 * @see https://heroui.com/docs/components/avatar
 */
export { Avatar } from '@heroui/avatar';
export type { AvatarProps } from '@heroui/avatar';

/**
 * 鍵盤按鍵組件
 * @see https://heroui.com/docs/components/kbd
 */
export { Kbd } from '@heroui/kbd';
export type { KbdProps } from '@heroui/kbd';

/**
 * 用戶信息組件
 * @see https://heroui.com/docs/components/user
 */
export { User } from '@heroui/user';
export type { UserProps } from '@heroui/user';

// ============= 自定義 UI 組件 =============

/**
 * 自定義卡片組件（兼容舊版 Shadcn UI）
 * 用於需要更細粒度控制的場景
 */
export { Card as CardShadcn, CardContent, CardDescription, CardFooter as CardFooterShadcn, CardHeader as CardHeaderShadcn, CardTitle } from './card';

/**
 * 自定義按鈕組件（兼容舊版 Shadcn UI）
 * 用於需要更多變體的場景
 */
export { Button as ButtonShadcn } from './button';

/**
 * 自定義徽章組件（兼容舊版 Shadcn UI）
 */
export { Badge as BadgeShadcn } from './badge';

// ============= 工具函數 =============

/**
 * 主題 Provider
 * @see https://heroui.com/docs/customization/theme
 */
export { HeroUIProvider } from '@heroui/react';

/**
 * 系統配置
 */
export { heroui } from '@heroui/theme';

// ============= 使用示例 =============

/**
 * @example
 * // 基本使用
 * import { Button, Card, CardBody } from '@/components/ui';
 * 
 * function MyComponent() {
 *   return (
 *     <Card>
 *       <CardBody>
 *         <Button color="primary">點擊我</Button>
 *       </CardBody>
 *     </Card>
 *   );
 * }
 * 
 * @example
 * // 使用模態框
 * import { Button, Modal, ModalContent, ModalBody, useDisclosure } from '@/components/ui';
 * 
 * function MyModal() {
 *   const { isOpen, onOpen, onClose } = useDisclosure();
 *   
 *   return (
 *     <>
 *       <Button onPress={onOpen}>打開模態框</Button>
 *       <Modal isOpen={isOpen} onClose={onClose}>
 *         <ModalContent>
 *           <ModalBody>模態框內容</ModalBody>
 *         </ModalContent>
 *       </Modal>
 *     </>
 *   );
 * }
 * 
 * @example
 * // 使用自定義主題
 * import { HeroUIProvider } from '@/components/ui';
 * 
 * function App() {
 *   return (
 *     <HeroUIProvider theme="drone-theme">
 *       {children}
 *     </HeroUIProvider>
 *   );
 * }
 */










