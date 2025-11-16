#!/usr/bin/env node
/**
 * 数据库初始化脚本
 * 
 * 功能:
 * - 创建必要的目录结构
 * - 初始化SQLite数据库
 * - 创建所有表和索引
 * - 运行初始迁移
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// 配置
const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const LOGS_DIR = path.join(process.cwd(), 'logs');
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

function createDirectories() {
  log('\n📁 创建目录结构...', 'blue');
  
  const dirs = [DATA_DIR, BACKUP_DIR, LOGS_DIR];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`  ✓ 创建目录: ${dir}`, 'green');
    } else {
      log(`  ✓ 目录已存在: ${dir}`, 'yellow');
    }
  }
}

function initializeDatabase() {
  log('\n💾 初始化数据库...', 'blue');
  
  try {
    const db = new Database(DB_PATH);
    
    // 启用WAL模式
    db.pragma('journal_mode = WAL');
    log('  ✓ 启用WAL模式', 'green');
    
    // 创建assistants表
    db.exec(`
      CREATE TABLE IF NOT EXISTS assistants (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        desc TEXT NOT NULL,
        emoji TEXT NOT NULL DEFAULT '🤖',
        prompt TEXT NOT NULL,
        tags TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        author TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        reviewed_at TEXT,
        published_at TEXT,
        review_note TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
      );
    `);
    log('  ✓ 创建assistants表', 'green');
    
    // 创建索引
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_assistants_status ON assistants(status);
      CREATE INDEX IF NOT EXISTS idx_assistants_author ON assistants(author);
      CREATE INDEX IF NOT EXISTS idx_assistants_created_at ON assistants(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_assistants_published_at ON assistants(published_at DESC);
    `);
    log('  ✓ 创建索引', 'green');
    
    // 创建migrations表
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL,
        description TEXT
      );
    `);
    log('  ✓ 创建migrations表', 'green');
    
    // 创建backups表
    db.exec(`
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        created_at TEXT NOT NULL,
        record_count INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        is_auto INTEGER NOT NULL DEFAULT 0
      );
    `);
    log('  ✓ 创建backups表', 'green');
    
    // 记录初始迁移
    const migrationExists = db.prepare(
      'SELECT COUNT(*) as count FROM migrations WHERE version = ?'
    ).get('1.0.0') as { count: number };
    
    if (migrationExists.count === 0) {
      db.prepare(`
        INSERT INTO migrations (version, applied_at, description)
        VALUES (?, ?, ?)
      `).run('1.0.0', new Date().toISOString(), 'Initial schema');
      log('  ✓ 记录初始迁移', 'green');
    }
    
    db.close();
    log('\n✅ 数据库初始化完成!', 'green');
    
  } catch (error) {
    log(`\n❌ 数据库初始化失败: ${error}`, 'red');
    process.exit(1);
  }
}

function verifySetup() {
  log('\n🔍 验证设置...', 'blue');
  
  // 检查数据库文件
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    log(`  ✓ 数据库文件: ${DB_PATH} (${(stats.size / 1024).toFixed(2)} KB)`, 'green');
  } else {
    log('  ❌ 数据库文件不存在', 'red');
    return false;
  }
  
  // 检查表
  try {
    const db = new Database(DB_PATH);
    
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all() as { name: string }[];
    
    const expectedTables = ['assistants', 'migrations', 'backups'];
    const existingTables = tables.map(t => t.name);
    
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        log(`  ✓ 表存在: ${table}`, 'green');
      } else {
        log(`  ❌ 表不存在: ${table}`, 'red');
        return false;
      }
    }
    
    db.close();
    return true;
    
  } catch (error) {
    log(`  ❌ 验证失败: ${error}`, 'red');
    return false;
  }
}

function printSummary() {
  log('\n' + '='.repeat(50), 'blue');
  log('📊 初始化摘要', 'blue');
  log('='.repeat(50), 'blue');
  log(`数据库路径: ${DB_PATH}`);
  log(`备份目录: ${BACKUP_DIR}`);
  log(`日志目录: ${LOGS_DIR}`);
  log('\n下一步:');
  log('  1. 配置环境变量 (.env.local)');
  log('  2. 启动应用: npm run dev');
  log('  3. 访问: http://localhost:3000');
  log('='.repeat(50) + '\n', 'blue');
}

// 主函数
function main() {
  log('\n🚀 开始初始化助理市场数据持久化系统...', 'blue');
  
  try {
    createDirectories();
    initializeDatabase();
    
    if (verifySetup()) {
      printSummary();
      process.exit(0);
    } else {
      log('\n❌ 验证失败,请检查错误信息', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ 初始化失败: ${error}`, 'red');
    process.exit(1);
  }
}

// 运行
main();
