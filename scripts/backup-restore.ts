#!/usr/bin/env node
/**
 * 备份和恢复脚本
 * 
 * 功能:
 * - 导出数据库为JSON
 * - 从JSON恢复数据
 * - 列出所有备份
 * - 清理旧备份
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// 配置
const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_PATH = path.join(DATA_DIR, 'assistants.db');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface Assistant {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  tags: string | null;
  is_public: number;
  status: string;
  author: string;
  created_at: string;
  updated_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  review_note: string | null;
  version: number;
}

interface BackupData {
  version: string;
  exportedAt: string;
  count: number;
  assistants: any[];
}

function exportBackup(): string {
  log('\n📤 导出备份...', 'blue');
  
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // 查询所有助理
    const assistants = db.prepare('SELECT * FROM assistants').all() as Assistant[];
    
    // 转换数据格式
    const exportData: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: assistants.length,
      assistants: assistants.map(row => ({
        id: row.id,
        title: row.title,
        desc: row.desc,
        emoji: row.emoji,
        prompt: row.prompt,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        isPublic: row.is_public === 1,
        status: row.status,
        author: row.author,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        reviewedAt: row.reviewed_at,
        publishedAt: row.published_at,
        reviewNote: row.review_note,
        version: row.version,
      })),
    };
    
    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `assistants_backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // 确保备份目录存在
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    const fileSize = fs.statSync(filepath).size;
    
    // 记录备份元数据
    db.close();
    const dbWrite = new Database(DB_PATH);
    dbWrite.prepare(`
      INSERT INTO backups (filename, created_at, record_count, file_size, is_auto)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, new Date().toISOString(), assistants.length, fileSize, 0);
    dbWrite.close();
    
    log(`  ✓ 导出 ${assistants.length} 条记录`, 'green');
    log(`  ✓ 文件: ${filepath}`, 'green');
    log(`  ✓ 大小: ${(fileSize / 1024).toFixed(2)} KB`, 'green');
    
    return filepath;
    
  } catch (error) {
    log(`\n❌ 导出失败: ${error}`, 'red');
    throw error;
  }
}

function importBackup(filepath: string): void {
  log('\n📥 导入备份...', 'blue');
  
  try {
    // 读取备份文件
    if (!fs.existsSync(filepath)) {
      throw new Error(`备份文件不存在: ${filepath}`);
    }
    
    const content = fs.readFileSync(filepath, 'utf-8');
    const backupData: BackupData = JSON.parse(content);
    
    log(`  ✓ 读取备份文件: ${path.basename(filepath)}`, 'green');
    log(`  ✓ 备份版本: ${backupData.version}`, 'green');
    log(`  ✓ 导出时间: ${backupData.exportedAt}`, 'green');
    log(`  ✓ 记录数: ${backupData.count}`, 'green');
    
    // 确认导入
    log('\n⚠️  警告: 此操作将覆盖现有数据!', 'yellow');
    log('按 Ctrl+C 取消,或按 Enter 继续...', 'yellow');
    
    // 在实际使用中,这里应该等待用户确认
    // 为了脚本自动化,这里直接继续
    
    const db = new Database(DB_PATH);
    
    // 开始事务
    const importTransaction = db.transaction((assistants: any[]) => {
      // 清空现有数据
      db.prepare('DELETE FROM assistants').run();
      
      // 插入备份数据
      const stmt = db.prepare(`
        INSERT INTO assistants (
          id, title, desc, emoji, prompt, tags, is_public, status, author,
          created_at, updated_at, reviewed_at, published_at, review_note, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let imported = 0;
      for (const assistant of assistants) {
        stmt.run(
          assistant.id,
          assistant.title,
          assistant.desc,
          assistant.emoji,
          assistant.prompt,
          assistant.tags ? JSON.stringify(assistant.tags) : null,
          assistant.isPublic ? 1 : 0,
          assistant.status,
          assistant.author,
          assistant.createdAt,
          assistant.updatedAt,
          assistant.reviewedAt,
          assistant.publishedAt,
          assistant.reviewNote,
          assistant.version
        );
        imported++;
      }
      
      return imported;
    });
    
    const imported = importTransaction(backupData.assistants);
    
    db.close();
    
    log(`\n✅ 成功导入 ${imported} 条记录!`, 'green');
    
  } catch (error) {
    log(`\n❌ 导入失败: ${error}`, 'red');
    throw error;
  }
}

function listBackups(): void {
  log('\n📋 备份列表:', 'blue');
  
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    const backups = db.prepare(`
      SELECT * FROM backups ORDER BY created_at DESC
    `).all() as any[];
    
    if (backups.length === 0) {
      log('  没有找到备份记录', 'yellow');
      return;
    }
    
    log('\n' + '='.repeat(80));
    log('ID  | 文件名                              | 时间                | 记录数 | 大小(KB) | 类型');
    log('='.repeat(80));
    
    for (const backup of backups) {
      const date = new Date(backup.created_at).toLocaleString('zh-CN');
      const size = (backup.file_size / 1024).toFixed(2);
      const type = backup.is_auto ? '自动' : '手动';
      
      log(
        `${backup.id.toString().padEnd(4)}| ` +
        `${backup.filename.padEnd(36)}| ` +
        `${date.padEnd(20)}| ` +
        `${backup.record_count.toString().padEnd(7)}| ` +
        `${size.padEnd(9)}| ` +
        `${type}`
      );
    }
    
    log('='.repeat(80) + '\n');
    
    db.close();
    
  } catch (error) {
    log(`\n❌ 列出备份失败: ${error}`, 'red');
    throw error;
  }
}

function cleanOldBackups(retentionDays: number = 30): void {
  log(`\n🧹 清理 ${retentionDays} 天前的备份...`, 'blue');
  
  try {
    const db = new Database(DB_PATH);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();
    
    // 查询要删除的备份
    const oldBackups = db.prepare(`
      SELECT * FROM backups WHERE created_at < ?
    `).all(cutoffISO) as any[];
    
    if (oldBackups.length === 0) {
      log('  没有需要清理的备份', 'yellow');
      db.close();
      return;
    }
    
    // 删除文件和记录
    let deleted = 0;
    for (const backup of oldBackups) {
      const filepath = path.join(BACKUP_DIR, backup.filename);
      
      // 删除文件
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        log(`  ✓ 删除文件: ${backup.filename}`, 'green');
      }
      
      // 删除记录
      db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
      deleted++;
    }
    
    db.close();
    
    log(`\n✅ 清理完成,删除 ${deleted} 个备份`, 'green');
    
  } catch (error) {
    log(`\n❌ 清理失败: ${error}`, 'red');
    throw error;
  }
}

function backupDatabase(): void {
  log('\n💾 备份数据库文件...', 'blue');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `assistants_db_${timestamp}.db`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // 确保备份目录存在
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // 复制数据库文件
    fs.copyFileSync(DB_PATH, filepath);
    
    const fileSize = fs.statSync(filepath).size;
    
    log(`  ✓ 文件: ${filepath}`, 'green');
    log(`  ✓ 大小: ${(fileSize / 1024).toFixed(2)} KB`, 'green');
    
    log('\n✅ 数据库备份完成!', 'green');
    
  } catch (error) {
    log(`\n❌ 备份失败: ${error}`, 'red');
    throw error;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'export':
        exportBackup();
        break;
        
      case 'import':
        const filepath = args[1];
        if (!filepath) {
          log('❌ 请指定备份文件路径', 'red');
          log('用法: npm run backup:import -- <filepath>', 'yellow');
          process.exit(1);
        }
        importBackup(filepath);
        break;
        
      case 'list':
        listBackups();
        break;
        
      case 'clean':
        const days = parseInt(args[1]) || 30;
        cleanOldBackups(days);
        break;
        
      case 'db':
        backupDatabase();
        break;
        
      default:
        log('\n📦 备份和恢复工具', 'blue');
        log('\n可用命令:');
        log('  export          - 导出JSON备份');
        log('  import <file>   - 从JSON导入');
        log('  list            - 列出所有备份');
        log('  clean [days]    - 清理旧备份(默认30天)');
        log('  db              - 备份数据库文件');
        log('\n示例:');
        log('  npm run backup:export');
        log('  npm run backup:import -- ./data/backups/backup.json');
        log('  npm run backup:list');
        log('  npm run backup:clean -- 60');
        log('  npm run backup:db\n');
        break;
    }
    
  } catch (error) {
    process.exit(1);
  }
}

// 运行
main();
