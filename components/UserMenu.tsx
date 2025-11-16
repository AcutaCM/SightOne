"use client";

import React from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { User } from "@heroui/user";
import { LogOut, Settings, User as UserIcon, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'pilot':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'pilot':
        return '飞行员';
      case 'user':
        return '用户';
      default:
        return '用户';
    }
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color={getRoleColor(user.role)}
          name={user.name || user.username}
          size="sm"
          src={user.avatar}
        />
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="用户菜单" 
        variant="flat"
        className="w-64"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'none'
        }}
        onAction={(key) => {
          if (key === 'settings') {
            router.push('/settings');
          } else if (key === 'admin') {
            // TODO: 实现管理面板跳转
            console.log('跳转到管理面板');
          }
        }}
      >
        <DropdownItem key="profile" className="h-14 gap-2" textValue="用户信息">
          <User
            name={user.name || user.username}
            description={
              <div className="flex items-center gap-2 text-xs">
                <span>{user.email}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  user.role === 'admin' 
                    ? 'bg-danger/10 text-danger'
                    : user.role === 'pilot'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-default/10 text-default-600'
                }`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            }
            avatarProps={{
              size: "sm",
              src: user.avatar,
              name: user.name || user.username
            }}
          />
        </DropdownItem>
        
        <DropdownItem
          key="settings"
          startContent={<Settings className="w-4 h-4" />}
        >
          账户设置
        </DropdownItem>
        
        <DropdownItem
          key="logout"
          color="danger"
          startContent={<LogOut className="w-4 h-4" />}
          onPress={logout}
        >
          退出登录
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}