jest.mock('mysql2/promise');

import { SlimNodeMySQL } from '../src/index';

// @ts-ignore
import { createPool, poolQueryMock } from 'mysql2/promise';

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
      await db.query('select * from table where id = @id and name = @name', { id: 1, name: 'Jon', notUsedKey: true });
      const mockCallArguments = poolQueryMock.mock.calls[0];

      expect(mockCallArguments[0]).toStrictEqual('select * from table where id = ? and name = ?');
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
      const db = new SlimNodeMySQL(mockConnectionString);
      const data = await db.execute('select * from table');
      expect(Array.isArray(data)).toBeTruthy();
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
      const name = await db.getValue<{ name: string }, 'name'>('name', 'select * from table');
      expect(typeof name).toBe('string');
    });
  });
});
