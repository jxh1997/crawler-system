-- 企业级爬虫系统数据库初始化脚本
-- 版本: v1.0.0
-- 创建日期: 2025-09-01
-- 描述: 初始化爬虫系统所需的数据库表结构、索引和示例数据
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci

-- 详细设计文档请参考: docs/database/DATABASE_DESIGN.md

-- 创建数据库
CREATE DATABASE IF NOT EXISTS crawler_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用新创建的数据库
USE crawler_db;

-- 创建专用用户（如果不存在）
CREATE USER IF NOT EXISTS 'crawler_user'@'%' IDENTIFIED BY 'Crawler@123';
CREATE USER IF NOT EXISTS 'crawler_user'@'localhost' IDENTIFIED BY 'Crawler@123';

-- 授予权限
GRANT ALL PRIVILEGES ON crawler_db.* TO 'crawler_user'@'%';
GRANT ALL PRIVILEGES ON crawler_db.* TO 'crawler_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 创建 crawler_configs 表
CREATE TABLE IF NOT EXISTS crawler_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    url VARCHAR(500) NOT NULL,
    type ENUM('static', 'dynamic') NOT NULL,
    rules JSON NOT NULL,
    cron VARCHAR(100) NOT NULL,
    max_page INT NOT NULL DEFAULT 1,
    request_interval INT NOT NULL DEFAULT 1000,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crawler_enabled (enabled),
    INDEX idx_crawler_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 task_logs 表
CREATE TABLE IF NOT EXISTS task_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crawler_id INT UNSIGNED NOT NULL,
    status ENUM('success', 'failed', 'running') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    total_items INT NOT NULL DEFAULT 0,
    success_items INT NOT NULL DEFAULT 0,
    failed_items INT NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_crawler_id (crawler_id),
    INDEX idx_task_status (status),
    INDEX idx_task_start_time (start_time),
    FOREIGN KEY (crawler_id) REFERENCES crawler_configs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 crawled_data 表
CREATE TABLE IF NOT EXISTS crawled_data (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crawler_id INT UNSIGNED NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    publish_time TIMESTAMP NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    budget_amount DECIMAL(15, 2) NULL,
    implementation_region VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    keywords JSON NOT NULL DEFAULT (JSON_ARRAY()),
    summary TEXT NOT NULL,
    source_url VARCHAR(500) NOT NULL UNIQUE,
    attachment_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_crawler_id (crawler_id),
    INDEX idx_data_publish_time (publish_time),
    INDEX idx_data_project_type (project_type),
    INDEX idx_data_source_url (source_url(255)),
    FULLTEXT INDEX idx_data_project_name (project_name),
    FULLTEXT INDEX idx_data_summary (summary),
    FOREIGN KEY (crawler_id) REFERENCES crawler_configs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例配置数据
INSERT INTO crawler_configs 
(name, description, url, type, rules, cron, max_page, request_interval, enabled)
VALUES
(
    '政府招标网站示例',
    '政府招标信息采集示例配置',
    'https://www.example.gov.cn/zbcg/',
    'static',
    '{
        "listSelector": ".zb-list li",
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
        }
    }',
    '0 0 8,20 * * *',
    10,
    2000,
    true
),
(
    '环保项目公示示例',
    '环保类项目公示信息采集',
    'https://epb.example.com/gsgg/',
    'dynamic',
    '{
        "listSelector": ".project-list .item",
        "detailSelectors": {
            "title": ".project-title",
            "publishTime": ".publish-time",
            "publisher": ".publish-department",
            "budget": ".project-budget",
            "region": ".project-location",
            "content": ".project-content"
        },
        "dynamicWait": 5000
    }',
    '0 30 9 * * *',
    5,
    3000,
    true
);

-- 创建索引以提高查询性能
CREATE INDEX idx_crawled_data_keywords ON crawled_data((CAST(keywords AS CHAR(255))));
CREATE INDEX idx_crawled_data_budget ON crawled_data(budget_amount);
CREATE INDEX idx_crawled_data_region ON crawled_data(implementation_region);

-- 显示创建的表结构
SHOW TABLES;

-- 显示各表的详细信息
DESCRIBE crawler_configs;
DESCRIBE task_logs;
DESCRIBE crawled_data;