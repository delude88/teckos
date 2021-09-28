import { WebSocket } from '../uws';
import { SocketEventEmitter } from './SocketEventEmitter';
import { TeckosSocketEvent } from './types/TeckosSocketEvent';
import { ITeckosSocket } from './types/ITeckosSocket';
declare class UWSSocket extends SocketEventEmitter<TeckosSocketEvent> implements ITeckosSocket {
    protected readonly _id: string;
    protected readonly _ws: WebSocket;
    protected _fnId: number;
    protected _acks: Map<number, (...args: any[]) => void>;
    protected _maxListeners: number;
    protected _debug?: boolean;
    _handlers: {
        [event: string]: ((...args: any[]) => void)[];
    };
    get id(): string;
    get ws(): WebSocket;
    constructor(id: string, ws: WebSocket, verbose?: boolean);
    join: (group: string) => this;
    leave: (group: string) => this;
    send: (...args: any[]) => boolean;
    emit: (event: TeckosSocketEvent, ...args: any[]) => boolean;
    private _send;
    private _ack;
    onMessage: (buffer: ArrayBuffer) => void;
    onDisconnect: () => void;
    error: (message?: string | undefined) => boolean;
    disconnect: () => this;
    getUserData: (key: string) => any;
}
export { UWSSocket };
//# sourceMappingURL=UWSSocket.d.ts.map