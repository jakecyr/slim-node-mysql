jest.mock('mysql2/promise');

import { SlimNodeMySQL } from '../src/index';

// @ts-ignore
import { createPool, poolQueryMock } from 'mysql2/promise';
import { PoolAlreadyExistsError } from '../src/errors/PoolAlreadyExistsError';

const mockConnectionString = 'mysql://root:root@localhost:3306/test';

describe('SlimNodeMySQL', () => {
  describe('constructor', () => {
    it('pool is initialized', () => {
      new SlimNodeMySQL(mockConnectionString);
      expect(createPool).toHaveBeenCalledTimes(1);

      // @ts-ignore
      createPool.mockClear();
    });

    it('pool is initialized', () => {
      new SlimNodeMySQL({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test',
      });

      expect(createPool).toHaveBeenCalledTimes(1);
      // @ts-ignore
      createPool.mockClear();
    });

    it('throws an error if invalid connection string', () => {
      expect(() => new SlimNodeMySQL('')).toThrowError();
    });
  });

  describe('hasOpenPool', () => {
    it('returns true if pool is open', () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      expect(db.hasOpenPool()).toBeTruthy();
    });

    it('returns false if pool is closed', async () => {
      jest.clearAllMocks();
      const db = new SlimNodeMySQL(mockConnectionString);
      await db.close();
      expect(db.hasOpenPool()).toBeFalsy();
    });
  });

  describe('query', () => {
    it('returns results', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.query('select * from table');
      expect(Array.isArray(data)).toBeTruthy();
    });

    it('returns results when passing in params', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.query('select * from table where id = @id', { id: 1 });
      expect(Array.isArray(data)).toBeTruthy();
    });

    it('passes correct SQL and prepared values to pool.query method', async () => {
      jest.clearAllMocks();

      const db = new SlimNodeMySQL(mockConnectionString);
      await db.query('select * from table where id = @id and name = @name', {
        id: 1,
        name: 'Jon',
        notUsedKey: true,
      });
      const mockCallArguments = poolQueryMock.mock.calls[0];

      expect(mockCallArguments[0]).toStrictEqual(
        'select * from table where id = ? and name = ?'
      );
      expect(mockCallArguments[1]).toStrictEqual([1, 'Jon']);
    });

    it('throws an error if no value provided for statement', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      let error = null;

      try {
        await db.query('select * from table where id = @id', {});
      } catch (err) {
        error = err;
      }

      expect(error).not.toBeNull();
    });
  });

  describe('execute', () => {
    it('returns results', async () => {
      (poolQueryMock as jest.Mock).mockReturnValueOnce({
        affectedRows: 1,
        insertId: 1,
        fieldCount: 1,
        changedRows: 1,
        serverStatus: 1,
        warningCount: 1,
        message: 'done',
        procotol41: false,
      });

      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.execute('update time_table set time = "10:30am"');
      expect(Array.isArray(data)).toBeFalsy();
    });

    it('returns results when passing in parameters', async () => {
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
        null,
      ]);

      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.execute('update user set name = @name where id = @id', {
        id: 1,
        name: 'Jon',
      });
      expect(Array.isArray(data)).toBeFalsy();
      expect(data.affectedRows).toBe(1);
    });
  });

  describe('getOne', () => {
    it('returns a single object', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.getOne('select * from table');
      expect(Array.isArray(data)).toBeFalsy();
      expect(typeof data).toBe('object');
    });

    it('returns fields', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.getOne('select * from table');
      expect(Array.isArray(data)).toBeFalsy();
    });

    it('returns null if no fields are returned for query', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      (poolQueryMock as jest.Mock).mockReturnValueOnce([[], null]);
      const data = await db.getOne('select * from table');
      expect(data).toBeNull();
    });
  });

  describe('exists', () => {
    it('returns a boolean', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const exists = await db.exists('select * from table');
      expect(exists).toBeTruthy();
    });
  });

  describe('getValue', () => {
    it('returns a string for a name', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const name = await db.getValue<{ name: string }, 'name'>(
        'name',
        'select * from table'
      );
      expect(typeof name).toBe('string');
    });

    it('returns null if no data is returned', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const ogQuery = db.query;
      db.query = jest.fn().mockResolvedValue([]);
      const name = await db.getValue<{ name: string }, 'name'>(
        'name',
        'select * from table'
      );
      expect(name).toBeNull();
      db.query = ogQuery;
    });
  });

  describe('close', () => {
    it('calls end on the pool', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      const closeFn = jest.fn();
      db.pool = { close: closeFn };
      await db.close();
      expect(closeFn).toHaveBeenCalledTimes(1);
      expect(db.pool).toBeNull();
    });
  });

  describe('connect', () => {
    it('creates a new pool', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      await db.close();
      expect(db.pool).toBeNull();

      db.connect();

      expect(db.pool).not.toBeNull();
    });

    it('throws an error if there is already an active pool', async () => {
      const db = new SlimNodeMySQL(mockConnectionString);
      expect(db.pool).toBeDefined();

      expect(() => db.connect()).toThrowError(PoolAlreadyExistsError);
    });
  });
});
