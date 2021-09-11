import { PoolConfig, OkPacket } from 'mysql';
import { SlimNodeMySQLPool } from './SlimNodeMySQLPool';

export type PreparedStatementParameters = Record<string, unknown>;

export class SlimNodeMySQL {
  protected pool: SlimNodeMySQLPool;

  constructor(config: string | PoolConfig) {
    this.pool = new SlimNodeMySQLPool(config);
  }

  query<TableModel>(sql: string, parameters?: PreparedStatementParameters): Promise<TableModel[]> {
    if (parameters) {
      return this.pool.query<TableModel[]>(sql, parameters);
    }

    return this.pool.query<TableModel[]>(sql);
  }

  execute(sql: string, parameters?: PreparedStatementParameters): Promise<OkPacket> {
    if (parameters) {
      return this.pool.query<OkPacket>(sql, parameters);
    }

    return this.pool.query<OkPacket>(sql);
  }

  async getOne<TableModel>(sql: string, parameters: PreparedStatementParameters): Promise<TableModel | null> {
    const results = await this.query<TableModel>(sql, parameters);

    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  async getValue<TableModel, K extends keyof TableModel>(
    column: K,
    sql: string,
    parameters: PreparedStatementParameters
  ): Promise<TableModel[K] | null> {
    const result = await this.getOne<TableModel>(sql, parameters);

    if (!result) {
      return null;
    }

    return result[column];
  }

  async exists<TableModel>(sql: string, parameters: PreparedStatementParameters): Promise<boolean> {
    const result = await this.getOne<TableModel>(sql, parameters);
    return result !== null;
  }

  close(): void {
    this.pool?.close();
    this.pool = null;
  }
}
