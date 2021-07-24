export const poolQueryMock = jest.fn(async (_sql, _params, callback) => {
    return callback(null, [{ name: 'Jon' }, { name: 'Aarya' }, { name: 'Ned' }]);
});

export const createPool = jest.fn().mockImplementation(() => ({
    query: poolQueryMock,
}));

