import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as fs from 'fs';

// 数据库路径
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'users.db');

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 用户接口
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'user' | 'normal';
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'user' | 'normal';
}

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

class UserDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initializeDatabase();
  }

  /**
   * 初始化数据库表
   */
  private initializeDatabase() {
    // 创建用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
  }

  /**
   * 创建新用户
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const { username, email, password, name, role = 'user' } = input;

    // 检查用户名是否已存在
    const existingUsername = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = this.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 哈希密码
    const password_hash = await bcrypt.hash(password, 10);

    // 插入用户
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(username, email, password_hash, name || username, role);

    // 返回创建的用户
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    return user;
  }

  /**
   * 通过邮箱查找用户
   */
  getUserByEmail(email: string): User | null {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    return user || null;
  }

  /**
   * 通过用户名查找用户
   */
  getUserByUsername(username: string): User | null {
    const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
    return user || null;
  }

  /**
   * 通过ID查找用户
   */
  getUserById(id: number): User | null {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    return user || null;
  }

  /**
   * 验证密码
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新用户角色
   */
  updateUserRole(email: string, role: 'admin' | 'user' | 'normal'): boolean {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET role = ?, updated_at = datetime('now')
      WHERE email = ?
    `);
    const result = stmt.run(role, email);
    return result.changes > 0;
  }

  /**
   * 更新用户密码
   */
  async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE email = ?
    `);
    const result = stmt.run(password_hash, email);
    return result.changes > 0;
  }

  /**
   * 检查是否存在管理员
   */
  hasAdmin(): boolean {
    const admin = this.db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
    return !!admin;
  }

  /**
   * 获取所有用户（不包含密码）
   */
  getAllUsers(): UserWithoutPassword[] {
    const users = this.db.prepare(`
      SELECT id, username, email, name, role, created_at, updated_at 
      FROM users
    `).all() as UserWithoutPassword[];
    return users;
  }

  /**
   * 删除用户
   */
  deleteUser(email: string): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE email = ?');
    const result = stmt.run(email);
    return result.changes > 0;
  }

  /**
   * 关闭数据库连接
   */
  close() {
    this.db.close();
  }
}

// 导出单例实例
export const userDatabase = new UserDatabase();
