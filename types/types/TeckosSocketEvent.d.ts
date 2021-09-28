export interface BaseTeckosSocketEvent {
    reconnect: 'reconnect';
    disconnect: 'disconnect';
}
export declare type TeckosSocketEvent = BaseTeckosSocketEvent[keyof BaseTeckosSocketEvent] | string;
//# sourceMappingURL=TeckosSocketEvent.d.ts.map