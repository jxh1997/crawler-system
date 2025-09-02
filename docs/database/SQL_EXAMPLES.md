# 常用SQL查询示例

## 基础查询

### 1. 查询所有启用的爬虫配置
```sql
SELECT * FROM crawler_configs 
WHERE enabled = true 
ORDER BY name;
```

### 2. 查询最近7天的任务执行情况
```sql
SELECT 
    c.name as crawler_name,
    t.status,
    t.start_time,
    t.end_time,
    t.total_items,
    t.success_items,
    t.failed_items
FROM task_logs t
JOIN crawler_configs c ON t.crawler_id = c.id
WHERE t.start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY t.start_time DESC;
```

### 3. 查询某个地区的项目数据
```sql
SELECT 
    project_name,
    publisher,
    budget_amount,
    publish_time,
    source_url
FROM crawled_data
WHERE implementation_region LIKE '%北京%'
ORDER BY publish_time DESC
LIMIT 100;
```

## 统计查询

### 4. 各爬虫成功率统计
```sql
SELECT 
    c.name,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN t.status = 'success' THEN 1 ELSE 0 END) as success_tasks,
    ROUND(SUM(CASE WHEN t.status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM task_logs t
JOIN crawler_configs c ON t.crawler_id = c.id
GROUP BY c.id, c.name
ORDER BY success_rate DESC;
```

### 5. 项目类型分布统计
```sql
SELECT 
    project_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM crawled_data), 2) as percentage
FROM crawled_data
GROUP BY project_type
ORDER BY count DESC;
```

## 高级查询

### 6. 全文搜索项目
```sql
SELECT 
    project_name,
    publisher,
    publish_time,
    MATCH(project_name) AGAINST('污水处理' IN NATURAL LANGUAGE MODE) as relevance
FROM crawled_data
WHERE MATCH(project_name) AGAINST('污水处理' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 10;
```

### 7. 预算金额范围查询
```sql
SELECT 
    project_name,
    budget_amount,
    implementation_region,
    publish_time
FROM crawled_data
WHERE budget_amount BETWEEN 1000 AND 5000
ORDER BY budget_amount DESC;
```

### 8. 关键词搜索
```sql
SELECT 
    project_name,
    JSON_EXTRACT(keywords, '$') as keywords,
    publish_time
FROM crawled_data
WHERE JSON_CONTAINS(keywords, '"环保"')
ORDER BY publish_time DESC;
```

## 维护查询

### 9. 清理30天前的任务日志
```sql
DELETE FROM task_logs 
WHERE start_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 10. 禁用长时间失败的爬虫
```sql
UPDATE crawler_configs c
SET enabled = false
WHERE enabled = true
AND EXISTS (
    SELECT 1 FROM task_logs t
    WHERE t.crawler_id = c.id
    AND t.status = 'failed'
    AND t.start_time >= DATE_SUB(NOW(), INTERVAL 3 DAY)
    GROUP BY t.crawler_id
    HAVING COUNT(*) >= 5
);
```