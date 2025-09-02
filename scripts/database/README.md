# 数据库初始化指南

## 快速开始

### 自动初始化（推荐）
1. 确保 MySQL 服务正在运行
2. 安装依赖
    ```bash
   npm install
    ```
3. 复制环境配置文件：
   ```bash
   cp .env.example .env
   ```
4. 编辑 `.env` 文件，设置您的数据库密码
5. 运行初始化脚本：
   ```bash
   npm run db:init
   ```

### 手动初始化
手动执行 SQL 脚本：

```bash
# 使用 root 用户登录 MySQL
mysql -u root -p

# 在 MySQL 中执行初始化脚本
source scripts/database/init.sql
```

### 环境变量说明
- `DB_ROOT_USER`: MySQL root 用户（用于创建数据库和用户）

- `DB_ROOT_PASSWORD`: MySQL root 密码

- `DB_USER`: 应用数据库用户

- `DB_PASS`: 应用数据库密码

- `DB_NAME`: 数据库名称


### 表结构说明
- crawler_configs - 爬虫配置表
存储各个网站的爬取规则和配置信息

- task_logs - 任务日志表
记录每次爬取任务的执行情况和统计信息

- crawled_data - 爬取数据表
存储结构化后的爬取数据