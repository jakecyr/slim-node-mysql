// @ts-check

const mysql = require('mysql');

class Prohairesis {

    /**
     * @param {string} config 
     */
    constructor(config) {
        this.pool = mysql.createPool(config);
    }
    /**
     * @param {string} sql
     * @param {{ [x: string]: any; }} values
     * @param {Function} formatter
     */
    query(sql, values, formatter = null) {
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

                    /**
                     * @param {string} error
                     * @param {any} results
                     */
                    connection.query(preparedSQL, preparedValues, (error, results) => {
                        connection.release();

                        if (error) {
                            reject(error)
                        } else {
                            if (formatter) {
                                resolve(formatter(results));
                            } else {
                                resolve(results);
                            }
                        }
                    });
                })
                .catch(reject);
        });
    }
    /**
     * @param {string} sql
     * @param {{ [x: string]: any; }} params
     * @returns {object}
     */
    getOne(sql, params) {
        return this.query(sql, params, (results) => results && results.length > 0 ? results[0] : null);
    }
    /**
     * 
     * @param {string} column 
     * @param {string} sql 
     * @param {object} params 
     * @returns {any} Value from referenced column
     */
    getValue(column, sql, params) {
        return new Promise((resolve, reject) => {
            this
                .getOne(sql, params)
                .then((result) => {
                    if (result) {
                        resolve(result[column]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(reject);
        });
    }
    /**
     * @param {string} sql
     * @param {{ [x: string]: any; }} params
     * @returns {Promise<boolean>}
     */
    exists(sql, params) {
        return this.query(sql, params, (result) => !!result);
    }
    /**
     * @param {string} sql
     * @param {{ [x: string]: any; }} params
     */
    execute(sql, params) {
        return this.query(sql, params);
    }
    /**
     * @param {string} table
     * @param {{ [x: string]: any; }} data
     */
    insert(table, data) {
        return this.query(`
			INSERT INTO ${table} (
				${ Object.keys(data).join(',')}
			) VALUES (
				${ Object.keys(data).map((v) => ':' + v).join(`, `)}
			)
		`, {
            ...data
        });
    }
    /**
     * @returns {Promise<any>}
     */
    getConnection() {
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
    close() {
        if (this.pool) {
            this.pool.end();
        }
    }

}

module.exports = Prohairesis;
