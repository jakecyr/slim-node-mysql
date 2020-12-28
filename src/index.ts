import { createPool, Pool, PoolConfig, PoolConnection, MysqlError, OkPacket } from 'mysql';
import { readFile } from 'fs';

let pool = null;

export class Prohairesis {

    pool: Pool;

    constructor(config: (string | PoolConfig)) {
        if (pool) {
            this.pool = pool;
        } else {
            pool = createPool(config);
            this.pool = pool;
        }
    }
    query<TableModel>(sql: string, values?: Record<string, any>): Promise<TableModel[]> {
        return new Promise((resolve, reject) => {
            let preparedValues = undefined;
            let preparedSQL = sql;

            if (values) {
                let results = /@([A-Za-z_]+)/.exec(preparedSQL);

                preparedValues = [];

                while (results && results.length == 2) {
                    const [match, key] = results;

                    if (values.hasOwnProperty(key)) {
                        preparedValues.push(values[key]);
                        preparedSQL = preparedSQL.replace(match, '?');
                    } else {
                        return reject(`Values object is missing value key/value for ${key}`);
                    }

                    results = /@([A-Za-z_]+)/.exec(preparedSQL);
                }
            }

            this.pool.query(preparedSQL, preparedValues, (err: MysqlError | null, results: TableModel[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    execute(sql: string, values?: Record<string, any>): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            let preparedValues = undefined;
            let preparedSQL = sql;

            if (values) {
                let results = /@([A-Za-z_]+)/.exec(preparedSQL);

                preparedValues = [];

                while (results && results.length == 2) {
                    const [match, key] = results;

                    if (values.hasOwnProperty(key)) {
                        preparedValues.push(values[key]);
                        preparedSQL = preparedSQL.replace(match, '?');
                    } else {
                        return reject(`Values object is missing value key/value for ${key}`);
                    }

                    results = /@([A-Za-z_]+)/.exec(preparedSQL);
                }
            }

            this.pool.query(preparedSQL, preparedValues, (err: MysqlError | null, response: OkPacket) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }
    getOne<TableModel>(sql: string, params: Record<string, any>): Promise<TableModel> {
        return new Promise((resolve) => {
            this
                .query<TableModel>(sql, params)
                .then((results: TableModel[]) => {
                    if (results && results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null);
                    }
                });
        });
    }
    getValue<TableModel>(column: string, sql: string, params: Record<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this
                .getOne<TableModel>(sql, params)
                .then((result: TableModel) => {
                    if (result) {
                        resolve(result[column]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(reject);
        });
    }
    exists<TableModel>(sql: string, params: Record<string, any>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this
                .getOne<TableModel>(sql, params)
                .then((result) => resolve(result !== null))
                .catch(reject);
        });
    }
    insert(table: string, data: Record<string, any>): Promise<OkPacket> {
        return this.execute(`
			INSERT INTO ${table} (
				${Object.keys(data).join(',')}
			) VALUES (
				${Object.keys(data).map((v: string) => '@' + v).join(`, `)}
			)
		`, {
            ...data
        });
    }
    getConnection(): Promise<PoolConnection> {
        return new Promise((resolve, reject) => {
            try {
                this.pool.getConnection((error, connection) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(connection);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
    close(): void {
        if (this.pool) {
            this.pool.end();
        }
    }
    queryFromFile<TableModel>(filePath: string, params?: Record<string, any>): Promise<TableModel[]> {
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    this
                        .query<TableModel>(data.toString(), params)
                        .then((data: TableModel[]) => resolve(data))
                        .catch((err: Error) => reject(err));
                }
            });
        });
    }
}   
