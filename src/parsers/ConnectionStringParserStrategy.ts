import { ConnectionStringParseError } from '../errors/ConnectionStringParseError';
import { ConnectionStringParser } from '../interfaces/ConnectionStringParser';
import { MySQLConnectionStringParser } from './MySQLConnectionStringParser';

export class ConnectionStringParserStrategy {
  public static getParserStrategy(connectionString: string): ConnectionStringParser {
    if (connectionString.startsWith('mysql://')) {
      return new MySQLConnectionStringParser();
    } else {
      throw new ConnectionStringParseError('No parser for connection string type');
    }
  }
}
