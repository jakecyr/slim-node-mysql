import { PoolOptions } from 'mysql2';
import { PoolAlreadyExistsError } from './errors/PoolAlreadyExistsError';
import { ExecuteResult } from './models/ExecuteResult';
import { PreparedStatementParameters } from './models/PreparedStatementParameters';
import { SlimNodeMySQLPool } from './SlimNodeMySQLPool';

/**
 * The main class for SlimNodeMySQL to create a new connection to the database and perform queries.
 */
export class SlimNodeMySQL {
  private pool: SlimNodeMySQLPool;
  private config: string | PoolOptions;
  private otherPoolOptions: PoolOptions;

  constructor(config: string | PoolOptions, otherPoolOptions?: PoolOptions) {
    this.config = config;
    this.otherPoolOptions = otherPoolOptions;
    this.pool = new SlimNodeMySQLPool(this.config, this.otherPoolOptions);
  }

  /**
   * Check if there is an open pool.
   * @returns true if the pool is open.
   */
  hasOpenPool(): boolean {
    return this.pool != null;
  }

  /**
   * Re-connect to the database if the close method has been called.
   * The constructor auto-connects to the database so this method is only needed if the close method has been called.
   */
  connect() {
    if (this.pool) {
      throw new PoolAlreadyExistsError(
        'The pool has already been initialized. Please close the current pool first or create another instance of SlimNodeMySQL.'
      );
    }

    this.pool = new SlimNodeMySQLPool(this.config, this.otherPoolOptions);
  }

  /**
   * Executes a create, update, or delete SQL query and returns the result.
   * @param sql SQL to run
   * @param parameters Prepared statement parameters to to replace in the SQL (keys should match the "@" in the SQL)
   * @returns An ExecuteResult object.
   */
  execute(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<ExecuteResult> {
    return this.pool.execute(sql, parameters);
  }

  /**
   * Query the database for a list of records.
   * @param sql The SQL to run to get records.
   * @param parameters The prepared statement parameters to replace in the SQL (keys should match the "@" in the SQL)
   * @returns A list of records.
   */
  query<TableModel>(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<TableModel[]> {
    if (parameters) {
      return this.pool.query<TableModel>(sql, parameters);
    }

    return this.pool.query<TableModel>(sql);
  }

  /**
   * Return a single record from the database or null if no record is found. For large queries, use a LIMIT in the SQL for better performance.
   * @param sql The SQL to run to get a single record.
   * @param parameters The prepared statement parameters to replace in the SQL (keys should match the "@" in the SQL)
   * @returns the record or null.
   */
  async getOne<TableModel>(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<TableModel> {
    const data: TableModel[] = await this.pool.query<TableModel>(sql, parameters);

    if (data.length === 0) {
      return null;
    }

    return {
      ...data[0],
    };
  }

  /**
   * Get a single value from a record. For large queries, use a LIMIT in the SQL for better performance.
   * @param column the column of the record to return.
   * @param sql the SQL to run to get the record.
   * @param parameters the prepared statement parameters to replace in the SQL (keys should match the "@" in the SQL)
   * @returns the value of the column or null if no record is found.
   */
  async getValue<TableModel, K extends keyof TableModel>(
    column: K,
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<TableModel[K] | null> {
    const data = await this.pool.query<TableModel>(sql, parameters);

    if (!data || data.length === 0) {
      return null;
    }

    return data[0][column];
  }

  /**
   * Check if a given record exists.
   * @param sql SQL to run to check if a record exists.
   * @param parameters Prepared statement parameters to to replace in the SQL (keys should match the "@" in the SQL)
   * @returns boolean value if the record exists.
   */
  async exists<TableModel>(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<boolean> {
    const items = await this.pool.query<TableModel>(sql, parameters);
    return items.length > 0;
  }

  /**
   * Close the database pool.
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
    }

    this.pool = null;
  }
}
