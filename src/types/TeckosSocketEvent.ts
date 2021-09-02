export interface BaseTeckosSocketEvent {
    reconnect: 'reconnect'
    disconnect: 'disconnect'
}

export type TeckosSocketEvent = BaseTeckosSocketEvent[keyof BaseTeckosSocketEvent] | string
