import { createPool, Pool, PoolConfig, MysqlError } from 'mysql';
import { PreparedStatement } from './PreparedStatement';

export class SlimNodeMySQLPool {
  private pool: Pool;

  constructor(config: string | PoolConfig) {
    this.pool = createPool(config);
  }

  query<ReturnType>(sql: string, parameters?: Record<string, unknown>): Promise<ReturnType> {
    if (parameters) {
      const preparedStatement = new PreparedStatement(sql, parameters);
      const { preparedSql, preparedValues } = preparedStatement.prepare();
      return this.promiseQuery(preparedSql, preparedValues);
    }

    return this.promiseQuery(sql);
  }

  close() {
    this.pool?.end();
  }

  private promiseQuery<ReturnType>(sql: string, preparedValues?: string[]): Promise<ReturnType> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, preparedValues, (error: MysqlError, results: ReturnType) => {
        if (error) {
          return reject(error);
        }

        return resolve(results);
      });
    });
  }
}
