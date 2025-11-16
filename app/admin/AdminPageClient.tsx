"use client";

import React, { useEffect, useState } from "react";
// HeroUI Components
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
  Button,
  Badge,
  Avatar,
  Chip,
} from "@heroui/react";
// Icons from lucide-react
import {
  Mail,
  UserPlus,
  Save,
  AlertTriangle,
  Users,
  AlertCircle,
  LogIn,
  Shield,
} from "lucide-react";
// Toast notification system
import { toast } from "sonner";
import { AdminAuthResult } from "@/lib/auth/withAdminAuth";

type UserRole = "admin" | "normal";
type UserRecord = { email: string; role: UserRole };

interface AdminPageClientProps {
  authResult: AdminAuthResult;
}

/**
 * Admin Page Client Component
 * Handles all client-side interactions for the admin page
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
export default function AdminPageClient({ authResult }: AdminPageClientProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [hasAdmin, setHasAdmin] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<UserRole>("normal");
  const [busy, setBusy] = useState(false);

  // Determine if current user is authenticated and is admin
  const isAuthenticated = authResult.isAuthenticated;
  const isAdmin = authResult.isAdmin;
  const currentUser = authResult.user;

  async function refreshUsers() {
    try {
      const r = await fetch("/api/admin/users/list");
      if (!r.ok) {
        setUsers([]);
        setHasAdmin(false);
        return;
      }
      const d = await r.json();
      setUsers(Array.isArray(d?.users) ? d.users : []);
      setHasAdmin(!!d?.hasAdmin);
    } catch {
      setUsers([]);
      setHasAdmin(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      refreshUsers();
    }
  }, [isAdmin]);

  async function handleLogin(email: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error("登录失败", {
          description: d?.error || `错误代码: ${r.status}`,
          action: {
            label: "重试",
            onClick: () => handleLogin(email)
          }
        });
      } else {
        toast.success("登录成功", {
          description: `已登录为 ${d.email}（角色：${d.role}）`,
          duration: 3000
        });
        // Reload page to refresh server-side auth
        window.location.reload();
      }
    } catch (e: any) {
      toast.error("登录异常", {
        description: e?.message || String(e),
        action: {
          label: "重试",
          onClick: () => handleLogin(email)
        }
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleBootstrapAdmin(email: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error("引导失败", {
          description: d?.error || `错误代码: ${r.status}`
        });
      } else {
        toast.success("管理员设置成功", {
          description: `${d.email} 已被设为管理员，请使用该邮箱登录以获取管理员权限`
        });
        await refreshUsers();
      }
    } catch (e: any) {
      toast.error("引导异常", {
        description: e?.message || String(e)
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirmAndSetRole(email: string, role: UserRole) {
    // Show confirmation dialog for role changes
    const roleText = role === "admin" ? "管理员" : "普通用户";
    const currentUser = users.find(u => u.email === email);
    const currentRoleText = currentUser?.role === "admin" ? "管理员" : "普通用户";
    
    const confirmed = window.confirm(
      `确认要将 ${email} 的角色从 ${currentRoleText} 更改为 ${roleText} 吗？\n\n此操作将立即生效。`
    );
    
    if (!confirmed) {
      return;
    }

    await handleSetRole(email, role);
  }

  async function handleSetRole(email: string, role: UserRole) {
    const roleText = role === "admin" ? "管理员" : "普通用户";
    
    setBusy(true);
    try {
      const r = await fetch("/api/admin/users/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error("设置角色失败", {
          description: d?.error || `错误代码: ${r.status}`,
          action: {
            label: "重试",
            onClick: () => handleSetRole(email, role)
          }
        });
      } else {
        toast.success("角色设置成功", {
          description: `已将 ${email} 设置为 ${roleText}`,
          duration: 3000
        });
        setEmailInput(""); // Clear input after success
        await refreshUsers();
      }
    } catch (e: any) {
      toast.error("设置角色异常", {
        description: e?.message || String(e),
        action: {
          label: "重试",
          onClick: () => handleSetRole(email, role)
        }
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* PageHeader Component */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">管理员后台</h1>
            <p className="text-sm sm:text-base text-default-500 mt-1 sm:mt-2">用户管理和系统配置</p>
          </div>
          {currentUser && (
            <Chip 
              color={isAdmin ? "success" : "default"} 
              variant="flat"
              avatar={<Avatar name={currentUser.email} size="sm" />}
              className="self-start sm:self-center"
            >
              <span className="font-medium text-sm sm:text-base">{currentUser.email}</span>
              <span className="text-xs ml-1">({currentUser.role})</span>
            </Chip>
          )}
        </div>
      </div>

      {/* Show login section for unauthenticated users - Requirement 4.2 */}
      {!isAuthenticated && (
        <>
          {/* BootstrapSection Component - Show when no admin exists */}
          {!hasAdmin && (
            <Card className="mb-4 sm:mb-6 bg-warning-50 dark:bg-warning-50/10 border-2 border-warning-200 dark:border-warning-300/30">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-200/20 flex-shrink-0">
                    <AlertTriangle className="text-warning-600 dark:text-warning-500" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-warning-900 dark:text-warning-600">
                      系统初始化
                    </h2>
                    <p className="text-xs sm:text-sm text-warning-700 dark:text-warning-600/80 mt-0.5">
                      尚无管理员账户，需要进行一次性引导设置
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                <div className="bg-warning-100/50 dark:bg-warning-200/10 rounded-lg p-3 sm:p-4 border border-warning-200 dark:border-warning-300/20">
                  <h3 className="text-xs sm:text-sm font-semibold text-warning-900 dark:text-warning-600 mb-2">
                    引导说明
                  </h3>
                  <ul className="text-xs sm:text-sm text-warning-800 dark:text-warning-600/90 space-y-1 sm:space-y-1.5 list-disc list-inside">
                    <li>输入要设为管理员的邮箱地址</li>
                    <li>点击"引导设为管理员"按钮完成初始化</li>
                    <li>完成后使用该邮箱登录以获取管理员权限</li>
                    <li>此操作仅在系统无管理员时可用</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Input
                    placeholder="输入管理员邮箱"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    startContent={<Mail className="text-warning-600" size={18} />}
                    className="w-full"
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-warning-900 dark:text-warning-600",
                      inputWrapper: "border-warning-300 dark:border-warning-400/30 hover:border-warning-400 dark:hover:border-warning-400/50"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && emailInput && !busy) {
                        handleBootstrapAdmin(emailInput);
                      }
                    }}
                  />
                  <Button
                    color="warning"
                    variant="solid"
                    size="lg"
                    isLoading={busy}
                    isDisabled={!emailInput}
                    onPress={() => handleBootstrapAdmin(emailInput)}
                    className="w-full font-semibold"
                    startContent={!busy && <UserPlus size={18} />}
                  >
                    引导设为管理员
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-xs text-warning-700 dark:text-warning-600/80 bg-warning-50 dark:bg-warning-100/5 rounded-md p-2.5 sm:p-3 border border-warning-200/50 dark:border-warning-300/10">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>安全提示：</strong>
                    引导操作将赋予指定邮箱完整的管理员权限，请确保邮箱地址正确且安全。
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* LoginSection Component */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-200/20 flex-shrink-0">
                  <LogIn className="text-primary-600 dark:text-primary-500" size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">登录</h2>
                  <p className="text-xs sm:text-sm text-default-500 mt-0.5">
                    请先登录以访问管理功能
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="输入邮箱登录"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  startContent={<Mail className="text-default-400" size={18} />}
                  className="w-full"
                  variant="bordered"
                  size="lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && emailInput && !busy) {
                      handleLogin(emailInput);
                    }
                  }}
                />
                <Button
                  color="primary"
                  size="lg"
                  isLoading={busy}
                  isDisabled={!emailInput}
                  onPress={() => handleLogin(emailInput)}
                  className="w-full"
                  startContent={!busy && <LogIn size={18} />}
                >
                  登录该邮箱
                </Button>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Show admin interface only for authenticated admins - Requirement 4.3 */}
      {isAuthenticated && !isAdmin && (
        // Add proper error messages for access denied - Requirement 4.5
        <Card className="bg-danger-50 dark:bg-danger-50/10 border-2 border-danger-200 dark:border-danger-300/30">
          <CardBody className="px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-danger-100 dark:bg-danger-200/20">
                <Shield className="text-danger-600 dark:text-danger-500" size={32} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-danger-900 dark:text-danger-600 mb-2">
                  访问被拒绝
                </h3>
                <p className="text-sm sm:text-base text-danger-800 dark:text-danger-600/90">
                  你不是管理员，无法访问此页面。
                </p>
                <p className="text-xs sm:text-sm text-danger-700 dark:text-danger-600/80 mt-2">
                  如需管理权限，请联系系统管理员。
                </p>
              </div>
              {currentUser && (
                <div className="mt-2 p-3 bg-danger-100/50 dark:bg-danger-200/10 rounded-lg border border-danger-200 dark:border-danger-300/20">
                  <p className="text-xs text-danger-800 dark:text-danger-600/90">
                    当前登录: <strong>{currentUser.email}</strong> (角色: {currentUser.role})
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Show admin interface only for authenticated admins - Requirement 4.3 */}
      {isAuthenticated && isAdmin && (
        <>
          {/* UserManagementCard Component */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-200/20 flex-shrink-0">
                  <UserPlus className="text-primary-600 dark:text-primary-500" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">设置用户角色</h2>
                  <p className="text-xs sm:text-sm text-default-500 mt-0.5">
                    为用户分配管理员或普通用户权限
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-4 sm:px-6">
              <div className="flex flex-col gap-3">
                <Input
                  label="用户邮箱"
                  placeholder="输入目标用户邮箱"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  startContent={<Mail className="text-default-400" size={18} />}
                  className="w-full"
                  variant="bordered"
                  size="lg"
                  labelPlacement="outside"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && emailInput && !busy) {
                      handleSetRole(emailInput, roleInput);
                    }
                  }}
                />
                <Select
                  label="角色"
                  placeholder="选择角色"
                  selectedKeys={[roleInput]}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full"
                  variant="bordered"
                  size="lg"
                  labelPlacement="outside"
                >
                  <SelectItem key="normal">
                    普通用户
                  </SelectItem>
                  <SelectItem key="admin">
                    管理员
                  </SelectItem>
                </Select>
                <Button
                  color="primary"
                  size="lg"
                  isLoading={busy}
                  isDisabled={!emailInput}
                  onPress={() => handleSetRole(emailInput, roleInput)}
                  className="w-full"
                  startContent={!busy && <Save size={18} />}
                >
                  保存角色
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* UserListCard Component */}
          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-default-100 dark:bg-default-200/20 flex-shrink-0">
                  <Users className="text-default-600 dark:text-default-500" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">用户列表</h2>
                  <p className="text-xs sm:text-sm text-default-500 mt-0.5">
                    查看和管理所有系统用户
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-4 sm:px-6">
              {users.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="mx-auto text-default-300 mb-3 sm:mb-4" size={40} />
                  <p className="text-sm sm:text-base text-default-500">暂无用户记录</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table 
                    aria-label="用户列表"
                    classNames={{
                      wrapper: "shadow-none",
                      th: "bg-default-100 dark:bg-default-200/20 text-default-700 dark:text-default-400 text-xs sm:text-sm",
                      td: "text-default-900 dark:text-default-200 text-xs sm:text-sm"
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="text-default-700 dark:text-default-400">用户</TableColumn>
                      <TableColumn className="text-default-700 dark:text-default-400">角色</TableColumn>
                      <TableColumn className="text-default-700 dark:text-default-400">操作</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow 
                          key={user.email}
                          className="hover:bg-default-100/50 dark:hover:bg-default-200/10 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar 
                                name={user.email} 
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <span className="font-medium truncate max-w-[150px] sm:max-w-none">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              color={user.role === "admin" ? "success" : "default"}
                              variant="flat"
                              className="font-medium"
                              size="sm"
                            >
                              {user.role === "admin" ? "管理员" : "普通"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="flat"
                              color={user.role === "admin" ? "default" : "success"}
                              isLoading={busy}
                              onPress={() => confirmAndSetRole(user.email, user.role === "admin" ? "normal" : "admin")}
                              className="font-medium text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]"
                            >
                              {user.role === "admin" ? "降为普通" : "升为管理"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
