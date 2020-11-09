# Prohairesis

MySQL database class to abstract pooling and prepared statements

## Installation

```javascript
const { Prohairesis } = require('prohairesis');

// create new database instance
const database = new Prohairesis(env.database);
```

## Methods

### query

```javascript
database.query(`
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
`, {
    id: 1,
});

// returns an array of rows found
```

### getOne

```javascript
database.getOne(`
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
`, {
    id: 1,
});

// returns an object of row found or null if no rows returned
```

### getValue

```javascript
const username = database.getValue('username', `
    SELECT
        *
    FROM
        User
    WHERE
        id = @id
`, {
    id: 1,
});

// returns value from column specified
```

### execute

```javascript
const response = database.execute(`
    INSERT INTO User(
        username,
        password
    ) VALUES (
        @username,
        SHA2(@password, 256)
    )
`, {
    username: 'jake',
    password: 'passwordHere',
});

console.log(response); // { insertId: 1, affectedRows: 1, etc... }
```

### exists

```javascript
const userExists = database.exists(`
    SELECT *
    FROM User
    WHERE id = @id
`, {
    id: 1,
});

console.log(userExists); // true
```
