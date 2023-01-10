# Slim Node MySQL

MySQL database class to abstract pooling and prepared statements.

![Build Status](https://api.travis-ci.com/jakecyr/slim-node-server.svg)
![Another](https://img.shields.io/npm/v/slim-node-mysql.svg)

## Table of Contents

- [Installation](#installation)
- [Download](#download)
- [Example Setup](#example-setup)
- [Usage](#usage)
- [Methods](#methods)
  - [query](#query)
  - [execute](#execute)
  - [getOne](#getone)
  - [getValue](#getvalue)
  - [execute](#execute)
  - [exists](#exists)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Functional Tests](#functional-tests)

## Installation

To install the package from npm run:

```bash
npm install slim-node-mysql
```

## Download

[Download the latest Slim Node MySQL package.](https://unpkg.com/slim-node-mysql)

## Example Setup

It is recommended that a single `SlimNodeMySQL` instance is used throughout your app so it can effectively manage pooling.

```javascript
const { SlimNodeMySQL } = require('slim-node-mysql');

// create new database instance with the MySQL connection string
const database = new SlimNodeMySQL(env.database);
```

## Usage

If non-`SELECT` queries are executed, the resulting value will be of the type `ExecuteResult` containing the following properties:

```typescript
interface ExecuteResult {
  fieldCount: number;
  affectedRows: number;
  changedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  procotol41: boolean;
}
```

## Methods

### query

```typescript
// returns an array of rows found or an empty array if nothing is found
const data: User = await database.query<User>(
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

Used to run all non-SELECT queries.

Example update:

```typescript
const result: ExecuteResult = await database.execute(
  `
    UPDATE User
    SET username = @username
    WHERE id = @id
  `,
  {
    id: 1,
    username: 'newUsername',
  }
);

console.log(result.affectedRows); // 1
console.log(result.changedRows); // 1
```

Example insert:

```typescript
const result: ExecuteResult = await database.execute(
  `
    INSERT INTO User (id, username)
    VALUES (@id, @username)
  `,
  {
    id: 3
    username: 'newUsername',
  }
);

console.log(result.affectedRows); // 1
console.log(result.insertId); // 3
console.log(result.changedRows); // 0
```

### getOne

```typescript
// returns an object with data from the matched row or null if no match was found
const data: User = await database.getOne<User>(
  `
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
    LIMIT 1
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
    LIMIT 1
`,
  {
    id: 1,
  }
);
```

### exists

```typescript
// returns a boolean value depending on if any rows are returned or not
const exists: boolean = await database.exists<User>(
  `
    SELECT *
    FROM User
    WHERE id = @id
    LIMIT 1
`,
  {
    id: 1,
  }
);

console.log(userExists); // true
```

## Testing

### Unit Tests

```bash
npm run test
```

### Functional Tests

```bash
CONNECTION_STRING=<TEST DATABASE CONNECTION STRING> ./node_modules/.bin/jest functional-tests/**/*.test.ts --runInBand
```
