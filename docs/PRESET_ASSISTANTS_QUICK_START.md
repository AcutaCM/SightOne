# Preset Assistants - Quick Start Guide

## Overview

This guide helps you quickly get started with the preset assistants expansion feature.

## Installation

### 1. Run Database Migration

```bash
npm run migrate:preset-assistants
```

This will:
- Create a backup of your database
- Add new columns to assistants table
- Create favorites, ratings, and usage_logs tables
- Create performance indexes
- Validate data integrity

### 2. Verify Migration

```bash
npm run db:check
```

## Using Preset Assistants

### Import Constants

```typescript
import { 
  PRESET_ASSISTANTS,
  AssistantCategory,
  CATEGORY_LABELS,
  getAssistantsByCategory,
  searchAssistants,
  getAssistantById,
  getAllTags
} from '@/lib/constants/presetAssistants';
```

### Get All Preset Assistants

```typescript
// Get all 10 preset assistants
const assistants = PRESET_ASSISTANTS;

console.log(`Total assistants: ${assistants.length}`);
// Output: Total assistants: 10
```

### Filter by Category

```typescript
// Get productivity assistants
const productivityAssistants = getAssistantsByCategory(
  AssistantCategory.PRODUCTIVITY
);

// Get creative assistants
const creativeAssistants = getAssistantsByCategory(
  AssistantCategory.CREATIVE
);
```

### Search Assistants

```typescript
// Search by keyword
const results = searchAssistants('编程');
// Returns: [编程助手]

const droneResults = searchAssistants('无人机');
// Returns: [Tello智能代理]

const imageResults = searchAssistants('图像');
// Returns: [图像分析助手]
```

### Get Assistant by ID

```typescript
const assistant = getAssistantById('tello-intelligent-agent');

if (assistant) {
  console.log(assistant.title);    // "Tello智能代理"
  console.log(assistant.emoji);    // "🚁"
  console.log(assistant.category); // ["specialized", "productivity"]
}
```

### Get All Tags

```typescript
const tags = getAllTags();
// Returns: ["AI", "Excel", "Figma", "JavaScript", "OpenCV", ...]
```

### Get Category Labels

```typescript
import { getCategoryLabel, AssistantCategory } from '@/lib/constants/presetAssistants';

// Get Chinese label
const zhLabel = getCategoryLabel(AssistantCategory.PRODUCTIVITY, 'zh');
// Returns: "生产力工具"

// Get English label
const enLabel = getCategoryLabel(AssistantCategory.PRODUCTIVITY, 'en');
// Returns: "Productivity"
```

## Available Categories

```typescript
enum AssistantCategory {
  PRODUCTIVITY = 'productivity',    // 生产力工具
  CREATIVE = 'creative',            // 创意设计
  DEVELOPMENT = 'development',      // 技术开发
  EDUCATION = 'education',          // 教育学习
  BUSINESS = 'business',            // 商业服务
  SPECIALIZED = 'specialized',      // 专业领域
}
```

## Available Preset Assistants

| ID | Title | Emoji | Categories | Tags |
|----|-------|-------|------------|------|
| `tello-intelligent-agent` | Tello智能代理 | 🚁 | specialized, productivity | 无人机, 智能控制, AI, 自然语言, Tello |
| `agriculture-diagnosis-expert` | 农业诊断专家 | 🌱 | specialized | 农业, 病虫害, 诊断, 草莓, 植物保护 |
| `image-analysis-assistant` | 图像分析助手 | 📸 | specialized, development | 图像识别, YOLO, 目标检测, 计算机视觉 |
| `data-analyst` | 数据分析师 | 📊 | productivity, business | 数据分析, 统计, 可视化, 报告 |
| `coding-assistant` | 编程助手 | 💻 | development | 编程, Python, JavaScript, 代码审查 |
| `writing-assistant` | 写作助手 | ✍️ | productivity, creative | 写作, 文案, 润色, 创意 |
| `translation-assistant` | 翻译助手 | 🌐 | productivity | 翻译, 多语言, 本地化 |
| `education-tutor` | 教育辅导老师 | 👨‍🏫 | education | 教育, 辅导, 学习, 答疑 |
| `customer-service` | 客服助手 | 💬 | business | 客服, 咨询, 问答, 服务 |
| `creative-designer` | 创意设计师 | 🎨 | creative | 设计, 创意, UI/UX, 品牌 |

