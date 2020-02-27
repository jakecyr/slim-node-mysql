import { createPool, Pool, PoolConfig, PoolConnection, MysqlError } from 'mysql';
import { readFile } from 'fs';

export class Prohairesis {

    pool: Pool;

    constructor(config: (string | PoolConfig)) {
        this.pool = createPool(config);
    }
    query<TableModel, Params>(sql: string, values: Params): Promise<TableModel[]> {
        return new Promise((resolve, reject) => {
            this
                .getConnection()
                .then((connection) => {
                    let preparedValues = undefined;
                    let preparedSQL = sql;

                    if (values) {
                        let results = /@([A-Za-z]+)/.exec(preparedSQL);

                        preparedValues = [];

                        while (results && results.length == 2) {
                            const [match, key] = results;

                            if (values.hasOwnProperty(key)) {
                                preparedValues.push(values[key]);
                                preparedSQL = preparedSQL.replace(match, '?');
                            } else {
                                return reject(`Values object is missing value key/value for ${key}`);
                            }

                            results = /@([A-Za-z]+)/.exec(preparedSQL);
                        }
                    }

                    connection.query(preparedSQL, preparedValues, (err: MysqlError | null, results: TableModel[]) => {
                        connection.release();

                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                })
                .catch(reject);
        });
    }
    getOne<TableModel, Params>(sql: string, params: Params): Promise<TableModel> {
        return new Promise((resolve) => {
            this
                .query<TableModel, Params>(sql, params)
                .then((results: TableModel[]) => {
                    if (results && results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null);
                    }
                });
        });
    }
    getValue<TableModel, Params>(column: string, sql: string, params: Params): Promise<any> {
        return new Promise((resolve, reject) => {
            this
                .getOne<TableModel, Params>(sql, params)
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
    exists<TableModel, Params>(sql: string, params: Params): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this
                .getOne<TableModel, Params>(sql, params)
                .then((result) => resolve(result !== null))
                .catch(reject);
        });
    }
    execute<TableModel, Params>(sql: string, params: Params): Promise<TableModel[]> {
        return this.query<TableModel, Params>(sql, params);
    }
    insert<TableModel, Params>(table: string, data: Params) {
        return this.query<TableModel, Params>(`
			INSERT INTO ${table} (
				${ Object.keys(data).join(',')}
			) VALUES (
				${ Object.keys(data).map((v) => ':' + v).join(`, `)}
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
    queryFromFile<TableModel, Params>(filePath: string, params?: Params): Promise<TableModel[]> {
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    this
                        .query<TableModel, Params>(data.toString(), params)
                        .then((data: TableModel[]) => resolve(data))
                        .catch((err: Error) => reject(err));
                }
            });
        });
    }
}   
