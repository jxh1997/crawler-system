import winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

// 确保日志根目录存在
const logRootDir = 'logs';
if (!fs.existsSync(logRootDir)) {
  fs.mkdirSync(logRootDir, { recursive: true });
}

// 自定义日志格式
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    if (info instanceof Error) {
      return { ...info, message: info.message, stack: info.stack };
    }
    return info;
  })(),
  winston.format.json()
);

// 控制台输出格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      metaString = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'crawler-system' },
  transports: [
    // 错误日志（放到 errors 子目录）
    new winston.transports.DailyRotateFile({
      filename: path.join(logRootDir, 'errors', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
    }),
    // 综合日志（放到 combined 子目录）
    new winston.transports.DailyRotateFile({
      filename: path.join(logRootDir, 'combined', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
    }),
    // 审计日志（放到 audits 子目录）
    new winston.transports.DailyRotateFile({
      filename: path.join(logRootDir, 'audits', 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '90d',
      maxSize: '50m',
      zippedArchive: true,
    }),
    // 未捕获异常日志（放到 exceptions 子目录）
    new winston.transports.DailyRotateFile({
      filename: path.join(logRootDir, 'exceptions', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    // 未处理 Promise 拒绝日志（放到 rejections 子目录）
    new winston.transports.DailyRotateFile({
      filename: path.join(logRootDir, 'rejections', 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    })
  ],
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// 处理未捕获的异常
logger.exceptions.handle(
  new winston.transports.DailyRotateFile({
    filename: path.join(logRootDir, 'exceptions', 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
  })
);

// 处理未处理的 Promise 拒绝
logger.rejections.handle(
  new winston.transports.DailyRotateFile({
    filename: path.join(logRootDir, 'rejections', 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
  })
);

// 扩展 logger 的方法类型定义
declare module 'winston' {
  interface Logger {
    audit: (message: string, meta?: any) => Logger;
  }
}

// 添加自定义audit方法，保持与Winston其他方法一致的返回类型
logger.audit = function(message: string, meta?: any): winston.Logger {
  return this.info(message, { ...meta, audit: true });
};

export default logger;