import * as uWS from 'uWebSockets.js';
import { TemplatedApp } from 'uWebSockets.js';
import * as IORedis from 'ioredis';
import * as crypto from 'crypto';
import * as Console from 'console';
import UWSSocket from './UWSSocket';
import { encodePacket } from './util/Converter';
import { TeckosPacketType } from './types/TeckosPacket';
import { ITeckosSocketHandler } from './types/ITeckosSocketHandler';
import ITeckosProvider from './types/ITeckosProvider';

function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex');
}

class UWSProvider implements ITeckosProvider {
  private _app: TemplatedApp;

  private _verbose: boolean = false;

  private readonly _pub: IORedis.Redis | undefined;

  private readonly _sub: IORedis.Redis | undefined;

  private _connections: {
    [uuid: string]: UWSSocket
  } = {};

  private _handlers: ITeckosSocketHandler[] = [];

  constructor(app: uWS.TemplatedApp, options?: {
    redisUrl?: string,
    verbose?: boolean
  }) {
    this._app = app;
    if (options) {
      if (options.verbose) {
        this._verbose = options.verbose;
      }
      if (options.redisUrl) {
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
        this._sub.on('pmessage', (channel, pattern, message) => this._app.publish(pattern.substr(2), message));
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
        this._connections[id] = new UWSSocket(id, ws, this._verbose);
        this._handlers.forEach((handler) => handler(this._connections[id]));
      },
      message: (ws, buffer) => {
        if (this._connections[ws.id]) {
          this._connections[ws.id].onMessage(buffer);
        } else {
          Console.error(`Got message from unknown connection: ${ws.id}`);
        }
      },
      drain: (ws) => {
        Console.error(`Drain: ${ws.id}`);
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
