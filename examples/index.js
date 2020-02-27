require('dotenv').config();

const { Prohairesis } = require('../dist/index');

const db = new Prohairesis(process.env.DATABASE);

db
    .query(`
        SELECT
            *
        FROM
            User
        WHERE
            id = @id
            AND username = @username
            AND admin = @admin
            AND token = @token
    `, {
        id: 312,
        token: '2454932',
        username: 'Bidin',
        admin: 0,
    })
    .then((result) => {
        console.log(result);
        db.close();
    })
    .catch((err) => {
        console.error(err);
        db.close();
    });
