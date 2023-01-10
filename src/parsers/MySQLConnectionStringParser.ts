import { ConnectionConfig } from '../models/ConnectionConfig';
import { ConnectionStringParser } from '../interfaces/ConnectionStringParser';
import { ConnectionStringParseError } from '../errors/ConnectionStringParseError';

export class MySQLConnectionStringParser implements ConnectionStringParser {
  parseConnectionString(connectionString: string): ConnectionConfig {
    let host: string;
    let user: string;
    let password: string;
    let database: string;
    let otherConfig: Record<string, any>;

    try {
      const parts = connectionString.replace('mysql://', '').split('@');

      if (parts.length !== 2) {
        throw new Error(`Invalid connection string. Multiple @ symbols found.`);
      }

      [user, password] = parts[0].split(':');
      [host, database] = parts[1].split('/');

      if (database && database.includes('?')) {
        const [databaseWithoutQuery, query] = database.split('?');
        database = databaseWithoutQuery;
        otherConfig = this.getParserQueryString(query);

        if (database == '') {
          database = null;
        }
      } else if (host.includes('?')) {
        const [hostWithoutQuery, query] = host.split('?');
        host = hostWithoutQuery;
        otherConfig = this.getParserQueryString(query);
      }
    } catch (error) {
      throw new ConnectionStringParseError('Invalid connection string: ' + error);
    }

    return {
      host,
      user,
      password,
      database: database || null,
      otherConfig,
    };
  }

  private getParserQueryString(queryString: string): Record<string, any> {
    return queryString.split('&').reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[key] = value;
      return acc;
    }, {});
  }
}
