import { PreparedStatementError } from './errors/PreparedStatementError';
import { PreparedStatement } from './interfaces/PreparedStatement';
import { ParsedPreparedStatement } from './models/ParsedPreparedStatement';
import { PreparedStatementParameters } from './models/PreparedStatementParameters';

/**
 * A MySQL prepared statement. Parses a SQL query with variables and returns the prepared SQL string and variable to value map.
 */
export class MySQLPreparedStatement implements PreparedStatement {
  private sqlString: string;
  private parameters: PreparedStatementParameters;
  protected replaceValuesWith: string = '?';

  constructor(sqlString: string, parameters: PreparedStatementParameters) {
    this.sqlString = sqlString;
    this.parameters = parameters;
  }

  /**
   * Set the string to replace SQL variables with (? for MySQL).
   * Defaults to '?'.
   * @param replaceValuesWith the string to replace variables with.
   */
  public setReplaceValuesWith(replaceValuesWith: string): void {
    this.replaceValuesWith = replaceValuesWith;
  }

  /**
   * Prepare the SQL string and values for execution.
   * @returns the prepared SQL string and values.
   */
  public prepare(): ParsedPreparedStatement {
    let preparedSQL = this.sqlString;
    const preparedValues = [];
    let match: RegExpMatchArray;

    while ((match = preparedSQL.match(/@([A-Za-z_]+)/))) {
      const variableName = match[0];
      const baseVariableName = match[1];

      if (!(baseVariableName in this.parameters)) {
        throw new PreparedStatementError(
          `Missing prepared statement value for SQL variable '${variableName}'`
        );
      }

      preparedSQL = preparedSQL.replace(variableName, this.replaceValuesWith);
      preparedValues.push(this.parameters[baseVariableName]);
    }

    return {
      preparedSQL,
      preparedValues: preparedValues.length > 0 ? preparedValues : null,
    };
  }
}
