/* eslint-disable no-console */
import { WebSocket } from './uws/index'
import { SocketEventEmitter } from './SocketEventEmitter'
import { decodePacket, encodePacket } from './util/Converter'
import { TeckosSocketEvent } from './types/TeckosSocketEvent'
import { TeckosPacket } from './types/TeckosPacket'
import { ITeckosSocket } from './types/ITeckosSocket'
import { ACK, EVENT } from './types/TeckosPacketType'

class UWSSocket extends SocketEventEmitter<TeckosSocketEvent> implements ITeckosSocket {
    protected readonly _id: string

    protected readonly _ws: WebSocket

    protected _fnId = 0

    protected _acks: Map<number, (...args: any[]) => void> = new Map()

    protected _maxListeners = 50

    protected _debug?: boolean

    protected _closed = false

    _handlers: {
        [event: string]: ((...args: any[]) => void)[]
    } = {}

    get id(): string {
        return this._id
    }

    get ws(): WebSocket {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._ws
    }

    constructor(id: string, ws: WebSocket, verbose?: boolean) {
        super()
        this._id = id
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._ws = ws
        this._debug = verbose
    }

    join = (group: string): this => {
        if (this._debug) console.log(`${this._id} joining group ${group}`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        this._ws.subscribe(group)
        return this
    }

    leave = (group: string): this => {
        if (this._debug) console.log(`${this._id} left group ${group}`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        this._ws.unsubscribe(group)
        return this
    }

    send = (...args: any[]): boolean => {
        args.unshift('message')
        return this._send({
            type: EVENT,
            data: args,
        })
    }

    isClosed = (): boolean => {
        return this._closed
    }

    emit = (event: TeckosSocketEvent, ...args: any[]): boolean => {
        args.unshift(event)

        const packet: TeckosPacket = {
            type: EVENT,
            data: args,
        }

        if (typeof args[args.length - 1] === 'function') {
            this._acks.set(this._fnId, args.pop())
            packet.id = this._fnId
            this._fnId += 1
        }
        return this._send(packet)
    }

    private _send = (packet: TeckosPacket): boolean => {
        if (this._debug)
            console.log(`Sending packet to ${this._id}:  ${JSON.stringify(packet.data)}`)
        if (!this._closed) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
            return this._ws.send(encodePacket(packet)) !== 2
        }
        return false
    }

    private _ack = (id: number): ((...args: any[]) => void) => {
        let sent = false
        return (...args: any[]) => {
            if (sent) return

            this._send({
                type: ACK,
                data: args,
                id,
            })

            sent = true
        }
    }

    onMessage = (buffer: ArrayBuffer): void => {
        try {
            const packet = decodePacket(buffer)

            if (this._debug)
                console.log(`Got packet from ${this._id}: ${JSON.stringify(packet.data)}`)

            if (packet.type === EVENT) {
                const event = packet.data[0] as string
                if (this._handlers[event]) {
                    const args = packet.data.slice(1)

                    if (packet.id !== undefined) {
                        // Replace last arg with callback
                        args.push(this._ack(packet.id))
                    }

                    try {
                        this._handlers[event].forEach((handler) => handler(...args))
                    } catch (eventError) {
                        console.error(eventError)
                    }
                }
            } else if (packet.type === ACK && packet.id !== undefined) {
                // Call assigned function
                const ack = this._acks.get(packet.id)
                if (typeof ack === 'function') {
                    ack.apply(this, packet.data)
                    this._acks.delete(packet.id)
                }
            } else {
                console.error(`Unknown packet: ${packet.type}`)
            }
        } catch (messageError) {
            console.error(messageError)
        }
    }

    onDisconnect = (): void => {
        if (this._debug) console.log(`Client ${this._id} disconnected`)
        this._closed = true
        if (this._handlers.disconnect) {
            this._handlers.disconnect.forEach((handler) => handler())
        }
    }

    error = (message?: string): boolean => this.emit('error', message)

    disconnect = (): this => {
        if (this._debug) console.log(`Disconnecting ${this._id}`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        this._ws.close()
        this._closed = true
        return this
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    getUserData = (key: string): any => this._ws[key]
}

export { UWSSocket }
