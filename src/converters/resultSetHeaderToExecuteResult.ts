import { ResultSetHeader } from 'mysql2';
import { ExecuteResult } from '../models/ExecuteResult';

export const resultSetHeaderToExecuteResult = (
  resultSetHeader: ResultSetHeader
): ExecuteResult => ({
  affectedRows: resultSetHeader.affectedRows,
  insertId: resultSetHeader.insertId,
  changedRows: resultSetHeader.changedRows,
});
