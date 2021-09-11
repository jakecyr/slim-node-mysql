jest.mock('mysql');

import { SlimNodeMySQL } from '../src/index';

// @ts-ignore
import { createPool, poolQueryMock } from 'mysql';

describe('SlimNodeMySQL', () => {
  describe('constructor', () => {
    it('pool is initialized', () => {
      new SlimNodeMySQL('');
      expect(createPool).toHaveBeenCalledTimes(1);
    });
  });

  describe('query', () => {
    it('returns results', async () => {
      const db = new SlimNodeMySQL('');
      const results = await db.query('select * from table');
      expect(Array.isArray(results)).toBeTruthy();
    });

    it('returns results when passing in params', async () => {
      const db = new SlimNodeMySQL('');
      const results = await db.query('select * from table where id = @id', { id: 1 });
      expect(Array.isArray(results)).toBeTruthy();
    });

    it('passes correct SQL and prepared values to pool.query method', async () => {
      jest.clearAllMocks();

      const db = new SlimNodeMySQL('');
      await db.query('select * from table where id = @id and name = @name', { id: 1, name: 'Jon', notUsedKey: true });
      const mockCallArguments = poolQueryMock.mock.calls[0];

      expect(mockCallArguments[0]).toStrictEqual('select * from table where id = ? and name = ?');
      expect(mockCallArguments[1]).toStrictEqual([1, 'Jon']);
    });

    it('throws an error if no value provided for statement', async () => {
      const db = new SlimNodeMySQL('');
      let error = null;

      try {
        await db.query('select * from table where id = @id', {});
      } catch (err) {
        error = err;
      }

      expect(error).not.toBeNull();
    });
  });
});
