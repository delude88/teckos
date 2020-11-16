import { RecognizedString } from '../types';

/** An HttpRequest is stack allocated and only accessible during the callback invocation. */
export interface HttpRequest {
  /** Returns the lowercased header value or empty string. */
  getHeader(lowerCaseKey: RecognizedString): string;

  /** Returns the parsed parameter at index. Corresponds to route. */
  getParameter(index: number): string;

  /** Returns the URL including initial /slash */
  getUrl(): string;

  /** Returns the HTTP method, useful for "any" routes. */
  getMethod(): string;

  /** Returns the raw querystring (the part of URL after ? sign) or empty string. */
  getQuery(): string;

  /** Returns a decoded query parameter value or empty string. */
  getQuery(key: string): string;

  /** Loops over all headers. */
  forEach(cb: (key: string, value: string) => void): void;

  /** Setting yield to true is to say that this route handler did not handle the route,
   * causing the router to continue looking for a matching route handler, or fail. */
  setYield(y: boolean): HttpRequest;
}
