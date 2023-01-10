export class PoolAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
  }
}
