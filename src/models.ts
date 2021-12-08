import { FieldPacket } from 'mysql2';

export interface QueryFields {
  _fields: FieldPacket[];
}

export type QueryResult<T> = T & QueryFields;
