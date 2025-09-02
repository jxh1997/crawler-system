import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 爬虫配置接口
interface CrawlerConfigAttributes {
  id: number;
  name: string;
  description: string | null;
  url: string;
  type: 'static' | 'dynamic';
  rules: any; // JSON类型，存储爬取规则
  cron: string;
  max_page: number;
  request_interval: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CrawlerConfigCreationAttributes extends Optional<CrawlerConfigAttributes, 'id' | 'description'> {}

class CrawlerConfig extends Model<CrawlerConfigAttributes, CrawlerConfigCreationAttributes> implements CrawlerConfigAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public url!: string;
  public type!: 'static' | 'dynamic';
  public rules!: any;
  public cron!: string;
  public max_page!: number;
  public request_interval!: number;
  public enabled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CrawlerConfig.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('static', 'dynamic'),
      allowNull: false,
    },
    rules: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    cron: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    max_page: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    request_interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000, // 默认1秒
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'crawler_configs',
    sequelize,
  }
);

// 任务日志模型
interface TaskLogAttributes {
  id: number;
  crawler_id: number;
  status: 'success' | 'failed' | 'running';
  start_time: Date;
  end_time: Date | null;
  total_items: number;
  success_items: number;
  failed_items: number;
  error_message: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class TaskLog extends Model<TaskLogAttributes> implements TaskLogAttributes {
  public id!: number;
  public crawler_id!: number;
  public status!: 'success' | 'failed' | 'running';
  public start_time!: Date;
  public end_time!: Date | null;
  public total_items!: number;
  public success_items!: number;
  public failed_items!: number;
  public error_message!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TaskLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    crawler_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'running'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    success_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    failed_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'task_logs',
    sequelize,
  }
);

// 爬取数据模型
interface CrawledDataAttributes {
  id: number;
  crawler_id: number;
  project_name: string;
  publish_time: Date;
  publisher: string;
  budget_amount: number | null;
  implementation_region: string;
  project_type: string;
  keywords: string[];
  summary: string;
  source_url: string;
  attachment_url: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class CrawledData extends Model<CrawledDataAttributes> implements CrawledDataAttributes {
  public id!: number;
  public crawler_id!: number;
  public project_name!: string;
  public publish_time!: Date;
  public publisher!: string;
  public budget_amount!: number | null;
  public implementation_region!: string;
  public project_type!: string;
  public keywords!: string[];
  public summary!: string;
  public source_url!: string;
  public attachment_url!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CrawledData.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    crawler_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    project_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    publish_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    publisher: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    budget_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    implementation_region: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    project_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'crawled_data',
    sequelize,
  }
);

// 建立关联
CrawlerConfig.hasMany(TaskLog, { foreignKey: 'crawler_id' });
TaskLog.belongsTo(CrawlerConfig, { foreignKey: 'crawler_id' });

CrawlerConfig.hasMany(CrawledData, { foreignKey: 'crawler_id' });
CrawledData.belongsTo(CrawlerConfig, { foreignKey: 'crawler_id' });

export { CrawlerConfig, TaskLog, CrawledData, sequelize };