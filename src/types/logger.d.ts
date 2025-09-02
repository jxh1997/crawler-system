import logger from '../utils/logger';

// 声明全局可用的logger变量
declare global {
  const logger: typeof logger;
}

// 确保文件被视为模块
export {};
