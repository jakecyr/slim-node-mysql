const { SlimNodeMySQL } = require('../dist/index');

const db = new SlimNodeMySQL(process.env.DATABASE_CONNECTION_STRING);

const sql = `
    SELECT
        *
    FROM
        User
    WHERE
      id = @id
      AND username = @username
`;

const sqlParameters = {
  id: 1,
  username: 'Jon',
};

db.getOne(sql, sqlParameters)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    db.close();
  });
