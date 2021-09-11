# Slim Node MySQL

MySQL database class to abstract pooling and prepared statements.

## Installation

To install the package from npm run:

```bash
npm install slim-node-mysql
```

## Example Setup

It is recommended that a single `SlimNodeMySQL` instance is used throughout your app so it can effectively manage pooling.

```javascript
const { SlimNodeMySQL } = require('slim-node-mysql');

// create new database instance with the MySQL connection string
const database = new SlimNodeMySQL(env.database);
```

## Methods

### query

```typescript
// returns an array of rows found or an empty array if nothing is found
const users: User[] = await database.query<User>(
  `
  SELECT
      *
  FROM
      User
  WHERE
      id = @id
  `,
  {
    id: 1,
  }
);
```

### getOne

```typescript
// returns an object with data from the matched row or null if no match was found
const user: User = await database.getOne<User>(
  `
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
`,
  {
    id: 1,
  }
);
```

### getValue

```typescript
// returns value from column specified (generics are optional)
const username: string = database.getValue<User, 'username'>(
  'username',
  `
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
`,
  {
    id: 1,
  }
);
```

### execute

```typescript
const response: OkPacket = await database.execute(
  `
    INSERT INTO User (
        username,
        password
    ) VALUES (
        @username,
        SHA2(@password, 256)
    )
`,
  {
    username: 'jake',
    password: 'passwordHere',
  }
);

// returns an OkPacket object from the MySQL npm package
console.log(response); // { insertId: 1, affectedRows: 1, etc... }
```

### exists

```typescript
// returns a boolean value depending on if any rows are returned or not
const userExists = await database.exists<User>(
  `
    SELECT *
    FROM User
    WHERE id = @id
`,
  {
    id: 1,
  }
);

console.log(userExists); // true
```
