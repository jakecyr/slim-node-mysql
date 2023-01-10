export const poolQueryMock = jest.fn().mockImplementation(async (_sql, _params) => {
  return [[{ name: 'Jon' }, { name: 'Aarya' }, { name: 'Ned' }], [{ name: 'name' }]];
});

export const endMock: jest.Mock = jest.fn().mockImplementation(async () => {
  return;
});

export const createPool = jest.fn().mockImplementation(() => ({
  query: poolQueryMock,
  end: endMock,
}));
