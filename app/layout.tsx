import "@/styles/globals.css";
// 引入 antd 基础样式重置，保证组件视觉一致性
import "antd/dist/reset.css";
// 引入 Admin Review 主题变量
import "@/styles/admin-review-theme.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";

import { Providers } from "./providers";
import { LightThemeBackground } from "@/components/LightThemeBackground";
import { DarkThemeBackground } from "@/components/DarkThemeBackground";
import { IntelligentAgentInitializer } from "@/components/IntelligentAgentInitializer";
import { NotificationContainer } from "@/components/NotificationContainer";
import { AssistantCacheWarmer } from "@/components/AssistantCacheWarmer";

import { siteConfig } from "@/config/site";
// 移除 next/font 的导入以规避开发模式下的字体模块错误
// import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen min-h-[100dvh] text-foreground font-sans antialiased",
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <IntelligentAgentInitializer />
          <AssistantCacheWarmer />
          <NotificationContainer />
          <LightThemeBackground />
          <DarkThemeBackground />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: '',
              style: {
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                style: {
                  background: 'hsl(var(--heroui-success) / 0.1)',
                  color: 'hsl(var(--heroui-success))',
                  border: '1px solid hsl(var(--heroui-success) / 0.3)',
                },
                iconTheme: {
                  primary: 'hsl(var(--heroui-success))',
                  secondary: 'hsl(var(--heroui-success-foreground))',
                },
              },
              error: {
                style: {
                  background: 'hsl(var(--heroui-danger) / 0.1)',
                  color: 'hsl(var(--heroui-danger))',
                  border: '1px solid hsl(var(--heroui-danger) / 0.3)',
                },
                iconTheme: {
                  primary: 'hsl(var(--heroui-danger))',
                  secondary: 'hsl(var(--heroui-danger-foreground))',
                },
              },
              loading: {
                style: {
                  background: 'hsl(var(--heroui-content2))',
                  color: 'hsl(var(--heroui-foreground))',
                  border: '1px solid hsl(var(--heroui-divider))',
                },
                iconTheme: {
                  primary: 'hsl(var(--heroui-primary))',
                  secondary: 'hsl(var(--heroui-primary-foreground))',
                },
              },
            }}
          />
          <SonnerToaster position="top-right" richColors />
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </Providers>
      </body>
    </html>
  );
}