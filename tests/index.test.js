const { Prohairesis } = require('../dist/index');

test('create new instance', () => {
    const database = new Prohairesis('mysql://user:pass...');
    expect(database).toBeInstanceOf(Prohairesis);
});
