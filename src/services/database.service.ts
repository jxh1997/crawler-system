import { sequelize } from '../models';
import logger from '../utils/logger';

class DatabaseService {
  async authenticate() {
    try {
      await sequelize.authenticate();
      logger.info('数据库连接已成功建立.');
    } catch (error) {
      logger.error('无法连接到数据库:', error);
      throw error;
    }
  }

  async sync(force: boolean = false) {
    try {
      await sequelize.sync({ force });
      logger.info('数据库同步成功.');
    } catch (error) {
      logger.error('同步数据库时出错:', error);
      throw error;
    }
  }
}

export default new DatabaseService();