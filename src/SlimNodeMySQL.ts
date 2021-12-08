import { PoolOptions } from 'mysql2';
import { QueryResult } from './models';
import { SlimNodeMySQLPool } from './SlimNodeMySQLPool';

export type PreparedStatementParameters = Record<string, unknown>;

export class SlimNodeMySQL {
  protected pool: SlimNodeMySQLPool;

  constructor(config: string | PoolOptions, connectionLimit?: number) {
    this.pool = new SlimNodeMySQLPool(config, connectionLimit);
  }

  query<TableModel>(sql: string, parameters?: PreparedStatementParameters): Promise<QueryResult<TableModel[]>> {
    if (parameters) {
      return this.pool.query<TableModel>(sql, parameters);
    }

    return this.pool.query<TableModel>(sql);
  }

  async getOne<TableModel>(sql: string, parameters?: PreparedStatementParameters): Promise<QueryResult<TableModel>> {
    const data: QueryResult<TableModel[]> = await this.query<TableModel>(sql, parameters);

    if (data.length === 0) {
      return null;
    }

    return {
      ...data[0],
      _fields: data._fields,
    };
  }

  async getValue<TableModel, K extends keyof TableModel>(
    column: K,
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<TableModel[K] | null> {
    const data = await this.getOne<TableModel>(sql, parameters);

    if (!data) {
      return null;
    }

    return data[column];
  }

  async exists<TableModel>(sql: string, parameters?: PreparedStatementParameters): Promise<boolean> {
    return (await this.getOne<TableModel>(sql, parameters)) !== null;
  }

  close(): void {
    this.pool?.close();
    this.pool = null;
  }
}
