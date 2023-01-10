import { ConnectionConfig } from '../models/ConnectionConfig';

export interface ConnectionStringParser {
  parseConnectionString(connectionString: string): ConnectionConfig;
}
