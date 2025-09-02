# 数据库ER图

## 实体关系图

```mermaid
erDiagram
    CRAWLER_CONFIGS {
        int id PK
        string name
        string description
        string url
        enum type
        json rules
        string cron
        int max_page
        int request_interval
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }
    
    TASK_LOGS {
        int id PK
        int crawler_id FK
        enum status
        timestamp start_time
        timestamp end_time
        int total_items
        int success_items
        int failed_items
        text error_message
        timestamp created_at
        timestamp updated_at
    }
    
    CRAWLED_DATA {
        int id PK
        int crawler_id FK
        string project_name
        timestamp publish_time
        string publisher
        decimal budget_amount
        string implementation_region
        string project_type
        json keywords
        text summary
        string source_url UK
        string attachment_url
        timestamp created_at
        timestamp updated_at
    }
    
    CRAWLER_CONFIGS ||--o{ TASK_LOGS : "has"
    CRAWLER_CONFIGS ||--o{ CRAWLED_DATA : "produces"
```

## 关系说明

1. **一对多关系**: 
   - 一个爬虫配置可以有多条任务日志记录
   - 一个爬虫配置可以爬取多条数据记录

2. **外键约束**:
   - `task_logs.crawler_id` → `crawler_configs.id`
   - `crawled_data.crawler_id` → `crawler_configs.id`

3. **唯一约束**:
   - `crawled_data.source_url` 确保数据去重