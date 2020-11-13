import * as IORedis from 'ioredis';
import * as crypto from 'crypto';
import * as Console from 'console';
import debug from 'debug';
import * as uWS from 'uWebSockets.js';
import UWSSocket from './UWSSocket';
import { encodePacket } from './util/Converter';
import { TeckosPacketType } from './types/TeckosPacket';
import { ITeckosSocketHandler } from './types/ITeckosSocketHandler';
import ITeckosProvider from './types/ITeckosProvider';

const d = debug('teckos:provider');

function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex');
}

class UWSProvider implements ITeckosProvider {
  private _app: uWS.TemplatedApp;

  private readonly _pub: IORedis.Redis | undefined;

  private readonly _sub: IORedis.Redis | undefined;

  private _connections: {
    [uuid: string]: UWSSocket
  } = {};

  private _handlers: ITeckosSocketHandler[] = [];

  constructor(app: uWS.TemplatedApp, options?: {
    redisUrl?: string
  }) {
    this._app = app;
    if (options) {
      if (options.redisUrl) {
        d(`Using REDIS at ${options.redisUrl}`);
        const { redisUrl } = options;
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
    }
    this._app.ws('/*', {
      /* Options */
      compression: uWS.SHARED_COMPRESSOR,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 0,
      maxBackpressure: 1024,

      open: (ws) => {
        const id: string = generateUUID();
        /* Let this client listen to all sensor topics */

        // Subscribe to all
        ws.subscribe('a');

        // eslint-disable-next-line no-param-reassign
        ws.id = id;
        this._connections[id] = new UWSSocket(id, ws);
        try {
          this._handlers.forEach((handler) => handler(this._connections[id]));
        } catch (handlerError) {
          console.error(handlerError);
        }
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
  }

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
