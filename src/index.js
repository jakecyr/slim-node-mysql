const mysql = require('mysql');

class Prohairesis {

    constructor(config) {
        this.pool = mysql.createPool(config);
    }
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
    query(sqlString) {
        return new Promise((resolve, reject) => {
            this.getConnection()
                .then((connection) => {
                    connection.query(sqlString, (error, rows) => {
                        connection.release();

                        if (error) {
                            reject(error);
                        } else {
                            resolve(rows);
                        }
                    });
                })
                .catch(reject);
        });
    }
    close() {
        if (this.pool) {
            this.pool.end();
        }
    }
}

module.exports = Prohairesis;
