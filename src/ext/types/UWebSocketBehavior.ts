/** WebSocket compression options */
import { HttpResponse } from './HttpResponse';
import { HttpRequest } from './HttpRequest';
import {UWebSocket} from "./UWebSocket";

export type CompressOptions = number;

/** Native type representing a raw uSockets struct us_socket_context_t.
 * Used while upgrading a WebSocket manually. */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface us_socket_context_t {

}
/** A structure holding settings and handlers for a WebSocket URL route handler. */
export interface UWebSocketBehavior {
  /** Maximum length of received message. If a client tries to send you
   * a message larger than this, the connection is immediately closed. */
  maxPayloadLength?: number;
  /** Maximum amount of seconds that may pass without sending or getting a message.
   * Connection is closed if this timeout passes. Resolution (granularity) for
   * timeouts are typically 4 seconds, rounded to closest.
   * Disable by leaving 0.
   */
  idleTimeout?: number;
  /** What permessage-deflate compression to use. uWS.DISABLED,
   * uWS.SHARED_COMPRESSOR or any of the uWS.DEDICATED_COMPRESSOR_xxxKB. */
  compression?: CompressOptions;
  /** Maximum length of allowed backpressure per socket when PUBLISHING messages
   * (does not apply to ws.send).
   * Slow receivers with too high backpressure will be skipped until they catch up or timeout. */
  maxBackpressure?: number;
  /** Upgrade handler used to intercept HTTP upgrade requests and potentially upgrade to WebSocket.
   * See UpgradeAsync and UpgradeSync example files.
   */
  upgrade?: (res: HttpResponse, req: HttpRequest, context: us_socket_context_t) => void;
  /** Handler for new WebSocket connection. WebSocket is valid from open to close, no errors. */
  open?: (ws: UWebSocket) => void;
  /** Handler for a WebSocket message. Messages are given as ArrayBuffer no matter if they are
   * binary or not. Given ArrayBuffer is valid during the lifetime of this callback
   * (until first await or return) and will be neutered. */
  message?: (ws: UWebSocket, message: ArrayBuffer, isBinary: boolean) => void;
  /** Handler for when WebSocket backpressure drains. Check ws.getBufferedAmount().
   *  Use this to guide / drive your backpressure throttling. */
  drain?: (ws: UWebSocket) => void;
  /** Handler for close event, no matter if error, timeout or graceful close.
   * You may not use WebSocket after this event. Do not send on this
   * WebSocket from within here, it is closed. */
  close?: (ws: UWebSocket, code: number, message: ArrayBuffer) => void;
  /** Handler for received ping control message. You do not need to handle
   *  this, pong messages are automatically sent as per the standard. */
  ping?: (ws: UWebSocket) => void;
  /** Handler for received pong control message. */
  pong?: (ws: UWebSocket) => void;
}
