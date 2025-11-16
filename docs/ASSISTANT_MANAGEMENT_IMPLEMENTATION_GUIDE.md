# 助理管理系统 - 实现指南

## 📋 当前状态

**已完成：** 40%
- ✅ Spec 文档
- ✅ 数据模型和类型
- ✅ 状态管理
- ✅ 创建/编辑表单

**待完成：** 60%
- ⏳ 任务 4-12

## 🎯 下一步：完成任务 4

### 任务 4：更新助理卡片组件

#### 需要修改的位置

**文件：** `drone-analyzer-nextjs/components/ChatbotChat/index.tsx`

**位置：** 搜索 `marketTab === 'assistants'` （约第 2845 行）

#### 当前代码结构

```typescript
{marketTab === 'assistants' && (
  <div style={{ position: 'relative', minHeight: '400px' }}>
    <Row gutter={[12, 12]}>
      {[
        // 硬编码的助理列表
        { title: "Tello智能代理", desc: "...", emoji: "🚁", prompt: "..." },
        // ... 更多硬编码数据
      ].map((c, idx) => (
        <Col key={idx} ...>
          <div style={{...}}>
            <Avatar>{c.emoji}</Avatar>
            <div>
              <div>{c.title}</div>
              <div>{c.desc}</div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </div>
)}
```

#### 需要替换为

```typescript
{marketTab === 'assistants' && (
  <div style={{ position: 'relative', minHeight: '400px' }}>
    <Row gutter={[12, 12]}>
      {assistantList.map((assistant) => (
        <Col
          key={assistant.id}
          xs={24}
          sm={12}
          md={12}
          lg={8}
          xl={6}
        >
          <div
            style={{
              height: "100%",
              border: "1px solid hsl(var(--heroui-divider))",
              background: "linear-gradient(180deg, hsl(var(--heroui-content1)), hsl(var(--heroui-content1) / 0.5))",
              borderRadius: 14,
              padding: 14,
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => { 
              setSelectedApp({ 
                title: assistant.title, 
                desc: assistant.desc, 
                emoji: assistant.emoji,
                prompt: assistant.prompt
              }); 
              setShowAppDetail(true); 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px hsl(var(--heroui-primary) / 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* 状态标签 */}
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <Tag 
                color={
                  assistant.status === 'published' ? 'green' : 
                  assistant.status === 'draft' ? 'orange' : 
                  assistant.status === 'pending' ? 'red' : 'default'
                }
                style={{ fontSize: 10, padding: '0 6px', lineHeight: '18px' }}
              >
                {assistant.status === 'published' ? '已发布' : 
                 assistant.status === 'draft' ? '草稿' : 
                 assistant.status === 'pending' ? '审核中' : '已拒绝'}
              </Tag>
            </div>
            
            {/* 管理员操作按钮 */}
            {userRole === 'admin' && (
              <div 
                className="admin-actions"
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  display: 'flex', 
                  gap: 4,
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 审核按钮（仅待审核状态显示） */}
                {assistant.status === 'pending' && (
                  <Tooltip title="审核助理">
                    <Button
                      type="text"
                      size="small"
                      icon={<AuditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setReviewingAssistant(assistant);
                        setShowReviewModal(true);
                      }}
                      style={{ 
                        width: 24, 
                        height: 24, 
                        padding: 0,
                        background: 'hsl(var(--heroui-warning))',
                        border: '1px solid hsl(var(--heroui-warning))',
                        color: 'white'
                      }}
                    />
                  </Tooltip>
                )}
                
                {/* 发布/下架按钮 */}
                {assistant.status !== 'pending' && (
                  <Tooltip title={assistant.status === 'published' ? '下架助理' : '发布到市场'}>
                    <Button
                      type="text"
                      size="small"
                      icon={assistant.status === 'published' ? <StopOutlined /> : <RocketOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = assistant.status === 'published' ? 'draft' : 'published';
                        setAssistantList(prev => prev.map(item => 
                          item.id === assistant.id 
                            ? { ...item, status: newStatus, publishedAt: newStatus === 'published' ? new Date() : undefined }
                            : item
                        ));
                        message.success(newStatus === 'published' ? '助理已发布到市场！' : '助理已下架');
                      }}
                      style={{ 
                        width: 24, 
                        height: 24, 
                        padding: 0,
                        background: assistant.status === 'published' ? 'hsl(var(--heroui-danger))' : 'hsl(var(--heroui-success))',
                        border: `1px solid ${assistant.status === 'published' ? 'hsl(var(--heroui-danger))' : 'hsl(var(--heroui-success))'}`,
                        color: 'white'
                      }}
                    />
                  </Tooltip>
                )}
                
                {/* 编辑按钮 */}
                <Tooltip title="编辑助理">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAssistant(assistant);
                      assistantForm.setFieldsValue(assistant);
                    }}
                    style={{ 
                      width: 24, 
                      height: 24, 
                      padding: 0,
                      background: 'hsl(var(--heroui-content2))',
                      border: '1px solid hsl(var(--heroui-divider))'
                    }}
                  />
                </Tooltip>
                
                {/* 删除按钮 */}
                <Popconfirm
                  title="删除助理"
                  description="确定要删除这个助理吗？此操作不可恢复。"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    setAssistantList(prev => prev.filter(item => item.id !== assistant.id));
                    message.success('助理已删除');
                  }}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: 24, 
                      height: 24, 
                      padding: 0,
                      background: 'hsl(var(--heroui-content2))',
                      border: '1px solid hsl(var(--heroui-divider))'
                    }}
                  />
                </Popconfirm>
              </div>
            )}
            
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 20 }}>
              <Avatar size={36} style={{ background: "transparent" }}>{assistant.emoji}</Avatar>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{assistant.title}</div>
                <div style={{ 
                  color: "hsl(var(--heroui-foreground) / 0.5)", 
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {assistant.desc}
                </div>
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </div>
)}
```

