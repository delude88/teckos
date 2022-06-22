import * as events from 'events'
import { WebSocket } from 'uws'
import { TeckosSocketEvent } from './TeckosSocketEvent.js'

export interface ITeckosSocket extends events.EventEmitter {
    id: string

    ws: WebSocket

    addGlobalListener(listener: (event: string, args: any[]) => void): this

    removeGlobalListener(listener: (event: string, args: any[]) => void): this

    on(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    once(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    off(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    join(group: string): this

    leave(group: string): this

    error(message?: string): boolean

    disconnect(): this

    getUserData(key: string): any

    isClosed(): boolean
}
