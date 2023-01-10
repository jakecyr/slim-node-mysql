import { MySQLPreparedStatement } from '../src/MySQLPreparedStatement';
import { PreparedStatementError } from '../src/errors/PreparedStatementError';

describe('MySQLPreparedStatement', () => {
  describe('prepare', () => {
    it('should return a parsed prepared statement with placeholders for variable names and corresponding values', () => {
      const sqlString = 'SELECT * FROM users WHERE id = @id';
      const parameters = { id: 1 };
      const mysqlPreparedStatement = new MySQLPreparedStatement(
        sqlString,
        parameters
      );
      const parsedPreparedStatement = mysqlPreparedStatement.prepare();

      expect(parsedPreparedStatement).toEqual({
        preparedSQL: 'SELECT * FROM users WHERE id = ?',
        preparedValues: [1],
      });
    });

    it('should return a parsed prepared statement with no values if no variable names are present in the SQL string', () => {
      const sqlString = 'SELECT * FROM users';
      const parameters = {};
      const mysqlPreparedStatement = new MySQLPreparedStatement(
        sqlString,
        parameters
      );

      const parsedPreparedStatement = mysqlPreparedStatement.prepare();

      expect(parsedPreparedStatement).toEqual({
        preparedSQL: 'SELECT * FROM users',
        preparedValues: null,
      });
    });

    it('should throw a PreparedStatementError if a variable name is present in the SQL string but not in the parameters object', () => {
      const sqlString = 'SELECT * FROM users WHERE id = @id';
      const parameters = {};
      const mysqlPreparedStatement = new MySQLPreparedStatement(
        sqlString,
        parameters
      );

      expect(() => {
        mysqlPreparedStatement.prepare();
      }).toThrow(PreparedStatementError);
    });
  });
});
