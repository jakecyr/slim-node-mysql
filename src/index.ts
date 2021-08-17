import { createPool, Pool, PoolConfig, PoolConnection, MysqlError, OkPacket } from 'mysql';
import { readFile } from 'fs-extra';

let pool = null;

export class SlimNodeMySQL {
    pool: Pool;

    constructor(config: string | PoolConfig) {
        if (pool === null) {
            pool = createPool(config);
        }

        this.pool = pool;
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

                    if (key in values) {
                        preparedValues.push(values[key]);
                        preparedSQL = preparedSQL.replace(match, '?');
                    } else {
                        return reject(`Values object is missing value key / value for ${key}`);
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
    async getOne<TableModel>(sql: string, params: Record<string, any>): Promise<TableModel | null> {
        const results = await this.query<TableModel>(sql, params);

        if (results && results.length > 0) {
            return results[0];
        } else {
            return null;
        }
    }
    async getValue<TableModel, K extends keyof TableModel>(column: K, sql: string, params: Record<string, any>): Promise<TableModel[K] | null> {
        const result = await this.getOne<TableModel>(sql, params);

        if (result) {
            return result[column];
        } else {
            return null;
        }
    }
    async exists<TableModel>(sql: string, params: Record<string, any>): Promise<boolean> {
        const result = await this.getOne<TableModel>(sql, params);
        return result !== null;
    }
    insert(table: string, data: Record<string, any>): Promise<OkPacket> {
        return this.execute(
            `
			INSERT INTO ${table} (
				${Object.keys(data).join(',')}
			) VALUES (
				${Object.keys(data)
                    .map((v: string) => '@' + v)
                    .join(`, `)}
			)
		`,
            {
                ...data,
            }
        );
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
            this.pool = null;
        }

        if (pool) {
            pool = null;
        }
    }
    async queryFromFile<TableModel>(filePath: string, params?: Record<string, any>): Promise<TableModel[]> {
        try {
            const data = await readFile(filePath);
            return this.query<TableModel>(data.toString(), params);
        } catch (error) {
            throw error;
        }
    }
}
