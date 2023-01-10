import { ExecuteResult } from '../models/ExecuteResult';
import { PreparedStatementParameters } from '../models/PreparedStatementParameters';

export interface DatabasePool {
  query<ReturnType>(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<ReturnType[]>;
  execute(
    sql: string,
    parameters?: PreparedStatementParameters
  ): Promise<ExecuteResult>;
  close(): Promise<void>;
}
