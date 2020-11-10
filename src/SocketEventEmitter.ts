import { EventEmitter } from 'events';

class SocketEventEmitter<T extends string> extends EventEmitter {
  protected _maxListeners: number = 10;

  protected _handlers: {
    [event: string]: ((...args: any[]) => void)[]
  } = {};

  public addListener = (event: T, listener: (...args: any[]) => void): this => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error('Max listeners reached');
    }
    this._handlers[event] = this._handlers[event] || [];
    this._handlers[event].push(listener);
    return this;
  };

  public once = (event: T, listener: (...args: any[]) => void): this => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error('Max listeners reached');
    }
    this._handlers[event] = this._handlers[event] || [];
    const onceWrapper = () => {
      listener();
      this.off(event, onceWrapper);
    };
    this._handlers[event].push(onceWrapper);
    return this;
  };

  public removeListener = (event: T, listener: (...args: any[]) => void): this => {
    if (this._handlers[event]) {
      this._handlers[event] = this._handlers[event].filter((handler) => handler !== listener);
    }
    return this;
  };

  public off = (
    event: T,
    listener: (...args: any[]) => void,
  ): this => this.removeListener(event, listener);

  public removeAllListeners = (event?: T): this => {
    if (event) {
      delete this._handlers[event];
    } else {
      this._handlers = {};
    }
    return this;
  };

  public setMaxListeners = (n: number): this => {
    this._maxListeners = n;
    return this;
  };

  public getMaxListeners = (): number => this._maxListeners;

  public listeners = (event: T): Function[] => {
    if (this._handlers[event]) {
      return [...this._handlers[event]];
    }
    return [];
  };

  public rawListeners = (event: T): Function[] => [...this._handlers[event]];

  public listenerCount = (event: T): number => {
    if (this._handlers[event]) {
      return Object.keys(this._handlers[event]).length;
    }
    return 0;
  };

  public prependListener = (event: T, listener: (...args: any[]) => void): this => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error('Max listeners reached');
    }
    this._handlers[event] = this._handlers[event] || [];
    this._handlers[event].unshift(listener);
    return this;
  };

  public prependOnceListener = (event: T, listener: (...args: any[]) => void): this => {
    if (Object.keys(this._handlers).length === this._maxListeners) {
      throw new Error('Max listeners reached');
    }
    this._handlers[event] = this._handlers[event] || [];
    const onceWrapper = () => {
      listener();
      this.off(event, onceWrapper);
    };
    this._handlers[event].unshift(onceWrapper);
    return this;
  };

  public eventNames = (): (T)[] => (Object.keys(this._handlers) as T[]);

  public on = (
    event: T,
    listener: (...args: any[]) => void,
  ): this => this.addListener(event, listener);

  public emit = (event: T, ...args: any[]): boolean => {
    const listeners = this.listeners(event);
    if (listeners.length > 0) {
      listeners.forEach((listener) => listener(args));
      return true;
    }
    return false;
  };
}

export default SocketEventEmitter;
