export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(msg: string, details?: unknown) { return new HttpError(400, msg, details); }
  static notFound(msg = 'Recurso no encontrado') { return new HttpError(404, msg); }
  static conflict(msg: string, details?: unknown) { return new HttpError(409, msg, details); }
  static unprocessable(msg: string, details?: unknown) { return new HttpError(422, msg, details); }
}
