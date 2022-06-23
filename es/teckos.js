import Redis from 'ioredis';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { createRequire } from 'node:module';

/**
 * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
 *
 * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
 * during build.
 * @param {number} code
 */
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or ` + 'use the non-minified dev environment for full errors. ';
} // eslint-disable-next-line import/no-default-export

class SocketEventEmitter extends EventEmitter {
  _maxListeners = 10;
  _handlers = {};
  _globalHandlers = [];
  addListener = (event, listener) => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : 'Max listeners reached');
    }

    this._handlers[event] = this._handlers[event] || [];

    this._handlers[event].push(listener);

    return this;
  };
  addGlobalListener = listener => {
    this._globalHandlers.push(listener);

    return this;
  };
  removeGlobalListener = listener => {
    this._globalHandlers = this._globalHandlers.filter(curr => curr === listener);
    return this;
  };
  once = (event, listener) => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : 'Max listeners reached');
    }

    this._handlers[event] = this._handlers[event] || [];

    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };

    this._handlers[event].push(onceWrapper);

    return this;
  };
  removeListener = (event, listener) => {
    if (this._handlers[event]) {
      this._handlers[event] = this._handlers[event].filter(handler => handler !== listener);
    }

    return this;
  };
  off = (event, listener) => this.removeListener(event, listener);
  removeAllListeners = event => {
    if (event) {
      delete this._handlers[event];
    } else {
      this._handlers = {};
      this._globalHandlers = [];
    }

    return this;
  };
  setMaxListeners = n => {
    this._maxListeners = n;
    return this;
  };
  getMaxListeners = () => this._maxListeners;
  listeners = event => {
    if (this._handlers[event]) {
      return [...this._handlers[event]];
    }

    return [];
  };
  rawListeners = event => [...this._handlers[event]];
  listenerCount = event => {
    if (this._handlers[event]) {
      return Object.keys(this._handlers[event]).length;
    }

    return 0;
  };
  prependListener = (event, listener) => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : 'Max listeners reached');
    }

    this._handlers[event] = this._handlers[event] || [];

    this._handlers[event].unshift(listener);

    return this;
  };
  prependOnceListener = (event, listener) => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : 'Max listeners reached');
    }

    this._handlers[event] = this._handlers[event] || [];

    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };

    this._handlers[event].unshift(onceWrapper);

    return this;
  };
  eventNames = () => Object.keys(this._handlers);
  on = (event, listener) => this.addListener(event, listener);
  emit = (event, ...args) => {
    const listeners = this.listeners(event);

    if (listeners.length > 0) {
      listeners.forEach(listener => listener(args));
      return true;
    }

    this._globalHandlers.forEach(listener => listener(event, args));

    return false;
  };
}

const encodePacket = packet => Buffer.from(JSON.stringify(packet));

const decodePacket = buffer => {
  const str = Buffer.from(buffer).toString();

  try {
    return JSON.parse(str);
  } catch (error) {
    throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(2) : `Invalid packet format: ${str}`);
  }
};

const EVENT = 0;
const ACK = 1;

class UWSSocket extends SocketEventEmitter {
  _id;
  _ws;
  _fnId = 0;
  _acks = new Map();
  _maxListeners = 50;
  _debug;
  _closed = false;
  _handlers = {};

  get id() {
    return this._id;
  }

  get ws() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._ws;
  }

  constructor(id, ws, verbose) {
    super();
    this._id = id; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

    this._ws = ws;
    this._debug = verbose;
  }

  join = group => {
    if (this._debug) console.log(`${this._id} joining group ${group}`); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call

    this._ws.subscribe(group);

    return this;
  };
  leave = group => {
    if (this._debug) console.log(`${this._id} left group ${group}`); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call

    this._ws.unsubscribe(group);

    return this;
  };
  send = (...args) => {
    args.unshift('message');
    return this._send({
      type: EVENT,
      data: args
    });
  };
  isClosed = () => {
    return this._closed;
  };
  emit = (event, ...args) => {
    args.unshift(event);
    const packet = {
      type: EVENT,
      data: args
    };

    if (typeof args[args.length - 1] === 'function') {
      this._acks.set(this._fnId, args.pop());

      packet.id = this._fnId;
      this._fnId += 1;
    }

    return this._send(packet);
  };
  _send = packet => {
    if (this._debug) console.log(`Sending packet to ${this._id}:  ${JSON.stringify(packet.data)}`);

    if (!this._closed) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      return this._ws.send(encodePacket(packet)) !== 2;
    }

    return false;
  };
  _ack = id => {
    let sent = false;
    return (...args) => {
      if (sent) return;

      this._send({
        type: ACK,
        data: args,
        id
      });

      sent = true;
    };
  };
  onMessage = buffer => {
    try {
      const packet = decodePacket(buffer);
      if (this._debug) console.log(`Got packet from ${this._id}: ${JSON.stringify(packet.data)}`);

      if (packet.type === EVENT) {
        const event = packet.data[0];

        if (this._handlers[event]) {
          const args = packet.data.slice(1);

          if (packet.id !== undefined) {
            // Replace last arg with callback
            args.push(this._ack(packet.id));
          }

          try {
            this._handlers[event].forEach(handler => handler(...args));
          } catch (eventError) {
            console.error(eventError);
          }
        }
      } else if (packet.type === ACK && packet.id !== undefined) {
        // Call assigned function
        const ack = this._acks.get(packet.id);

        if (typeof ack === 'function') {
          ack.apply(this, packet.data);

          this._acks.delete(packet.id);
        }
      } else {
        console.error(`Unknown packet: ${packet.type}`);
      }
    } catch (messageError) {
      console.error(messageError);
    }
  };
  onDisconnect = () => {
    if (this._debug) console.log(`Client ${this._id} disconnected`);
    this._closed = true;

    if (this._handlers.disconnect) {
      this._handlers.disconnect.forEach(handler => handler());
    }
  };
  error = message => this.emit('error', message);
  disconnect = () => {
    if (this._debug) console.log(`Disconnecting ${this._id}`); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call

    this._ws.close();

    this._closed = true;
    return this;
  }; // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return

  getUserData = key => this._ws[key];
}

const requireModule = createRequire(import.meta.url);
var ListenOptions;

(function (ListenOptions) {
  ListenOptions[ListenOptions["LIBUS_LISTEN_DEFAULT"] = 0] = "LIBUS_LISTEN_DEFAULT";
  ListenOptions[ListenOptions["LIBUS_LISTEN_EXCLUSIVE_PORT"] = 1] = "LIBUS_LISTEN_EXCLUSIVE_PORT";
})(ListenOptions || (ListenOptions = {}));

const uws = (() => {
  try {
    const p = `../bin/uws_${process.platform}_${process.arch}_${process.versions.modules}.node`;
    return requireModule(p);
  } catch (e) {
    throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(0) : `This version of uWS.js supports only Node.js 14, 16 and 18 on (glibc) Linux, macOS and Windows, on Tier 1 platforms (https://github.com/nodejs/node/blob/master/BUILDING.md#platform-list).\n\n${e.toString()}`);
  }
})();

