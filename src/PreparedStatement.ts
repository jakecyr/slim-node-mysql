import { PreparedStatementError } from './PreparedStatementError';

export class PreparedStatement {
  constructor(private sqlString: string, private parameters: Record<string, unknown>) {}

  prepare() {
    let preparedSql = this.sqlString;
    const preparedValues = [];
    let match: RegExpMatchArray;

    while ((match = preparedSql.match(/@([A-Za-z_]+)/))) {
      const variableName = match[0];
      const baseVariableName = match[1];

      if (!(baseVariableName in this.parameters)) {
        throw new PreparedStatementError(`Missing prepared statement value for SQL variable '${variableName}'`);
      }

      preparedSql = preparedSql.replace(variableName, '?');
      preparedValues.push(this.parameters[baseVariableName]);
    }

    return { preparedSql, preparedValues: preparedValues.length > 0 ? preparedValues : null };
  }
}
