import { resultSetHeaderToExecuteResult } from '../../src/converters/resultSetHeaderToExecuteResult';
import { ResultSetHeader } from 'mysql2';
import { ExecuteResult } from '../../src/models/ExecuteResult';

describe('resultSetHeaderToExecuteResult', () => {
  it('should convert an ResultSetHeader to an ExecuteResult', () => {
    const resultSetHeader: ResultSetHeader = {
      constructor: {
        name: 'ResultSetHeader',
      },
      affectedRows: 1,
      insertId: 2,
      fieldCount: 3,
      changedRows: 4,
      serverStatus: 5,
      info: 'info',
      warningStatus: 2,
    };

    const expected: ExecuteResult = {
      affectedRows: 1,
      insertId: 2,
      changedRows: 4,
    };

    const actual = resultSetHeaderToExecuteResult(resultSetHeader);

    expect(actual).toEqual(expected);
  });

  it('should convert an ResultSetHeader to an ExecuteResult with undefined values', () => {
    const resultSetHeader: ResultSetHeader = {
      constructor: {
        name: 'ResultSetHeader',
      },
      affectedRows: undefined,
      insertId: undefined,
      fieldCount: undefined,
      changedRows: undefined,
      serverStatus: undefined,
      warningStatus: undefined,
      info: undefined,
    };

    const expected: ExecuteResult = {
      affectedRows: undefined,
      insertId: undefined,
      changedRows: undefined,
    };

    const actual = resultSetHeaderToExecuteResult(resultSetHeader);

    expect(actual).toEqual(expected);
  });

  it('should convert an ResultSetHeader to an ExecuteResult with null values', () => {
    const resultSetHeader: ResultSetHeader = {
      constructor: {
        name: 'ResultSetHeader',
      },
      affectedRows: null,
      insertId: null,
      fieldCount: null,
      changedRows: null,
      serverStatus: null,
      warningStatus: null,
      info: null,
    };

    const expected: ExecuteResult = {
      affectedRows: null,
      insertId: null,
      changedRows: null,
    };

    const actual = resultSetHeaderToExecuteResult(resultSetHeader);

    expect(actual).toEqual(expected);
  });
});
