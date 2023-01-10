import { MySQLConnectionStringParser } from '../../src/parsers/MySQLConnectionStringParser';

describe('MySQLConnectionStringParser', () => {
  describe('parseConnectionString', () => {
    it('should return a connection config object from a valid connection string', () => {
      const connectionString = 'mysql://user:password@host/database';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();
      const connectionConfig =
        mysqlConnectionStringParser.parseConnectionString(connectionString);

      expect(connectionConfig).toEqual({
        host: 'host',
        user: 'user',
        password: 'password',
        database: 'database',
      });
    });

    it('should return a connection config object from a valid connection string with query params', () => {
      const connectionString = 'mysql://user:password@host.com/database?test=true';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();
      const connectionConfig =
        mysqlConnectionStringParser.parseConnectionString(connectionString);

      expect(connectionConfig).toEqual({
        host: 'host.com',
        user: 'user',
        password: 'password',
        database: 'database',
        otherConfig: {
          test: 'true',
        },
      });
    });

    it('does not throw an error if the database is undefined', () => {
      const connectionString = 'mysql://user:password@host.com';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();
      const connectionConfig =
        mysqlConnectionStringParser.parseConnectionString(connectionString);

      expect(connectionConfig).toEqual({
        host: 'host.com',
        user: 'user',
        password: 'password',
        database: null,
      });
    });

    it('does not throw an error if the database is undefined with query params', () => {
      const connectionString =
        'mysql://user:password@host.com?test=true&test2=truer';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();
      const connectionConfig =
        mysqlConnectionStringParser.parseConnectionString(connectionString);

      expect(connectionConfig).toEqual({
        host: 'host.com',
        user: 'user',
        password: 'password',
        database: null,
        otherConfig: {
          test: 'true',
          test2: 'truer',
        },
      });
    });

    it('does not throw an error if the database is undefined with query params and trailing slash', () => {
      const connectionString =
        'mysql://user:password@host.com/?test=true&test2=truer';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();
      const connectionConfig =
        mysqlConnectionStringParser.parseConnectionString(connectionString);

      expect(connectionConfig).toEqual({
        host: 'host.com',
        user: 'user',
        password: 'password',
        database: null,
        otherConfig: {
          test: 'true',
          test2: 'truer',
        },
      });
    });

    it('should throw an error if the connection string is invalid', () => {
      const connectionString = 'invalid connection string';
      const mysqlConnectionStringParser = new MySQLConnectionStringParser();

      expect(() => {
        mysqlConnectionStringParser.parseConnectionString(connectionString);
      }).toThrow();
    });
  });
});
