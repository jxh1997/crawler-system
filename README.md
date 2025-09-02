# 企业级行业爬虫系统

基于 Node.js v23 + TypeScript + MySQL + Sequelize 构建的企业级分布式爬虫系统，支持多网站自动化信息抓取和结构化处理。

## 一、系统介绍

### 核心功能
- **多平台适配**：通过代码配置爬虫规则，支持不同平台的差异化抓取需求
- **数据结构化**：自动解析页面内容，将非结构化 HTML 转换为标准化数据存储到 MySQL
- **去重机制**：基于原文链接（`source_url`）自动去重，避免重复抓取
- **任务日志**：记录每次爬取的执行状态、成功/失败条数，便于问题排查
- **定时调度**：支持 Cron 表达式配置爬取频率
- **日志管理**：按级别（info/error）分类存储日志，便于后期分析



### 技术栈
| 类别         | 技术/工具                          | 说明                                  |
|--------------|-----------------------------------|---------------------------------------|
| 核心语言     | TypeScript 5.x + Node.js v23+      | 强类型保障，减少运行时错误            |
| 爬虫核心     | Puppeteer + Cheerio               | Puppeteer 处理动态页面，Cheerio 解析 HTML |
| 数据库 ORM   | Sequelize 6.x                     | 操作 MySQL 数据库，避免手写 SQL       |
| 任务调度     | node-schedule                     | 支持 Cron 表达式的定时任务            |
| 日志工具     | Winston                           | 控制台+文件双端日志，按大小切割       |
| 环境配置     | dotenv                            | 区分开发/生产环境配置，敏感信息隔离   |

### 系统架构

```
crawler-system/
├── docs/
│   └── database/
│       ├── DATABASE_DESIGN.md
│       ├── ER_DIAGRAM.md
│       ├── SQL_EXAMPLES.md
│       ├── CHANGELOG.md
│       └── README.md
├── scripts/
│   └── database/
│       ├── init.sql
│       ├── init-simple.sql
│       └── init.ts
└── src/
    ├── config/                # 配置文件
    ├── models/                # 数据模型
    ├── services/              # 核心服务
    ├── crawlers/              # 爬虫实现
    ├── schedulers/            # 任务调度
    ├── utils/                 # 工具函数
    ├── types/                 # TypeScript 类型定义
    ├── tests/                 # 单元测试
    └── app.ts                 # 应用入口
```

### 数据库设计

系统包含三个核心表：

1. **crawler_configs** - 爬虫配置表
2. **task_logs** - 任务日志表  
3. **crawled_data** - 爬取数据表

详细数据库设计请参考 [数据库设计文档](docs/database/DATABASE_DESIGN.md)

## 快速开始

### 环境要求

- Node.js v23+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接信息
```

3. **数据库初始化**
```bash
# 自动初始化
npm run db:init

# 或手动执行 SQL
mysql -u root -p < scripts/database/init.sql
```

4. **启动应用**
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 配置说明

### 环境变量 (.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crawler_db
DB_USER=crawler_user
DB_PASS=your_password

# 应用配置
NODE_ENV=development
LOG_LEVEL=info

# 高级配置
DEFAULT_REQUEST_INTERVAL=2000
MAX_CONCURRENT_CRAWLERS=3
```

### 爬虫规则配置

每个爬虫的规则配置使用 JSON 格式：

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
  }
}
```

## 开发指南

### 添加新爬虫

1. 在 `crawlers/` 目录创建新的爬虫类
2. 实现基础的爬虫接口
3. 在数据库中添加爬虫配置
4. 编写单元测试

### 示例爬虫结构

```typescript
class ExampleCrawler extends BaseCrawler {
  async crawl(): Promise<CrawledData[]> {
    // 实现具体的爬取逻辑
  }
}
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- src/tests/example.test.ts

# 监听模式运行测试
npm run test:watch
```

## 据字段

系统支持以下标准化字段：

| 字段名 | 描述 | 示例 |
|--------|------|------|
| project_name | 项目名称 | XX市污水处理厂扩建工程 |
| publish_time | 发布时间 | 2024-01-15 10:00:00 |
| publisher | 发布单位 | XX市环境保护局 |
| budget_amount | 预算金额 | 2500.00 (万元) |
| implementation_region | 实施地区 | XX省XX市 |
| project_type | 项目类型 | 招标/公示/立项/环评 |
| keywords | 关键词 | ["污水处理", "环保"] |
| summary | 正文摘要 | 项目描述摘要... |
| source_url | 原文链接 | https://example.com/project/123 |
| attachment_url | 附件地址 | https://example.com/attach/file.pdf |

## API 接口

系统提供以下 RESTful API：

- `GET /api/crawlers` - 获取爬虫列表
- `POST /api/crawlers` - 创建爬虫配置
- `GET /api/tasks` - 获取任务日志
- `GET /api/data` - 查询爬取数据
- `POST /api/trigger/:id` - 手动触发爬取

## 监控和维护

### 日志管理

日志按日期自动轮转，保存在 `logs/` 目录：
- `error-YYYY-MM-DD.log` - 错误日志
- `combined-YYYY-MM-DD.log` - 综合日志
- `audit-YYYY-MM-DD.log` - 审计日志

### 性能监控

```bash
# 查看任务执行情况
SELECT * FROM task_logs ORDER BY start_time DESC LIMIT 10;

# 监控系统性能
npm run monitor
```

## 📝 开发计划

### 近期功能
- [ ] 分布式爬虫支持
- [ ] Redis 缓存集成
- [ ] 更强大的规则引擎
- [ ] 可视化配置界面
- [ ] API 权限控制

### 长期规划
- [ ] 机器学习内容识别
- [ ] 自动规则生成
- [ ] 多语言支持
- [ ] 云原生部署

## 故障排除

常见问题及解决方案：

1. **数据库连接失败**
   - 检查 MySQL 服务状态
   - 验证 .env 配置是否正确

2. **依赖安装失败**
   - 使用 Node.js v23+
   - 清理 node_modules 重新安装

3. **爬取频率限制**
   - 调整 request_interval 参数
   - 配置代理池


## 👥 作者

- **jxh1997** - [github](https://github.com/jxh1997)


---

**注意**: 请遵守目标网站的 robots.txt 协议，合理控制爬取频率，避免对目标网站造成过大压力。
