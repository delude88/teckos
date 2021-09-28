import * as events from 'events'
import { TeckosSocketEvent } from './TeckosSocketEvent'
import { WebSocket } from '../../uws'

export interface ITeckosSocket extends events.EventEmitter {
    id(): string

    ws(): WebSocket

    on(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    once(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    off(event: TeckosSocketEvent, listener: (...args: any[]) => void): this

    join(group: string): this

    leave(group: string): this

    error(message?: string): boolean

    disconnect(): this

    getUserData(key: string): any
}
