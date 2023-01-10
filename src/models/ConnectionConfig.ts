export interface ConnectionConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  otherConfig?: Record<string, string>;
}
