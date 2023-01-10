import { createPool, Pool, PoolOptions, ResultSetHeader } from 'mysql2/promise';
import { resultSetHeaderToExecuteResult } from './converters/resultSetHeaderToExecuteResult';
import { InvalidExecuteStatementError } from './errors/InvalidExecuteStatement';
import { DatabasePool } from './interfaces/Pool';
import { ConnectionConfig } from './models/ConnectionConfig';
import { ExecuteResult } from './models/ExecuteResult';
import { PreparedStatementParameters } from './models/PreparedStatementParameters';
import { MySQLPreparedStatement } from './MySQLPreparedStatement';
import { ConnectionStringParserStrategy } from './parsers/ConnectionStringParserStrategy';

export class SlimNodeMySQLPool implements DatabasePool {
  private pool: Pool;

  constructor(config: string | PoolOptions, otherPoolOptions?: PoolOptions) {
    if (typeof config === 'string') {
      const connection: ConnectionConfig =
        ConnectionStringParserStrategy.getParserStrategy(
          config
        ).parseConnectionString(config);

      this.pool = createPool({
        ...otherPoolOptions,
        host: connection.host,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });
    } else {
      this.pool = createPool(config);
    }
  }

  query<ReturnType>(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<ReturnType[]> {
    if (parameters) {
      return this.queryPrepared<ReturnType>(sql, parameters);
    }

    return this.promiseQuery<ReturnType[]>(sql);
  }

  async execute(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<ExecuteResult> {
    let preparedSQL: string = sql;
    let preparedValues: any[];

    if (parameters) {
      const preparedStatement = new MySQLPreparedStatement(sql, parameters);
      ({ preparedSQL, preparedValues } = preparedStatement.prepare());
    }

    const [header] = await this.pool.query<ResultSetHeader>(
      preparedSQL,
      preparedValues
    );

    if (this.isResultSetHeader(header)) {
      return resultSetHeaderToExecuteResult(header);
    } else {
      throw new InvalidExecuteStatementError(
        'Unexpected non-ExecuteResult returned from execute method. Make sure to use query for SELECT statements.'
      );
    }
  }

  async close(): Promise<void> {
    await this.pool?.end();
  }

  private async queryPrepared<ReturnType>(
    sql: string,
    parameters: PreparedStatementParameters
  ): Promise<ReturnType[]> {
    const preparedStatement = new MySQLPreparedStatement(sql, parameters);
    const { preparedSQL, preparedValues } = preparedStatement.prepare();
    return this.promiseQuery<ReturnType[]>(preparedSQL, preparedValues);
  }

  private async promiseQuery<ReturnType>(
    sql: string,
    preparedValues?: string[]
  ): Promise<ReturnType> {
    const [data] = await this.pool.query<any>(sql, preparedValues);
    return data;
  }

  private isResultSetHeader(data: any): data is ResultSetHeader {
    return (
      data && data.hasOwnProperty('affectedRows') && data.hasOwnProperty('insertId')
    );
  }
}