### 关键改动说明

1. **使用 assistantList 状态**
   - 从硬编码数组改为 `assistantList.map()`
   - 使用 `assistant.id` 作为 key

2. **添加状态标签**
   - 位置：左上角
   - 颜色：根据状态动态变化
   - 文本：已发布/草稿/审核中/已拒绝

3. **添加管理按钮**
   - 位置：右上角
   - 仅管理员可见
   - 悬停时显示（opacity 0 → 1）
   - 包含：审核、发布/下架、编辑、删除

4. **添加悬停效果**
   - 卡片上浮 2px
   - 添加阴影效果

5. **调整布局**
   - 内容区域 marginTop: 20（为标签和按钮留空间）
   - 描述文本限制 2 行显示

## 🎨 CSS 样式

需要添加全局样式来实现按钮淡入淡出效果：

**位置：** 在组件顶部添加

```typescript
// 添加CSS样式
const globalStyles = `
  .admin-actions {
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  }
  *:hover > .admin-actions {
    opacity: 1 !important;
  }
`;

// 注入样式（在组件内部）
useEffect(() => {
  if (typeof document !== 'undefined') {
    const styleId = 'assistant-management-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = globalStyles;
      document.head.appendChild(styleElement);
    }
  }
}, []);
```

## 📝 任务 5：实现审核对话框

在助理创建/编辑表单对话框之后添加：

