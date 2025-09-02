import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

class DatabaseInitializer {
  private connection: mysql.Connection | null = null;

  async initialize() {
    try {
      console.log('🚀 Starting database initialization...');

      // 首先使用root连接创建数据库和用户
      await this.createDatabaseAndUser();

      // 然后使用应用用户连接创建表结构
      await this.createTables();

      console.log('✅ Database initialization completed successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    } finally {
      await this.closeConnection();
    }
  }

  private async createDatabaseAndUser() {
    const rootConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_ROOT_USER || 'root',
      password: process.env.DB_ROOT_PASSWORD || '',
    };

    try {
      this.connection = await mysql.createConnection(rootConfig);

      // 读取并执行初始化SQL
      const initSqlPath = path.join(__dirname, 'init.sql');
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      
      // 分割SQL语句并执行
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await this.connection.execute(statement);
            console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
          } catch (error) {
            console.warn(`⚠️ Could not execute: ${statement.substring(0, 50)}...`);
            console.warn(`Error: ${(error as Error).message}`);
          }
        }
      }

    } catch (error) {
      console.error('Failed to create database and user:', error);
      throw error;
    }
  }

  private async createTables() {
    const appConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'crawler_user',
      password: process.env.DB_PASS || 'Crawler@123',
      database: process.env.DB_NAME || 'crawler_db',
    };

    try {
      this.connection = await mysql.createConnection(appConfig);
      
      // 这里可以添加表创建的验证逻辑
      const [tables] = await this.connection.execute('SHOW TABLES');
      console.log('📊 Current tables:', tables);

    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  private async closeConnection() {
    if (this.connection) {
      await this.connection.end();
    }
  }
}

// 命令行接口
async function main() {
  const initializer = new DatabaseInitializer();
  
  try {
    await initializer.initialize();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { DatabaseInitializer };