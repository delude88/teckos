import * as events from 'events';
import TeckosSocketEvent from './TeckosSocketEvent';

interface ITeckosSocket extends events.EventEmitter {
  id: string;

  on(event: TeckosSocketEvent, listener: (...args: any[]) => void): this;

  once(event: TeckosSocketEvent, listener: (...args: any[]) => void): this;

  off(event: TeckosSocketEvent, listener: (...args: any[]) => void): this;

  join(group: string): this;

  leave(group: string): this;

  leaveAll(): this;

  error(message?: string): boolean;

  disconnect(): this;

  getUserData(key: string): any;
}
export default ITeckosSocket;
