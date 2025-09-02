
# 爬虫系统数据库设计文档

## 概述

本文档描述了企业级爬虫系统的数据库设计，包含表结构、字段含义、索引设计以及表之间的关系。

## 数据库版本
- MySQL 8.0+
- 字符集: utf8mb4
- 排序规则: utf8mb4_unicode_ci

## 表结构详情

### 1. crawler_configs - 爬虫配置表

存储各个网站的爬取规则和调度配置。

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| name | VARCHAR(255) | NOT NULL | - | 爬虫名称（如：政府招标网） |
| description | TEXT | NULL | NULL | 爬虫描述 |
| url | VARCHAR(500) | NOT NULL | - | 目标网站URL |
| type | ENUM('static', 'dynamic') | NOT NULL | - | 爬虫类型：静态页面/动态页面 |
| rules | JSON | NOT NULL | - | 爬取规则配置（JSON格式） |
| cron | VARCHAR(100) | NOT NULL | - | 定时任务Cron表达式 |
| max_page | INT | NOT NULL | 1 | 最大爬取页数 |
| request_interval | INT | NOT NULL | 1000 | 请求间隔（毫秒） |
| enabled | BOOLEAN | NOT NULL | true | 是否启用 |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引：**
- `idx_crawler_enabled` (enabled) - 快速查询启用的爬虫
- `idx_crawler_type` (type) - 按类型查询

**规则配置示例：**
```json
{
  "listSelector": ".project-list .item",
  "detailSelectors": {
    "title": "h1.title",
    "publishTime": ".publish-date",
    "publisher": ".publisher",
    "budget": ".budget-amount",
    "region": ".region",
    "content": ".content-body"
  },
  "pagination": {
    "enabled": true,
    "pattern": "?page={page}",
    "maxPages": 10
  },
  "dynamicWait": 5000
}
```

### 2. task_logs - 任务日志表

记录每次爬取任务的执行情况和统计信息。

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| crawler_id | INT UNSIGNED | FOREIGN KEY | - | 关联的爬虫配置ID |
| status | ENUM('success', 'failed', 'running') | NOT NULL | - | 任务状态 |
| start_time | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 开始时间 |
| end_time | TIMESTAMP | NULL | NULL | 结束时间 |
| total_items | INT | NOT NULL | 0 | 总处理项目数 |
| success_items | INT | NOT NULL | 0 | 成功项目数 |
| failed_items | INT | NOT NULL | 0 | 失败项目数 |
| error_message | TEXT | NULL | NULL | 错误信息 |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引：**
- `idx_task_crawler_id` (crawler_id) - 关联查询
- `idx_task_status` (status) - 状态查询
- `idx_task_start_time` (start_time) - 时间范围查询

**外键约束：**
- `crawler_id` REFERENCES `crawler_configs`(`id`) ON DELETE CASCADE

### 3. crawled_data - 爬取数据表

存储结构化后的爬取数据，支持全文搜索。

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| crawler_id | INT UNSIGNED | FOREIGN KEY | - | 来源爬虫ID |
| project_name | VARCHAR(255) | NOT NULL | - | 项目名称 |
| publish_time | TIMESTAMP | NOT NULL | - | 发布时间 |
| publisher | VARCHAR(255) | NOT NULL | - | 发布单位 |
| budget_amount | DECIMAL(15,2) | NULL | NULL | 预算金额（万元） |
| implementation_region | VARCHAR(255) | NOT NULL | - | 实施地区 |
| project_type | VARCHAR(100) | NOT NULL | - | 项目类型 |
| keywords | JSON | NOT NULL | JSON_ARRAY() | 关键词标签 |
| summary | TEXT | NOT NULL | - | 正文摘要 |
| source_url | VARCHAR(500) | NOT NULL, UNIQUE | - | 原文链接 |
| attachment_url | VARCHAR(500) | NULL | NULL | 附件下载地址 |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引：**
- `idx_data_crawler_id` (crawler_id) - 来源查询
- `idx_data_publish_time` (publish_time) - 时间范围查询
- `idx_data_project_type` (project_type) - 类型查询
- `idx_data_source_url` (source_url(255)) - 去重检查
- `idx_data_budget` (budget_amount) - 金额范围查询
- `idx_data_region` (implementation_region) - 地区查询
- `FULLTEXT idx_data_project_name` (project_name) - 全文搜索
- `FULLTEXT idx_data_summary` (summary) - 全文搜索

**外键约束：**
- `crawler_id` REFERENCES `crawler_configs`(`id`) ON DELETE CASCADE

## 表关系图

```
crawler_configs (1) ──────── (∞) task_logs
       │
       │ (1)
       │
       └────────────── (∞) crawled_data
```

## 字段详细说明

### crawler_configs 表字段说明

**rules 字段结构：**
```typescript
interface CrawlerRules {
  // 列表选择器
  listSelector: string;
  
  // 详情页选择器配置
  detailSelectors: {
    title: string;          // 标题选择器
    publishTime: string;    // 发布时间选择器
    publisher: string;      // 发布单位选择器
    budget: string;         // 预算金额选择器
    region: string;         // 地区选择器
    content: string;        // 内容选择器
  };
  
  // 分页配置
  pagination?: {
    enabled: boolean;       // 是否启用分页
    pattern: string;        // 分页URL模式
    maxPages: number;       // 最大页数
  };
  
  // 动态页面等待时间（毫秒）
  dynamicWait?: number;
}
```

### crawled_data 表字段说明

**project_type 可选值：**
- `招标` - 招标公告
- `公示` - 公示信息
- `立项` - 项目立项
- `环评` - 环境影响评价
- `中标` - 中标公告
- `采购` - 采购公告
- `其他` - 其他类型

**keywords 字段格式：**
```json
["环保", "污水处理", "基础设施建设"]
```

**budget_amount 单位：** 万元

## 数据示例

### crawler_configs 示例数据
```sql
INSERT INTO crawler_configs 
(name, description, url, type, rules, cron, max_page, request_interval, enabled)
VALUES
(
  '中国政府采购网',
  '中央政府采购信息采集',
  'https://www.ccgp.gov.cn/cggg/',
  'static',
  '{
    "listSelector": ".list-box ul li",
    "detailSelectors": {
      "title": "h1.article-title",
      "publishTime": ".article-time",
      "publisher": ".article-source",
      "budget": ".budget-info",
      "region": ".region-info",
      "content": ".article-content"
    },
    "pagination": {
      "enabled": true,
      "pattern": "index_{page}.html",
      "maxPages": 20
    }
  }',
  '0 0 8,20 * * *',
  20,
  1500,
  true
);
```

### crawled_data 示例数据
```sql
INSERT INTO crawled_data 
(crawler_id, project_name, publish_time, publisher, budget_amount, 
 implementation_region, project_type, keywords, summary, source_url)
VALUES
(
  1,
  'XX市污水处理厂扩建工程项目',
  '2024-01-15 10:00:00',
  'XX市环境保护局',
  2500.00,
  'XX省XX市',
  '招标',
  '["污水处理", "环保", "基础设施建设"]',
  '本项目为XX市污水处理厂扩建工程，包括新建处理设施和改造现有系统...',
  'https://www.example.com/project/12345'
);
```


## 维护脚本

项目包含数据库初始化脚本：
- `scripts/database/init.sql` - 完整的数据库初始化
- `scripts/database/init-simple.sql` - 简化版初始化

## 版本历史

- v1.0 (2024-01-15): 初始版本
- 支持多爬虫配置、任务监控、数据去重