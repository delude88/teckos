import { WebSocket } from 'uWebSockets.js';
import * as Console from 'console';
import SocketEventEmitter from './SocketEventEmitter';
import { decodePacket, encodePacket } from './util/Converter';
import TeckosSocketEvent from './types/TeckosSocketEvent';
import { TeckosPacket, TeckosPacketType } from './types/TeckosPacket';
import ITeckosSocket from './types/ITeckosSocket';

class UWSSocket extends SocketEventEmitter<TeckosSocketEvent> implements ITeckosSocket {
  readonly _id: string;

  readonly _ws: WebSocket;

  private _fnId: number = 0;

  private _acks: Map<number, (...args: any[]) => void> = new Map();

  _maxListeners: number = 50;

  _handlers: {
    [event: string]: ((...args: any[]) => void)[]
  } = {};

  get id(): string {
    return this._id;
  }

  constructor(id: string, ws: WebSocket) {
    super();
    this._id = id;
    this._ws = ws;
  }

  join = (group: string): this => {
    this._ws.subscribe(group);
    return this;
  };

  leave = (group: string): this => {
    this._ws.unsubscribe(group);
    return this;
  };

  leaveAll = (): this => {
    this._ws.unsubscribeAll();
    return this;
  };

  send = (...args: any[]): boolean => {
    args.unshift('message');
    return this._send({
      type: TeckosPacketType.EVENT,
      data: args,
    });
  };

  emit = (event: TeckosSocketEvent, ...args: any[]): boolean => {
    args.unshift(event);

    const packet: TeckosPacket = {
      type: TeckosPacketType.EVENT,
      data: args,
    };

    if (typeof args[args.length - 1] === 'function') {
      this._acks.set(this._fnId, args.pop());
      packet.id = this._fnId;
      this._fnId += 1;
    }

    return this._send(packet);
  };

  private _send = (packet: TeckosPacket): boolean => this._ws.send(encodePacket(packet));

  private _ack = (id: number): (...args: any[]) => void => {
    const self = this;
    let sent = false;
    return (...args: any[]) => {
      if (sent) return;

      self._send({
        type: TeckosPacketType.ACK,
        data: args,
        id,
      });

      sent = true;
    };
  };

  onMessage = (buffer: ArrayBuffer) => {
    const packet = decodePacket(buffer);

    if (packet.type === TeckosPacketType.EVENT) {
      const event = packet.data[0];
      if (this._handlers[event]) {
        const args = packet.data.slice(1);

        if (packet.id !== undefined) {
          // Replace last arg with callback
          args.push(this._ack(packet.id));
        }

        this._handlers[event].forEach((handler) => handler(...args));
      }
    } else if (packet.type === TeckosPacketType.ACK
      && packet.id !== undefined) {
      // Call assigned function
      const ack = this._acks.get(packet.id);
      if (typeof ack === 'function') {
        ack.apply(this, packet.data);
        this._acks.delete(packet.id);
      }
    } else {
      Console.error(`Unknown packet: ${packet.type}`);
    }
  };

  onDisconnect = () => {
    if (this._handlers.disconnect) {
      this._handlers.disconnect.forEach((handler) => handler());
    }
  };

  error = (message?: string): boolean => this.emit('error', message);

  disconnect = (): this => {
    this._ws.close();
    return this;
  };

  getUserData = (key: string): any => this._ws[key];
}

export default UWSSocket;
