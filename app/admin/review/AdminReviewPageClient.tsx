'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  Pagination,
  Switch,
  Space,
  Badge,
  message
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAssistants, type Assistant } from '@/contexts/AssistantContext';
import { formatDate } from '@/lib/utils/dateUtils';
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';
import { AdminAuthResult } from '@/lib/auth/withAdminAuth';
import styles from '@/styles/AdminReviewPage.module.css';

const { TextArea } = Input;

interface AdminReviewPageClientProps {
  authResult: AdminAuthResult;
}

/**
 * Admin Review Page Client Component
 * Requirements: 3.3, 3.4, 3.5
 * This component handles the full review functionality for authenticated admins
 */
const AdminReviewPageClient: React.FC<AdminReviewPageClientProps> = ({ authResult }) => {
  // 使用共享的 Context (Requirements: 8.1, 8.2)
  const { 
    assistantList, 
    updateAssistantStatus, 
    updateAssistant, 
    deleteAssistant, 
    refreshAssistants, 
    isLoading: contextLoading,
    openCreateSidebar,
    sidebarState,
    closeSidebar,
    addAssistant
  } = useAssistants();

  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, contextHolder] = Modal.useModal();

  // Get current user for permission checks (Requirements: 8.1, 8.2, 8.3)
  const currentUser = useCurrentUser();
  
  // Check if user can create assistants (admin only)
  const canCreate = React.useMemo(() => {
    return assistantPermissionService.canCreate(currentUser).allowed;
  }, [currentUser]);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    emoji: '🤖',
    prompt: '',
    tags: [] as string[],
    isPublic: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 过滤数据
  const filteredData = assistantList.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       item.desc.toLowerCase().includes(searchText.toLowerCase()) ||
                       item.author.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // 分页
  const rowsPerPage = 10;
  const pages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // 查看详情
  const handleViewDetail = (record: Assistant) => {
    setSelectedAssistant(record);
    setShowDetailModal(true);
  };

  // 显示确认对话框
  const showConfirm = (title: string, content: string, onConfirm: () => void, isDanger = false) => {
    modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: isDanger },
      onOk: onConfirm,
    });
  };

  // 审核通过
  const handleApprove = (record: Assistant) => {
    showConfirm(
      '确认通过审核',
      `确定要通过"${record.title}"的审核并上架到商城吗？`,
      async () => {
        setLoading(true);
        try {
          await updateAssistantStatus(record.id, 'published');
          await refreshAssistants();
          message.success(`"${record.title}"已通过审核并上架到商城！`);
        } catch (error) {
          console.error('审核失败:', error);
          message.error('审核失败,请重试');
        } finally {
          setTimeout(() => setLoading(false), 500);
        }
      }
    );
  };

  // 审核拒绝
  const handleReject = (record: Assistant) => {
    showConfirm(
      '确认拒绝审核',
      `确定要拒绝"${record.title}"的审核吗？`,
      async () => {
        setLoading(true);
        try {
          await updateAssistantStatus(record.id, 'rejected');
          await refreshAssistants();
          message.warning(`"${record.title}"已被拒绝`);
        } catch (error) {
          console.error('拒绝失败:', error);
          message.error('拒绝失败,请重试');
        } finally {
          setTimeout(() => setLoading(false), 500);
        }
      },
      true
    );
  };

  // 编辑助理
  const handleEdit = (record: Assistant) => {
    setEditingAssistant(record);
    setFormData({
      title: record.title,
      desc: record.desc,
      emoji: record.emoji,
      prompt: record.prompt,
      tags: record.tags || [],
      isPublic: record.isPublic,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.title) errors.title = '请输入助理名称';
    if (!formData.desc) errors.desc = '请输入助理描述';
    if (formData.desc.length > 200) errors.desc = '描述不能超过200字符';
    if (!formData.prompt) errors.prompt = '请输入系统提示词';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingAssistant) {
      try {
        await updateAssistant(editingAssistant.id, formData);
        await refreshAssistants();
        message.success('助理更新成功！');
        setShowEditModal(false);
        setEditingAssistant(null);
        setFormData({ title: '', desc: '', emoji: '🤖', prompt: '', tags: [], isPublic: false });
      } catch (error) {
        console.error('更新失败:', error);
        message.error('更新失败,请重试');
      }
    }
  };

  // 删除助理
  const handleDelete = (record: Assistant) => {
    showConfirm(
      '确认删除',
      `确定要删除"${record.title}"吗？此操作不可恢复。`,
      async () => {
        setLoading(true);
        try {
          await deleteAssistant(record.id);
          message.success(`"${record.title}"已删除`);
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败,请重试');
        } finally {
          setTimeout(() => setLoading(false), 500);
        }
      },
      true
    );
  };

  // 批量审核通过
  const handleBatchApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审核的助理');
      return;
    }

    showConfirm(
      '批量审核通过',
      `确定要通过选中的 ${selectedRowKeys.length} 个助理的审核并上架到商城吗？`,
      async () => {
        setLoading(true);
        try {
          await Promise.all(
            selectedRowKeys.map((id) => 
              updateAssistantStatus(String(id), 'published')
            )
          );
          message.success(`已批量通过 ${selectedRowKeys.length} 个助理的审核！`);
          setSelectedRowKeys([]);
        } catch (error) {
          console.error('批量审核失败:', error);
          message.error('批量审核失败,请重试');
        } finally {
          setTimeout(() => setLoading(false), 500);
        }
      }
    );
  };

  // 批量审核拒绝
  const handleBatchReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审核的助理');
      return;
    }

    showConfirm(
      '批量审核拒绝',
      `确定要拒绝选中的 ${selectedRowKeys.length} 个助理的审核吗？`,
      async () => {
        setLoading(true);
        try {
          await Promise.all(
            selectedRowKeys.map((id) => 
              updateAssistantStatus(String(id), 'rejected')
            )
          );
          message.warning(`已批量拒绝 ${selectedRowKeys.length} 个助理`);
          setSelectedRowKeys([]);
        } catch (error) {
          console.error('批量拒绝失败:', error);
          message.error('批量拒绝失败,请重试');
        } finally {
          setTimeout(() => setLoading(false), 500);
        }
      },
      true
    );
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'warning',
      published: 'success',
      rejected: 'error',
      draft: 'default',
    };
    return colorMap[status] || 'default';
  };

  // 获取状态文本
  const getStatusText = (status: string): string => {
    const textMap: Record<string, string> = {
      pending: '待审核',
      published: '已发布',
      rejected: '已拒绝',
      draft: '草稿',
    };
    return textMap[status] || status;
  };

  // 表格列定义
  const columns = [
    {
      title: '助理',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (_: any, record: Assistant) => (
        <div className={styles.assistantInfo}>
          <Avatar size={48} style={{ backgroundColor: '#f0f0f0' }}>
            <span style={{ fontSize: '24px' }}>{record.emoji}</span>
          </Avatar>
          <div className={styles.assistantContent}>
            <div className={styles.assistantTitle}>{record.title}</div>
            <div className={styles.assistantDesc}>
              {record.desc}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags?.map((tag, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Assistant) => (
        <Space wrap size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className={styles.pageContainer}>
      {contextHolder}
      <div className={styles.contentWrapper}>
        <Card className="w-full shadow-lg">
          <div className={styles.headerSection}>
            <div className={styles.headerTop}>
              <div className={styles.headerTitle}>
                <div className={styles.iconWrapper}>
                  <EyeOutlined />
                </div>
                <div className={styles.titleContent}>
                  <h1 className={styles.titleText}>助理审核管理</h1>
                  <p className={styles.titleDesc}>管理和审核用户提交的助理</p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Badge count={filteredData.filter(item => item.status === 'pending').length} showZero>
                  <Tag color="warning" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600 }}>
                    待审核
                  </Tag>
                </Badge>
                
                {canCreate && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<RobotOutlined />}
                    onClick={openCreateSidebar}
                  >
                    创建助理
                  </Button>
                )}
              </div>
            </div>
            <div className={styles.searchSection}>
              <Input
                placeholder="搜索助理名称、描述或作者..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ flex: 1, minWidth: '300px' }}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="pending">待审核</Select.Option>
                <Select.Option value="published">已发布</Select.Option>
                <Select.Option value="rejected">已拒绝</Select.Option>
              </Select>
            </div>
          </div>
          <div className={styles.tableSection}>
            {selectedRowKeys.length > 0 && (
              <div className={styles.selectionBar}>
                <Space>
                  <Tag color="blue">已选择 {selectedRowKeys.length} 项</Tag>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={handleBatchApprove}
                  >
                    批量通过
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={handleBatchReject}
                  >
                    批量拒绝
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSelectedRowKeys([])}
                  >
                    取消选择
                  </Button>
                </Space>
              </div>
            )}

            <Table
              columns={columns}
              dataSource={paginatedData}
              rowSelection={rowSelection}
              rowKey="id"
              loading={loading || contextLoading}
              pagination={false}
              locale={{ emptyText: '暂无数据' }}
            />
            
            {pages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={page}
                  total={filteredData.length}
                  pageSize={rowsPerPage}
                  onChange={setPage}
                  showSizeChanger={false}
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            )}
          </div>
        </Card>

        {/* 详情对话框 */}
        <Modal
          title={
            <Space>
              <EyeOutlined style={{ color: '#1890ff' }} />
              <span>助理详情</span>
            </Space>
          }
          open={showDetailModal}
          onCancel={() => {
            setShowDetailModal(false);
            setSelectedAssistant(null);
          }}
          width={800}
          footer={
            selectedAssistant?.status === 'pending' ? [
              <Button key="close" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>,
              <Button
                key="reject"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  if (selectedAssistant) {
                    handleReject(selectedAssistant);
                    setShowDetailModal(false);
                  }
                }}
              >
                拒绝
              </Button>,
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  if (selectedAssistant) {
                    handleApprove(selectedAssistant);
                    setShowDetailModal(false);
                  }
                }}
              >
                通过并上架
              </Button>,
            ] : [
              <Button key="close" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>,
            ]
          }
        >
          <div className={styles.modalContent}>
            {selectedAssistant && (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className={styles.detailHeader}>
                  <Avatar size={64} style={{ backgroundColor: '#f0f0f0' }}>
                    <span style={{ fontSize: '32px' }}>{selectedAssistant.emoji}</span>
                  </Avatar>
                  <div className={styles.detailHeaderContent}>
                    <h3 className={styles.detailTitle}>
                      {selectedAssistant.title}
                    </h3>
                    <div className={styles.detailMeta}>
                      <Tag color={getStatusColor(selectedAssistant.status)}>
                        {getStatusText(selectedAssistant.status)}
                      </Tag>
                      <span className={styles.detailMetaItem}>
                        作者：{selectedAssistant.author}
                      </span>
                      <span className={styles.detailMetaItem}>
                        提交时间：{formatDate(selectedAssistant.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailLabel}>助理描述</h4>
                  <div className={styles.detailValue}>
                    {selectedAssistant.desc}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailLabel}>标签</h4>
                  <Space wrap>
                    {selectedAssistant.tags?.map((tag, index) => (
                      <Tag key={`${selectedAssistant.id}-detail-tag-${index}`} color="blue">
                        {tag}
                      </Tag>
                    )) || <span style={{ color: 'var(--admin-text-tertiary)' }}>无标签</span>}
                  </Space>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailLabel}>公开设置</h4>
                  <Tag color={selectedAssistant.isPublic ? 'success' : 'warning'}>
                    {selectedAssistant.isPublic ? '公开' : '私有'}
                  </Tag>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailLabel}>系统提示词</h4>
                  <div className={styles.promptBox}>
                    {selectedAssistant.prompt}
                  </div>
                </div>
              </Space>
            )}
          </div>
        </Modal>

        {/* 编辑助理对话框 */}
        <Modal
          title={
            <Space>
              <EditOutlined style={{ color: '#1890ff' }} />
              <span>编辑助理</span>
            </Space>
          }
          open={showEditModal}
          onCancel={() => {
            setShowEditModal(false);
            setEditingAssistant(null);
            setFormData({ title: '', desc: '', emoji: '🤖', prompt: '', tags: [], isPublic: false });
            setFormErrors({});
          }}
          width={800}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setShowEditModal(false);
                setEditingAssistant(null);
                setFormData({ title: '', desc: '', emoji: '🤖', prompt: '', tags: [], isPublic: false });
                setFormErrors({});
              }}
            >
              取消
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveEdit}>
              保存
            </Button>,
          ]}
        >
          <div className={styles.modalContent}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className={styles.formRow}>
                <div className={styles.formFieldFlex}>
                  <label className={styles.formLabel}>
                    助理名称<span className={styles.required}>*</span>
                  </label>
                  <Input
                    placeholder="输入助理名称"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    status={formErrors.title ? 'error' : ''}
                  />
                  {formErrors.title && <div className={styles.errorText}>{formErrors.title}</div>}
                </div>
                <div className={styles.formFieldFixed}>
                  <label className={styles.formLabel}>
                    图标<span className={styles.required}>*</span>
                  </label>
                  <Select
                    value={formData.emoji}
                    onChange={(value) => setFormData({ ...formData, emoji: value })}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="🤖">🤖 机器人</Select.Option>
                    <Select.Option value="✈️">✈️ 无人机</Select.Option>
                    <Select.Option value="🐢">🐢 海龟</Select.Option>
                    <Select.Option value="📚">📚 书籍</Select.Option>
                    <Select.Option value="🐍">🐍 Python</Select.Option>
                    <Select.Option value="💼">💼 商务</Select.Option>
                    <Select.Option value="🎨">🎨 艺术</Select.Option>
                    <Select.Option value="🔬">🔬 科学</Select.Option>
                    <Select.Option value="📊">📊 数据</Select.Option>
                    <Select.Option value="🎵">🎵 音乐</Select.Option>
                    <Select.Option value="🍓">🍓 草莓</Select.Option>
                    <Select.Option value="⏳">⏳ 时间</Select.Option>
                    <Select.Option value="🧪">🧪 实验</Select.Option>
                    <Select.Option value="🍿">🍿 美食</Select.Option>
                    <Select.Option value="👨‍💻">👨‍💻 程序员</Select.Option>
                    <Select.Option value="🗣️">🗣️ 口语</Select.Option>
                  </Select>
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  助理描述<span className={styles.required}>*</span>
                </label>
                <TextArea
                  placeholder="简要描述助理的功能和特点（最多200字符）"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  maxLength={200}
                  rows={3}
                  showCount
                  status={formErrors.desc ? 'error' : ''}
                />
                {formErrors.desc && <div className={styles.errorText}>{formErrors.desc}</div>}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  系统提示词<span className={styles.required}>*</span>
                </label>
                <TextArea
                  placeholder="定义助理的角色、能力和行为规范"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={8}
                  showCount
                  status={formErrors.prompt ? 'error' : ''}
                />
                {formErrors.prompt && <div className={styles.errorText}>{formErrors.prompt}</div>}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>标签</label>
                <Input
                  placeholder="输入标签，用逗号分隔"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })}
                />
              </div>

              <div className={styles.formField}>
                <div className={styles.switchWrapper}>
                  <Switch
                    checked={formData.isPublic}
                    onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <span className={styles.switchLabel}>{formData.isPublic ? '公开' : '私有'}</span>
                </div>
              </div>
            </Space>
          </div>
        </Modal>

        {/* AssistantSettingsSidebar - 统一的创建/编辑侧边栏 */}
        <AssistantSettingsSidebar
          visible={sidebarState.visible}
          onClose={closeSidebar}
          mode={sidebarState.mode}
          assistant={sidebarState.assistant}
          onSave={async (data: any) => {
            if (sidebarState.mode === 'create') {
              const formData: any = {
                name: data.name || '',
                description: data.description || '',
                systemPrompt: data.systemPrompt || '',
                avatarEmoji: data.avatarEmoji || '🤖',
                avatarBg: data.avatarBg,
                tags: data.tags,
                openingMessage: data.openingMessage,
                openingQuestions: data.openingQuestions,
                preprocessTemplate: data.preprocessTemplate,
                autoCreateTopic: data.autoCreateTopic,
                autoCreateTopicThreshold: data.autoCreateTopicThreshold,
                historyLimit: data.historyLimit,
                attachCount: data.attachCount,
                enableAutoSummary: data.enableAutoSummary,
                stream: data.stream,
                creativity: data.creativity,
                openness: data.openness,
                divergence: data.divergence,
                vocabulary: data.vocabulary,
                singleReplyLimitEnabled: data.singleReplyLimitEnabled,
                singleReplyLimit: data.singleReplyLimit,
                reasoningStrengthEnabled: data.reasoningStrengthEnabled,
                reasoningStrength: data.reasoningStrength,
                unipixelEnabled: data.unipixelEnabled,
                unipixelMode: data.unipixelMode,
                unipixelEndpoint: data.unipixelEndpoint,
              };
              await addAssistant(formData);
              message.success('助理创建成功！');
            } else if (sidebarState.mode === 'edit' && sidebarState.assistant) {
              await updateAssistant(sidebarState.assistant.id, {
                title: data.name || '',
                desc: data.description || '',
                emoji: data.avatarEmoji || '🤖',
                prompt: data.systemPrompt || '',
                tags: typeof data.tags === 'string' 
                  ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                  : [],
                isPublic: data.isPublic ?? false,
              });
              message.success('助理更新成功！');
            }
          }}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default AdminReviewPageClient;
