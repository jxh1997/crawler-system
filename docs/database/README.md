# 数据库文档索引

## 概述
本目录包含爬虫系统的数据库设计文档和相关信息。

## 文档列表

1. **[DATABASE_DESIGN.md](DATABASE_DESIGN.md)** - 详细的数据库设计说明
2. **[ER_DIAGRAM.md](ER_DIAGRAM.md)** - 实体关系图和关系说明  
3. **[SQL_EXAMPLES.md](SQL_EXAMPLES.md)** - 常用SQL查询示例
4. **[CHANGELOG.md](CHANGELOG.md)** - 数据库变更历史

## 快速开始

### 数据库初始化
```bash
# 使用初始化脚本
npm run db:init

# 或手动执行SQL
mysql -u root -p < scripts/database/init.sql
```

### 表结构说明
系统包含三个主要表：
- `crawler_configs` - 爬虫配置管理
- `task_logs` - 任务执行监控
- `crawled_data` - 爬取数据存储

### 重要约束
- 数据去重：`crawled_data.source_url` 唯一约束
- 外键关联：任务和数据关联到爬虫配置
- 字符集：全面支持中文和特殊字符

## 维护指南
- 定期检查索引性能
- 监控表空间使用情况
- 根据业务需求调整分区策略