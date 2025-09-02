import databaseService from '../src/services/database.service';
import { sequelize } from '../src/models';

describe('Database', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should connect to database', async () => {
    await expect(databaseService.authenticate()).resolves.not.toThrow();
  });
});