## Database Schema

### Assistants Table (Extended)

```sql
CREATE TABLE assistants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  prompt TEXT NOT NULL,
  tags TEXT,
  category TEXT,              -- NEW: JSON array
  is_public INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  reviewed_at TEXT,
  published_at TEXT,
  review_note TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  usage_count INTEGER NOT NULL DEFAULT 0,  -- NEW
  rating REAL NOT NULL DEFAULT 0.0         -- NEW
);
```

### New Tables

**Favorites**
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, assistant_id)
);
```

**Ratings**
```sql
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, assistant_id)
);
```

**Usage Logs**
```sql
CREATE TABLE usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  duration INTEGER,
  created_at TEXT NOT NULL
);
```

## TypeScript Types

### PresetAssistant Interface

```typescript
interface PresetAssistant extends Omit<Assistant, 'createdAt' | 'updatedAt'> {
  category: AssistantCategory[];
  usageCount: number;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Statistics Types

```typescript
interface AssistantStats {
  assistantId: string;
  totalUses: number;
  averageRating: number;
  totalRatings: number;
  favoriteCount: number;
  averageDuration?: number;
}

interface AssistantFavorite {
  id: number;
  userId: string;
  assistantId: string;
  createdAt: Date;
}

interface AssistantRating {
  id: number;
  userId: string;
  assistantId: string;
  rating: number;
  feedback?: string;
  createdAt: Date;
}

interface UsageLog {
  id: number;
  userId: string;
  assistantId: string;
  duration?: number;
  createdAt: Date;
}
```

## Example: Display Assistants by Category

```typescript
import { 
  PRESET_ASSISTANTS, 
  AssistantCategory,
  getCategoryLabel 
} from '@/lib/constants/presetAssistants';

function AssistantMarket() {
  const categories = Object.values(AssistantCategory);
  
  return (
    <div>
      {categories.map(category => {
        const assistants = PRESET_ASSISTANTS.filter(a => 
          a.category.includes(category)
        );
        
        return (
          <section key={category}>
            <h2>{getCategoryLabel(category, 'zh')}</h2>
            <div className="grid">
              {assistants.map(assistant => (
                <AssistantCard 
                  key={assistant.id} 
                  assistant={assistant} 
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

## Example: Search Implementation

```typescript
import { searchAssistants } from '@/lib/constants/presetAssistants';
import { useState } from 'react';

function AssistantSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const searchResults = searchAssistants(searchQuery);
    setResults(searchResults);
  };
  
  return (
    <div>
      <input 
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索助理..."
      />
      <div>
        {results.map(assistant => (
          <AssistantCard 
            key={assistant.id} 
            assistant={assistant} 
          />
        ))}
      </div>
    </div>
  );
}
```

## Troubleshooting

### Migration Issues

If migration fails:
```bash
# Check database status
npm run db:check

# View migration logs
cat data/logs/migration.log

# Restore from backup
cp data/backups/assistants_pre_migration_*.db data/assistants.db
```

### Type Errors

Ensure you're using the correct import:
```typescript
// ✅ Correct
import { PresetAssistant } from '@/lib/constants/presetAssistants';

// ❌ Wrong
import { Assistant } from '@/types/assistant';
```

## Next Steps

1. Implement preset assistant initialization service (Task 2.1)
2. Create category navigation component (Task 3.1)
3. Build search functionality (Task 3.2)
4. Add favorites and ratings features (Tasks 4.2, 5.2)

## Resources

- [Migration Guide](./PRESET_ASSISTANTS_MIGRATION.md)
- [Task 1 Complete Summary](./TASK_1_PRESET_ASSISTANTS_INFRASTRUCTURE_COMPLETE.md)
- [Design Document](../.kiro/specs/preset-assistants-expansion/design.md)
- [Requirements](../.kiro/specs/preset-assistants-expansion/requirements.md)

## Support

For questions or issues:
1. Check the documentation
2. Review the migration logs
3. Consult the design document
4. Contact the development team
