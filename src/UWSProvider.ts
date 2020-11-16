import * as IORedis from 'ioredis';
import * as crypto from 'crypto';
import * as Console from 'console';
import debug from 'debug';
import UWSSocket from './UWSSocket';
import { encodePacket } from './util/Converter';
import { TeckosPacketType } from './types/TeckosPacket';
import { ITeckosSocketHandler } from './types/ITeckosSocketHandler';
import ITeckosProvider from './types/ITeckosProvider';
import { TeckosOptions } from './types/TeckosOptions';
import {SHARED_COMPRESSOR, TemplatedApp, WebSocket} from "../lib/uWebSocket";

const d = debug('teckos:provider');

const DEFAULT_OPTION: TeckosOptions = {
  pingInterval: 25000,
  pingTimeout: 5000,
};

function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex');
}

class UWSProvider implements ITeckosProvider {
  private _app: TemplatedApp;

  private readonly _options: TeckosOptions;

  private readonly _pub: IORedis.Redis | undefined;

  private readonly _sub: IORedis.Redis | undefined;

  private _connections: {
    [uuid: string]: UWSSocket
  } = {};

  private _handlers: ITeckosSocketHandler[] = [];

  constructor(app: TemplatedApp, options?: TeckosOptions) {
    this._app = app;
    this._options = {
      redisUrl: options?.redisUrl || undefined,
      pingInterval: options?.pingInterval || DEFAULT_OPTION.pingInterval,
      pingTimeout: options?.pingInterval || DEFAULT_OPTION.pingTimeout,
    };

    const { redisUrl } = this._options;
    if (redisUrl) {
      d(`Using REDIS at ${this._options.redisUrl}`);
      this._pub = new IORedis(redisUrl);
      this._sub = new IORedis(redisUrl);

      this._sub.subscribe('a', (err) => {
        if (err) {
          Console.error(err.message);
        }
      });
      // Since we are only subscribing to a,
      // no further checks are necessary (trusting ioredis here)
      this._sub.on('message', (channel, message) => this._app.publish(channel.substr(2), message));

      this._sub.psubscribe('g.*', (err) => {
        if (err) {
          Console.error(err.message);
        }
      });
      // Since we are only p-subscribing to g.*,
      // no further checks are necessary (trusting ioredis here)
      this._sub.on('pmessage', (channel, pattern, message) => {
        const group = pattern.substr(2);
        d(`Publishing message from REDIS to group ${group}`);
        this._app.publish(group, message);
      });
    }
    this._app.ws('/*', {
      /* Options */
      compression: SHARED_COMPRESSOR,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 0,
      maxBackpressure: 1024,

      open: (ws: WebSocket) => {
        const id: string = generateUUID();
        /* Let this client listen to all sensor topics */

        // Subscribe to all
        ws.subscribe('a');

        // eslint-disable-next-line no-param-reassign
        ws.id = id;
        // eslint-disable-next-line no-param-reassign
        ws.alive = true;
        this._connections[id] = new UWSSocket(id, ws);
        try {
          this._handlers.forEach((handler) => handler(this._connections[id]));
        } catch (handlerError) {
          console.error(handlerError);
        }
      },
      pong: (ws) => {
        d(`Got pong from ${ws.id}`);
        // eslint-disable-next-line no-param-reassign
        ws.alive = true;
      },
      message: (ws, buffer) => {
        if (this._connections[ws.id]) {
          this._connections[ws.id].onMessage(buffer);
        } else {
          Console.error(`Got message from unknown connection: ${ws.id}`);
        }
      },
      drain: (ws) => {
        d(`Drain: ${ws.id}`);
      },
      close: (ws) => {
        if (this._connections[ws.id]) {
          this._connections[ws.id].onDisconnect();
          delete this._connections[ws.id];
        }
      },
    });

    // Add ping
    this._keepAliveSockets();
  }

  private _keepAliveSockets = () => {
    setTimeout((connections: {
      [uuid: string]: UWSSocket
    }) => {
      d('Ping clients');
      Object.keys(connections).forEach((uuid) => {
        if (this._connections[uuid].ws.alive) {
          this._connections[uuid].ws.alive = false;
          this._connections[uuid].ws.ping();
        } else {
          // Terminate connection
          d(`Ping pong timeout for ${uuid}`);
          this._connections[uuid].disconnect();
        }
      });
      this._keepAliveSockets();
    }, this._options.pingInterval, this._connections);
  };

  onConnection = (handler: ITeckosSocketHandler): this => {
    this._handlers.push(handler);
    return this;
  };

  toAll = (event: string, ...args: any[]): this => {
    args.unshift(event);
    const buffer = encodePacket({
      type: TeckosPacketType.EVENT,
      data: args,
    });
    if (this._pub) {
      this._pub.publishBuffer('a', buffer);
    } else {
      d(`Publishing event ${event} to group a`);
      this._app.publish('a', buffer);
    }
    return this;
  };

  to = (group: string, event: string, ...args: any[]): this => {
    args.unshift(event);
    const buffer = encodePacket({
      type: TeckosPacketType.EVENT,
      data: args,
    });
    if (this._pub) {
      this._pub.publishBuffer(`g.${group}`, buffer);
    } else {
      d(`Publishing event ${event} to group ${group}`);
      this._app.publish(group, buffer);
    }
    return this;
  };

  listen = (port: number): Promise<any> => new Promise((resolve, reject) => {
    this._app.listen(port, (socket) => {
      if (socket) {
        return resolve(this);
      }
      return reject(new Error(`Could not listen on port ${port}`));
    });
  });
}

export default UWSProvider;
