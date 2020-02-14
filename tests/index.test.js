const MySQL = require('../src/index');

test('create new instance', () => {
    const database = new MySQL('mysql://user:pass...');
    expect(database).toBeInstanceOf(MySQL);
});
