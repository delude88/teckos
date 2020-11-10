import ISocket from './ISocket';

export type ISocketHandler = (socket: ISocket) => any;

interface IProvider {
  onConnection(handler: ISocketHandler): this;

  toAll(event: string, payload: any): this;

  to(group: string, event: string, payload: any): this;
}

export default IProvider;