```typescript
{/* 助理审核对话框 */}
<Modal
  title="助理审核"
  open={showReviewModal}
  onCancel={() => {
    setShowReviewModal(false);
    setReviewingAssistant(null);
  }}
  footer={null}
  width={700}
>
  {reviewingAssistant && (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Avatar size={48}>{reviewingAssistant.emoji}</Avatar>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{reviewingAssistant.title}</div>
            <div style={{ color: 'hsl(var(--heroui-foreground) / 0.5)', fontSize: 12 }}>
              作者：{reviewingAssistant.author} | 创建时间：{reviewingAssistant.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>助理描述</div>
          <div style={{ 
            background: 'hsl(var(--heroui-content2))', 
            padding: 12, 
            borderRadius: 8 
          }}>
            {reviewingAssistant.desc}
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>标签</div>
          <div>
            {reviewingAssistant.tags?.map((tag: string) => (
              <Tag key={tag} color="blue">{tag}</Tag>
            )) || <span style={{ color: 'hsl(var(--heroui-foreground) / 0.5)' }}>无标签</span>}
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>公开设置</div>
          <Tag color={reviewingAssistant.isPublic ? 'green' : 'orange'}>
            {reviewingAssistant.isPublic ? '公开' : '私有'}
          </Tag>
        </div>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>系统提示词</div>
        <div style={{ 
          background: 'hsl(var(--heroui-content2))', 
          padding: 16, 
          borderRadius: 8,
          maxHeight: 200,
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {reviewingAssistant.prompt}
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <Button 
          danger
          onClick={() => {
            setAssistantList(prev => prev.map(item => 
              item.id === reviewingAssistant.id 
                ? { ...item, status: 'rejected', reviewedAt: new Date() }
                : item
            ));
            message.success('助理审核已拒绝');
            setShowReviewModal(false);
            setReviewingAssistant(null);
          }}
          style={{ marginRight: 8 }}
        >
          拒绝
        </Button>
        <Button 
          type="primary"
          onClick={() => {
            setAssistantList(prev => prev.map(item => 
              item.id === reviewingAssistant.id 
                ? { ...item, status: 'published', reviewedAt: new Date(), publishedAt: new Date() }
                : item
            ));
            message.success('助理审核通过并已发布到市场！');
            setShowReviewModal(false);
            setReviewingAssistant(null);
          }}
        >
          通过并发布
        </Button>
      </div>
    </div>
  )}
</Modal>
```

## 🚀 快速实施步骤

1. **打开文件**
   ```
   drone-analyzer-nextjs/components/ChatbotChat/index.tsx
   ```

2. **搜索并替换市场助理列表**
   - 搜索：`marketTab === 'assistants'`
   - 找到硬编码的助理数组
   - 替换为使用 `assistantList.map()`

3. **添加 CSS 样式**
   - 在组件顶部添加 globalStyles
   - 添加 useEffect 注入样式

4. **添加审核对话框**
   - 在创建/编辑表单之后添加审核 Modal

5. **测试功能**
   - 测试状态标签显示
   - 测试管理按钮悬停效果
   - 测试编辑、删除、发布功能
   - 测试审核功能

## ✅ 验证清单

- [ ] 助理列表使用 assistantList 状态
- [ ] 状态标签正确显示
- [ ] 管理按钮悬停时显示
- [ ] 编辑按钮打开表单并预填充数据
- [ ] 删除按钮显示确认对话框
- [ ] 发布/下架按钮切换状态
- [ ] 审核按钮打开审核对话框
- [ ] 审核对话框显示完整信息
- [ ] 通过/拒绝按钮更新状态
- [ ] 卡片悬停效果正常
- [ ] 无 TypeScript 错误

## 📚 相关文档

- **Spec 文档**: `.kiro/specs/assistant-management-system/`
- **设计文档**: `design.md`
- **任务列表**: `tasks.md`
- **进度报告**: `ASSISTANT_MANAGEMENT_FINAL_STATUS.md`

## 💡 提示

- 由于文件较大（4600+行），建议使用编辑器的搜索功能定位代码
- 可以分步实施，先完成助理列表更新，再添加管理按钮
- 测试时注意检查 userRole 状态是否为 'admin'
- 所有必要的导入和状态都已添加，可以直接使用

## 🎯 完成后

完成任务 4 和 5 后，助理管理系统的完成度将达到约 60-70%。

剩余工作主要是：
- 任务 6：添加创建按钮（已部分完成）
- 任务 7-9：权限控制和边界情况
- 任务 10-12：测试和优化
