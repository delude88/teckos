interface BaseTeckosSocketEvent {
    reconnect: 'reconnect'
    disconnect: 'disconnect'
}

type TeckosSocketEvent = BaseTeckosSocketEvent[keyof BaseTeckosSocketEvent] | string

export type { TeckosSocketEvent }