/* eslint-disable no-console */
const DEFAULT_OPTION = {
  pingInterval: 25000,
  pingTimeout: 5000
};

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

class UWSProvider {
  _app;
  _options;
  _pub;
  _sub;
  _connections = {}; // private _handlers: ITeckosSocketHandler[] = []

  _handler;

  constructor(app, options) {
    this._app = app;
    this._options = {
      redisUrl: options?.redisUrl || undefined,
      pingInterval: options?.pingInterval || DEFAULT_OPTION.pingInterval,
      pingTimeout: options?.pingInterval || DEFAULT_OPTION.pingTimeout,
      debug: options?.debug
    };
    const {
      redisUrl
    } = this._options;

    if (redisUrl) {
      if (this._options.debug) console.log(`Using REDIS at ${redisUrl}`); // eslint-disable-next-line new-cap

      this._pub = new Redis(redisUrl); // eslint-disable-next-line new-cap

      this._sub = new Redis(redisUrl); // All publishing
      // eslint-disable-next-line @typescript-eslint/no-floating-promises

      this._sub.subscribe('a', err => err && console.error(err.message)); // Since we are only subscribing to a,
      // no further checks are necessary (trusting ioredis here)


      this._sub.on('messageBuffer', (_channel, buffer) => {
        // Should only be a, so ...
        if (this._options.debug) {
          console.log(`Publishing message from REDIS to all`);
        }

        this._app.publish('a', buffer);
      }); // Group publishing
      // eslint-disable-next-line @typescript-eslint/no-floating-promises


      this._sub.psubscribe('g.*', 'd.*', err => err && console.error(err.message)); // Since we are only p-subscribing to g.* and d.*,
      // no further checks are necessary (trusting ioredis here)


      this._sub.on('pmessageBuffer', (_pattern, channelBuffer, message) => {
        const channel = channelBuffer.toString();
        const action = channel.charAt(0);
        const group = channel.substring(2);

        if (action === 'd') {
          if (this._options.debug) {
            console.log(`Disconnecting everybody in group ${group} due to message from REDIS`);
          }

          this._disconnectGroup(group);
        } else if (action === 'g') {
          if (this._options.debug) {
            console.log(`Publishing message from REDIS to group ${group}`);
          }

          this._app.publish(group, message);
        }
      });
    }

    this._app.ws('/*', {
      /* Options */
      compression: uws.SHARED_DECOMPRESSOR,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 0,
      maxBackpressure: 1024,
      open: ws => {
        const id = generateUUID();
        /* Let this client listen to all sensor topics */
        // Subscribe to all

        ws.subscribe('a'); // eslint-disable-next-line no-param-reassign

        ws.id = id; // eslint-disable-next-line no-param-reassign

        ws.alive = true;
        this._connections[id] = new UWSSocket(id, ws, options?.debug);

        if (this._handler) {
          try {
            this._handler(this._connections[id]);
          } catch (handlerError) {
            // eslint-disable-next-line no-console
            console.error(handlerError);
          }
        }
      },
      pong: ws => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
        ws.alive = true;
      },
      message: (ws, buffer) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = ws.id;

        if (this._connections[id]) {
          this._connections[id].onMessage(buffer);
        } else {
          console.error(`Got message from unknown connection: ${id}`);
        }
      },
      drain: ws => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = ws.id;
        if (options?.debug) console.log(`Drain: ${id}`);
      },
      close: ws => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = ws.id;

