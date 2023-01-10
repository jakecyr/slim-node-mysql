import { OkPacket } from 'mysql2';
import { ConnectionConfig } from '../src/models/ConnectionConfig';
import { SlimNodeMySQLPool } from '../src/SlimNodeMySQLPool';

// @ts-ignore
import { poolQueryMock } from 'mysql2/promise';

describe('SlimNodeMySQLPool', () => {
  describe('constructor', () => {
    it('should create a MySQL pool using a connection string', () => {
      const connectionString = 'mysql://user:password@host/database';
      const slimNodeMySQLPool = new SlimNodeMySQLPool(connectionString);

      expect(slimNodeMySQLPool).toBeInstanceOf(SlimNodeMySQLPool);
    });

    it('should create a MySQL pool using connection config options', () => {
      const connectionConfig: ConnectionConfig = {
        host: 'host',
        user: 'user',
        password: 'password',
        database: 'database',
      };
      const slimNodeMySQLPool = new SlimNodeMySQLPool(connectionConfig);

      expect(slimNodeMySQLPool).toBeInstanceOf(SlimNodeMySQLPool);
    });
  });

  describe('query', () => {
    it('should execute a SELECT query and return the resulting rows', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});
      slimNodeMySQLPool.promiseQuery = jest.fn().mockResolvedValue([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ] as any);

      const rows = await slimNodeMySQLPool.query<{ id: number; name: string }>(
        'SELECT * FROM users'
      );

      expect(rows).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });

    it('should execute a SELECT query with parameters and return the resulting rows', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});
      slimNodeMySQLPool.queryPrepared = jest.fn().mockResolvedValue([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ] as any);

      const rows = await slimNodeMySQLPool.query<{ id: number; name: string }>(
        'SELECT * FROM users WHERE name = @name',
        { name: 'John' }
      );

      expect(rows).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });
  });

  describe('execute', () => {
    it('should execute a non-SELECT query with parameters and return the resulting OkPacket', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});

      (poolQueryMock as jest.Mock).mockReturnValueOnce([
        {
          affectedRows: 1,
          insertId: 1,
          fieldCount: 1,
          changedRows: 1,
          serverStatus: 1,
          warningCount: 1,
          message: 'done',
          procotol41: false,
        },
      ]);

      const result = await slimNodeMySQLPool.execute(
        'INSERT INTO users (name) VALUES (@name)',
        { name: 'John' }
      );

      expect(result).toEqual({
        affectedRows: 1,
        insertId: 1,
        fieldCount: 1,
        changedRows: 1,
        serverStatus: 1,
        warningCount: 1,
        message: 'done',
        procotol41: false,
      });
    });
  });

  describe('isOkPacket', () => {
    it('should return true if the value is an OkPacket', () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});

      expect(
        slimNodeMySQLPool.isOkPacket({ affectedRows: 1, insertId: 1 } as OkPacket)
      ).toBe(true);
    });

    it('should return false if the value is not an OkPacket', () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});

      expect(
        slimNodeMySQLPool.isOkPacket({ affectedRows: 1 } as OkPacket)
      ).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket([])).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket(true)).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket(false)).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket(1)).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket('test')).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket({})).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket(null)).toBeFalsy();
      expect(slimNodeMySQLPool.isOkPacket(undefined)).toBeFalsy();
    });
  });

  describe('executePrepared', () => {
    it('should execute a prepared non-SELECT query and return the resulting OkPacket', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});
      slimNodeMySQLPool.promiseQuery = jest.fn().mockResolvedValue({
        affectedRows: 1,
        insertId: 1,
      } as OkPacket);

      const result = await slimNodeMySQLPool.execute(
        'INSERT INTO users (name) VALUES (@name)',
        { name: 'John' }
      );

      expect(result).toEqual({
        affectedRows: 1,
        insertId: 1,
      });
    });

    it('should execute a prepared non-SELECT query and return the resulting non-OkPacket value', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});
      slimNodeMySQLPool.promiseQuery = jest.fn().mockResolvedValue([]);
      const result = await slimNodeMySQLPool.execute('INVALID SQL', {});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('close', () => {
    it('should close the MySQL pool', async () => {
      const slimNodeMySQLPool = new SlimNodeMySQLPool({});
      slimNodeMySQLPool.pool.end = jest.fn().mockResolvedValue();

      slimNodeMySQLPool.close();

      expect(slimNodeMySQLPool.pool.end).toHaveBeenCalled();
    });
  });
});
