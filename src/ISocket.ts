import * as events from 'events';
import SocketEvent from './SocketEvent';

interface ISocket extends events.EventEmitter {
  id: string;

  on(event: SocketEvent, listener: (...args: any[]) => void): this;

  once(event: SocketEvent, listener: (...args: any[]) => void): this;

  off(event: SocketEvent, listener: (...args: any[]) => void): this;

  join(group: string): this;

  leave(group: string): this;

  leaveAll(): this;

  error(message?: string): boolean;

  disconnect(): this;

  getUserData(key: string): any;
}
export default ISocket;