        if (this._connections[id]) {
          if (this._options.debug) {
            console.log(`Client ${id} disconnected, removing from registry`);
          }

          this._connections[id].onDisconnect();

          delete this._connections[id];
        }
      }
    }); // Add ping


    this._keepAliveSockets();
  }

  _keepAliveSockets = () => {
    setTimeout(connections => {
      Object.keys(connections).forEach(uuid => {
        const {
          ws
        } = this._connections[uuid];

        if (ws.alive) {
          ws.alive = false;
          ws.ping('hey');
        } else {
          // Terminate connection
          if (this._options.debug) {
            console.log(`Ping pong timeout for ${uuid}, disconnecting client...`);
          }

          this._connections[uuid].disconnect();
        }
      });

      this._keepAliveSockets();
    }, this._options.pingInterval, this._connections);
  };
  _disconnectGroup = group => {
    const connections = Object.values(this._connections);
    connections.forEach(connection => {
      if (connection.ws.isSubscribed(group)) {
        connection.disconnect();
      }
    });
  };
  onConnection = handler => {
    this._handler = handler;
    return this;
  };
  toAll = (event, ...args) => {
    args.unshift(event);
    const buffer = encodePacket({
      type: EVENT,
      data: args
    });

    if (this._pub) {
      this._pub.publish('a', buffer).catch(err => console.error(err));
    } else {
      if (this._options.debug) console.log(`Publishing event ${event} to all`);

      this._app.publish('a', buffer);
    }

    return this;
  };
  to = (group, event, ...args) => {
    args.unshift(event);
    const buffer = encodePacket({
      type: EVENT,
      data: args
    });

    if (this._pub) {
      this._pub.publish(`g.${group}`, buffer).catch(err => console.error(err));
    } else {
      if (this._options.debug) console.log(`Publishing event ${event} to group ${group}`);

      this._app.publish(group, buffer);
    }

    return this;
  };

  disconnect(group) {
    if (this._pub) {
      this._pub.publish(`d.${group}`, '').catch(err => console.error(err));
    } else {
      if (this._options.debug) console.log(`Disconnecting whole group ${group}`);

      this._disconnectGroup(group);
    }

    return this;
  }

  listen = port => new Promise((resolve, reject) => {
    this._app.listen(port, socket => {
      if (socket) {
        return resolve(this);
      }

      return reject(new Error(`Could not listen on port ${port}`));
    });
  });
}

/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class UWSProviderWithToken extends UWSProvider {
  constructor(app, tokenHandler, options) {
    super(app, options);
    this.onConnection(socket => {
      socket.once('token', ({
        token,
        ...others
      }) => {
        if (token && typeof token === 'string') {
          Promise.resolve(tokenHandler(token, others)).then(result => {
            if (result) {
              return socket.emit('ready');
            }

            return socket.disconnect();
          }).catch(() => socket.disconnect());
          return undefined;
        }

        return socket.disconnect();
      });
    });
  }

}

export { ListenOptions, UWSProvider, UWSProviderWithToken, UWSSocket, uws };
