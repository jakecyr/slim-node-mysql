import { ConnectionStringParseError } from '../../src/errors/ConnectionStringParseError';
import { ConnectionStringParserStrategy } from '../../src/parsers/ConnectionStringParserStrategy';
import { ConnectionStringParser } from '../../src/interfaces/ConnectionStringParser';
import { MySQLConnectionStringParser } from '../../src/parsers/MySQLConnectionStringParser';

describe('ConnectionStringParserFactory', () => {
  describe('getParser', () => {
    it('returns the MySQL parser if the string starts with mysql', () => {
      const connectionString = 'mysql://user:password@host/database';
      const parser: ConnectionStringParser =
        ConnectionStringParserStrategy.getParserStrategy(connectionString);
      expect(parser).toBeInstanceOf(MySQLConnectionStringParser);
    });

    it('throws an error for an unsupported connection string', () => {
      const connectionString = 'oracle://user:password@host/database';
      expect(() =>
        ConnectionStringParserStrategy.getParserStrategy(connectionString)
      ).toThrowError(ConnectionStringParseError);
    });
  });
});
