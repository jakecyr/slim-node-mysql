const { SlimNodeMySQL } = require('../dist/index');

(async () => {
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

  const result = await db.getOne(sql, sqlParameters);

  console.log(result);

  db.close();
})();
