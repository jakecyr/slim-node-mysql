/**
 * Result of running an INSERT, UPDATE, DELETE query.
 */
export interface ExecuteResult {
  /**
   * Number of rows affected by the SQL statement (INSERT, UPDATE, DELETE).
   */
  affectedRows: number;

  /**
   * The value of the auto-increment column for the first row inserted by the SQL statement.
   */
  insertId: number;

  /**
   * Number of existing rows that have been modified by the SQL statement.
   */
  changedRows: number;
}
