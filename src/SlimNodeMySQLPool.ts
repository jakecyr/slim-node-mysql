import { createPool, Pool, PoolOptions } from 'mysql2/promise';
import { QueryResult } from './models';
import { PreparedStatement } from './PreparedStatement';

export class SlimNodeMySQLPool {
  private pool: Pool;

  constructor(config: PoolOptions | string, connectionLimit?: number) {
    if (typeof config === 'string') {
      this.parseConnectionString(config, connectionLimit);
    } else {
      this.pool = createPool(config);
    }
  }

  parseConnectionString(connectionString: string, connectionLimit?: number) {
    let host: string;
    let user: string;
    let password: string;
    let database: string;

    if (typeof connectionString === 'string') {
      try {
        const parts = connectionString.replace('mysql://', '').split('@');
        [user, password] = parts[0].split(':');
        [host, database] = parts[1].split('/');

        database = database.slice(0, database.indexOf('?'));
      } catch (error) {
        throw new Error('Invalid connection string: ' + error);
      }
    } else {
      ({ host, user, password, database } = connectionString);
    }

    this.pool = createPool({
      connectionLimit,
      waitForConnections: true,
      host,
      user,
      password,
      database,
    });
  }

  query<ReturnType>(sql: string, parameters?: Record<string, unknown>): Promise<QueryResult<ReturnType[]>> {
    if (parameters) {
      const preparedStatement = new PreparedStatement(sql, parameters);
      const { preparedSql, preparedValues } = preparedStatement.prepare();
      return this.promiseQuery<ReturnType[]>(preparedSql, preparedValues);
    }

    return this.promiseQuery<ReturnType[]>(sql);
  }

  private async promiseQuery<ReturnType>(sql: string, preparedValues?: string[]): Promise<QueryResult<ReturnType>> {
    const [data, fields] = await this.pool.query<any>(sql, preparedValues);
    const queryResult: QueryResult<ReturnType> = data;

    if (Array.isArray(data)) {
      queryResult._fields = fields;
    }

    return queryResult;
  }

  close() {
    this.pool?.end();
  }
}
