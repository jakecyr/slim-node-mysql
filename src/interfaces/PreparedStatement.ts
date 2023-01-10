import { ParsedPreparedStatement } from '../models/ParsedPreparedStatement';

export interface PreparedStatement {
  prepare(): ParsedPreparedStatement;
}
