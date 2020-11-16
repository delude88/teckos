/** An HttpResponse is valid until either onAborted callback or
 * any of the .end/.tryEnd calls succeed. You may attach user data to this object. */
import { RecognizedString } from './RecognizedString';

/** Native type representing a raw uSockets struct us_socket_context_t.
 * Used while upgrading a WebSocket manually. */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface us_socket_context_t {

}
export interface HttpResponse {
  /** Writes the HTTP status message such as "200 OK".
   * This has to be called first in any response, otherwise
   * it will be called automatically with "200 OK".
   *
   * If you want to send custom headers in a WebSocket
   * upgrade response, you have to call writeStatus with
   * "101 Switching Protocols" before you call writeHeader,
   * otherwise your first call to writeHeader will call
   * writeStatus with "200 OK" and the upgrade will fail.
   *
   * As you can imagine, we format outgoing responses in a linear
   * buffer, not in a hash table. You can read about this in
   * the user manual under "corking".
   */
  writeStatus(status: RecognizedString): HttpResponse;

  /** Writes key and value to HTTP response.
   * See writeStatus and corking.
   */
  writeHeader(key: RecognizedString, value: RecognizedString): HttpResponse;

  /** Enters or continues chunked encoding mode.
   * Writes part of the response. End with zero length write. */
  write(chunk: RecognizedString): HttpResponse;

  /** Ends this response by copying the contents of body. */
  end(body?: RecognizedString): HttpResponse;

  /** Ends this response, or tries to, by streaming appropriately
   * sized chunks of body. Use in conjunction with onWritable. Returns tuple [ok, hasResponded]. */
  tryEnd(fullBodyOrChunk: RecognizedString, totalSize: number): [boolean, boolean];

  /** Immediately force closes the connection. Any onAborted callback will run. */
  close(): HttpResponse;

  /** Returns the global byte write offset for this response. Use with onWritable. */
  getWriteOffset(): number;

  /** Registers a handler for writable events. Continue failed write attempts in here.
   * You MUST return true for success, false for failure.
   * Writing nothing is always success, so by default you must return true.
   */
  onWritable(handler: (offset: number) => boolean): HttpResponse;

  /** Every HttpResponse MUST have an attached abort handler IF you do not respond
   * to it immediately inside of the callback. Returning from an Http request handler
   * without attaching (by calling onAborted) an abort handler is ill-use and will termiante.
   * When this event emits, the response has been aborted and may not be used. */
  onAborted(handler: () => void): HttpResponse;

  /** Handler for reading data from POST and such requests.
   * You MUST copy the data of chunk if isLast is not true.
   * We Neuter ArrayBuffers on return, making it zero length. */
  onData(handler: (chunk: ArrayBuffer, isLast: boolean) => void): HttpResponse;

  /** Returns the remote IP address in binary format (4 or 16 bytes). */
  getRemoteAddress(): ArrayBuffer;

  /** Returns the remote IP address as text. */
  getRemoteAddressAsText(): ArrayBuffer;

  /** Returns the remote IP address in binary format (4 or 16 bytes),
   * as reported by the PROXY Protocol v2 compatible proxy. */
  getProxiedRemoteAddress(): ArrayBuffer;

  /** Returns the remote IP address as text, as reported
   * by the PROXY Protocol v2 compatible proxy. */
  getProxiedRemoteAddressAsText(): ArrayBuffer;

  /** Corking a response is a performance improvement in both CPU and
   * network, as you ready the IO system for writing multiple chunks at once.
   * By default, you're corked in the immediately executing top portion
   * of the route handler. In all other cases, such as when returning from
   * await, or when being called back from an async database request or
   * anything that isn't directly executing in the route handler, you'll want
   * to cork before calling writeStatus, writeHeader or just write.
   * Corking takes a callback in which you execute the writeHeader, writeStatus and
   * such calls, in one atomic IO operation. This is important, not only
   * for TCP but definitely for TLS where each write would otherwise result
   * in one TLS block being sent off, each with one send syscall.
   *
   * Example usage:
   *
   * res.cork(() => {
   *   res.writeStatus("200 OK").writeHeader("Some", "Value").write("Hello world!");
   * });
   */
  cork(cb: () => void): void;

  /** Upgrades a HttpResponse to a WebSocket. See UpgradeAsync, UpgradeSync example files. */
  upgrade<T>(
    userData: T,
    secWebSocketKey: RecognizedString,
    secWebSocketProtocol: RecognizedString,
    secWebSocketExtensions: RecognizedString,
    context: us_socket_context_t): void;

  /** Arbitrary user data may be attached to this object */
  [key: string]: any;
}
