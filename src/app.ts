import databaseService from './services/database.service';
import logger from './utils/logger';

async function start() {
  try {
    // 初始化数据库连接
    await databaseService.authenticate();
    
    // 同步数据库模型
    await databaseService.sync(false);
    
    logger.info('系统启动成功...');
    
    // 这里将添加任务调度初始化
  } catch (error) {
    logger.error('启动系统失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('系统关闭...');
  process.exit(0);
});

start();