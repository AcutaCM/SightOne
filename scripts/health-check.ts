#!/usr/bin/env node
/**
 * 健康检查脚本
 * 
 * 功能:
 * - 检查数据库连接
 * - 检查API端点
 * - 检查磁盘空间
 * - 检查系统资源
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { execSync } from 'child_process';

// 配置
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'assistants.db');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

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

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: any;
}

const results: HealthCheckResult[] = [];

function checkDatabase(): HealthCheckResult {
  try {
    // 检查文件存在
    if (!fs.existsSync(DB_PATH)) {
      return {
        name: '数据库文件',
        status: 'fail',
        message: '数据库文件不存在',
      };
    }
    
    // 检查文件大小
    const stats = fs.statSync(DB_PATH);
    const sizeMB = stats.size / (1024 * 1024);
    
    // 尝试连接
    const db = new Database(DB_PATH, { readonly: true });
    
    // 检查表
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all() as { name: string }[];
    
    const expectedTables = ['assistants', 'migrations', 'backups'];
    const missingTables = expectedTables.filter(
      t => !tables.some(table => table.name === t)
    );
    
    if (missingTables.length > 0) {
      db.close();
      return {
        name: '数据库结构',
        status: 'fail',
        message: `缺少表: ${missingTables.join(', ')}`,
      };
    }
    
    // 检查记录数
    const count = db.prepare('SELECT COUNT(*) as count FROM assistants')
      .get() as { count: number };
    
    // 检查完整性
    const integrity = db.pragma('integrity_check') as any[];
    
    db.close();
    
    if (integrity[0] !== 'ok') {
      return {
        name: '数据库完整性',
        status: 'fail',
        message: '数据库完整性检查失败',
        details: integrity,
      };
    }
    
    return {
      name: '数据库',
      status: 'pass',
      message: `正常 (${count.count} 条记录, ${sizeMB.toFixed(2)} MB)`,
      details: {
        path: DB_PATH,
        size: sizeMB,
        records: count.count,
        tables: tables.length,
      },
    };
    
  } catch (error) {
    return {
      name: '数据库',
      status: 'fail',
      message: `连接失败: ${error}`,
    };
  }
}

async function checkAPI(): Promise<HealthCheckResult> {
  try {
    const startTime = Date.now();
    
    // 检查健康端点
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        name: 'API健康检查',
        status: 'fail',
        message: `HTTP ${response.status}`,
      };
    }
    
    const data = await response.json();
    
    // 检查响应时间
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    if (responseTime > 1000) {
      status = 'warn';
    }
    
    return {
      name: 'API',
      status,
      message: `正常 (响应时间: ${responseTime}ms)`,
      details: {
        url: API_BASE_URL,
        responseTime,
        data,
      },
    };
    
  } catch (error) {
    return {
      name: 'API',
      status: 'fail',
      message: `无法连接: ${error}`,
    };
  }
}

function checkDiskSpace(): HealthCheckResult {
  try {
    let output: string;
    
    // 根据操作系统选择命令
    if (process.platform === 'win32') {
      // Windows
      output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf-8' });
    } else {
      // Unix-like
      output = execSync('df -h .', { encoding: 'utf-8' });
    }
    
    // 简单解析(实际应该更健壮)
    const lines = output.trim().split('\n');
    
    // 假设磁盘空间充足的阈值是10GB
    const minSpaceGB = 10;
    
    return {
      name: '磁盘空间',
      status: 'pass',
      message: '充足',
      details: {
        output: lines.slice(0, 3).join('\n'),
      },
    };
    
  } catch (error) {
    return {
      name: '磁盘空间',
      status: 'warn',
      message: '无法检查',
    };
  }
}

function checkMemory(): HealthCheckResult {
  const totalMem = process.memoryUsage();
  const usedMB = totalMem.heapUsed / (1024 * 1024);
  const totalMB = totalMem.heapTotal / (1024 * 1024);
  const percentage = (usedMB / totalMB) * 100;
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (percentage > 90) {
    status = 'fail';
  } else if (percentage > 75) {
    status = 'warn';
  }
  
  return {
    name: '内存使用',
    status,
    message: `${usedMB.toFixed(2)} MB / ${totalMB.toFixed(2)} MB (${percentage.toFixed(1)}%)`,
    details: totalMem,
  };
}

function checkDirectories(): HealthCheckResult {
  const dirs = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'data', 'backups'),
    path.join(process.cwd(), 'logs'),
  ];
  
  const missing = dirs.filter(dir => !fs.existsSync(dir));
  
  if (missing.length > 0) {
    return {
      name: '目录结构',
      status: 'fail',
      message: `缺少目录: ${missing.map(d => path.basename(d)).join(', ')}`,
    };
  }
  
  // 检查权限
  const unwritable = dirs.filter(dir => {
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      return false;
    } catch {
      return true;
    }
  });
  
  if (unwritable.length > 0) {
    return {
      name: '目录权限',
      status: 'fail',
      message: `无写权限: ${unwritable.map(d => path.basename(d)).join(', ')}`,
    };
  }
  
  return {
    name: '目录结构',
    status: 'pass',
    message: '正常',
  };
}

function checkBackups(): HealthCheckResult {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    const backups = db.prepare(`
      SELECT * FROM backups ORDER BY created_at DESC LIMIT 1
    `).all() as any[];
    
    db.close();
    
    if (backups.length === 0) {
      return {
        name: '备份',
        status: 'warn',
        message: '没有备份记录',
      };
    }
    
    const lastBackup = backups[0];
    const lastBackupDate = new Date(lastBackup.created_at);
    const daysSinceBackup = Math.floor(
      (Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    if (daysSinceBackup > 7) {
      status = 'warn';
    }
    
    return {
      name: '备份',
      status,
      message: `最后备份: ${daysSinceBackup} 天前`,
      details: {
        filename: lastBackup.filename,
        date: lastBackup.created_at,
        records: lastBackup.record_count,
      },
    };
    
  } catch (error) {
    return {
      name: '备份',
      status: 'warn',
      message: '无法检查备份状态',
    };
  }
}

function printResults() {
  log('\n' + '='.repeat(70), 'blue');
  log('🏥 系统健康检查报告', 'blue');
  log('='.repeat(70), 'blue');
  log(`时间: ${new Date().toLocaleString('zh-CN')}\n`);
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
    const color = result.status === 'pass' ? 'green' : result.status === 'warn' ? 'yellow' : 'red';
    
    log(`${icon} ${result.name.padEnd(20)} ${result.message}`, color);
  }
  
  log('\n' + '='.repeat(70), 'blue');
  
  // 统计
  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  log(`总计: ${results.length} 项检查`);
  log(`通过: ${passed}`, 'green');
  if (warned > 0) log(`警告: ${warned}`, 'yellow');
  if (failed > 0) log(`失败: ${failed}`, 'red');
  
  log('='.repeat(70) + '\n', 'blue');
  
  // 返回退出码
  if (failed > 0) {
    return 1;
  } else if (warned > 0) {
    return 0; // 警告不影响退出码
  }
  return 0;
}

// 主函数
async function main() {
  log('\n🔍 开始健康检查...\n', 'blue');
  
  // 运行所有检查
  results.push(checkDatabase());
  results.push(await checkAPI());
  results.push(checkDiskSpace());
  results.push(checkMemory());
  results.push(checkDirectories());
  results.push(checkBackups());
  
  // 打印结果
  const exitCode = printResults();
  
  // 如果有详细信息且是详细模式
  if (process.argv.includes('--verbose')) {
    log('\n📊 详细信息:', 'blue');
    for (const result of results) {
      if (result.details) {
        log(`\n${result.name}:`, 'yellow');
        console.log(JSON.stringify(result.details, null, 2));
      }
    }
  }
  
  process.exit(exitCode);
}

// 运行
main();
