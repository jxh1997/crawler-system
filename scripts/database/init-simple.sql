-- 简化版数据库初始化脚本
CREATE DATABASE IF NOT EXISTS crawler_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE crawler_db;

-- 创建用户（如果使用root可跳过）
CREATE USER IF NOT EXISTS 'crawler_user'@'localhost' IDENTIFIED BY 'Crawler@123';
GRANT ALL PRIVILEGES ON crawler_db.* TO 'crawler_user'@'localhost';
FLUSH PRIVILEGES;