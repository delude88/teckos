/** TemplatedApp is either an SSL or non-SSL app. See App for more info, read user manual. */
import { RecognizedString } from '.';
import {HttpResponse} from "./HttpResponse";
import {HttpRequest} from "./HttpRequest";
import {UWebSocketBehavior} from "./UWebSocketBehavior";

export interface us_listen_socket {

}

export enum ListenOptions {
  LIBUS_LISTEN_DEFAULT = 0,
  LIBUS_LISTEN_EXCLUSIVE_PORT = 1,
}
export type CompressOptions = number;
/** No compression (always a good idea if you operate using an efficient binary protocol) */
export var DISABLED: CompressOptions;
/** Zero memory overhead compression (recommended for pub/sub where same message is sent to many receivers) */
export var SHARED_COMPRESSOR: CompressOptions;
/** Sliding dedicated compress window, requires 3KB of memory per socket */
export var DEDICATED_COMPRESSOR_3KB: CompressOptions;
/** Sliding dedicated compress window, requires 4KB of memory per socket */
export var DEDICATED_COMPRESSOR_4KB: CompressOptions;
/** Sliding dedicated compress window, requires 8KB of memory per socket */
export var DEDICATED_COMPRESSOR_8KB: CompressOptions;
/** Sliding dedicated compress window, requires 16KB of memory per socket */
export var DEDICATED_COMPRESSOR_16KB: CompressOptions;
/** Sliding dedicated compress window, requires 32KB of memory per socket */
export var DEDICATED_COMPRESSOR_32KB: CompressOptions;
/** Sliding dedicated compress window, requires 64KB of memory per socket */
export var DEDICATED_COMPRESSOR_64KB: CompressOptions;
/** Sliding dedicated compress window, requires 128KB of memory per socket */
export var DEDICATED_COMPRESSOR_128KB: CompressOptions;
/** Sliding dedicated compress window, requires 256KB of memory per socket */
export var DEDICATED_COMPRESSOR_256KB: CompressOptions;

export interface TemplatedApp {
  /** Listens to hostname & port. Callback hands either false or a listen socket. */
  listen(host: RecognizedString, port: number, cb: (listenSocket: us_listen_socket) => void): TemplatedApp;

  /** Listens to port. Callback hands either false or a listen socket. */
  listen(port: number, cb: (listenSocket: any) => void): TemplatedApp;

  /** Listens to port and sets Listen Options. Callback hands either false or a listen socket. */
  listen(port: number, options: ListenOptions, cb: (listenSocket: us_listen_socket | false) => void): TemplatedApp;

  /** Registers an HTTP GET handler matching specified URL pattern. */
  get(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP POST handler matching specified URL pattern. */
  post(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP OPTIONS handler matching specified URL pattern. */
  options(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP DELETE handler matching specified URL pattern. */
  del(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP PATCH handler matching specified URL pattern. */
  patch(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP PUT handler matching specified URL pattern. */
  put(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP HEAD handler matching specified URL pattern. */
  head(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP CONNECT handler matching specified URL pattern. */
  connect(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP TRACE handler matching specified URL pattern. */
  trace(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers an HTTP handler matching specified URL pattern on any HTTP method. */
  any(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;

  /** Registers a handler matching specified URL pattern where WebSocket upgrade requests are caught. */
  ws(pattern: RecognizedString, behavior: UWebSocketBehavior): TemplatedApp;

  /** Publishes a message under topic, for all WebSockets under this app. See WebSocket.publish. */
  publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): TemplatedApp;
}
