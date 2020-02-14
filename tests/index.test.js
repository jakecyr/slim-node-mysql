const Prohairesis = require('../src/index');

test('create new instance', () => {
    const database = new Prohairesis('mysql://user:pass...');
    expect(database).toBeInstanceOf(MySQL);
});
