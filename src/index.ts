import { createPool, Pool, PoolConfig, PoolConnection, MysqlError } from 'mysql';

export class Prohairesis {

    pool: Pool;

    constructor(config: (string | PoolConfig)) {
        this.pool = createPool(config);
    }
    query<TableModel, Params>(sql: string, values: Params): Promise<TableModel[]> {
        return new Promise((resolve, reject) => {
            this.getConnection()
                .then((connection) => {
                    let preparedValues = undefined;
                    let preparedSQL = sql;

                    if (values) {
                        let valueIndex = {};

                        for (let key in values) {
                            if (!preparedValues) preparedValues = [];
                            valueIndex[sql.indexOf(':' + key)] = key;
                            preparedSQL = preparedSQL.replace(':' + key, '?');
                        }

                        const valueIndices = Object
                            .keys(valueIndex)
                            .sort((a, b) => a > b ? 1 : -1);

                        for (let index of valueIndices) {
                            preparedValues.push(values[valueIndex[index]])
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
        return new Promise((resolve, reject) => {
            this
                .query<TableModel, Params>(sql, params)
                .then((results: TableModel[]) => {
                    if (results && results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject(null);
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
                        reject(null);
                    }
                })
                .catch(reject);
        });
    }
    exists<TableModel, Params>(sql: string, params: Params): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this
                .getOne<TableModel, Params>(sql, params)
                .then((result) => resolve(!!result))
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
}
