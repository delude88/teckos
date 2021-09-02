import debug from 'debug'
import * as uWs from '../uws'
import { SocketEventEmitter } from './SocketEventEmitter'
import { decodePacket, encodePacket } from './util/Converter'
import { TeckosSocketEvent } from './types/TeckosSocketEvent'
import { TeckosPacket, TeckosPacketType } from './types/TeckosPacket'
import { ITeckosSocket } from './types/ITeckosSocket'

const d = debug('teckos:socket')
const error = d.extend('error')

class UWSSocket extends SocketEventEmitter<TeckosSocketEvent> implements ITeckosSocket {
    protected readonly _id: string

    protected readonly _ws: uWs.WebSocket

    protected _fnId = 0

    protected _acks: Map<number, (...args: any[]) => void> = new Map()

    protected _maxListeners = 50

    protected _debug?: boolean

    _handlers: {
        [event: string]: ((...args: any[]) => void)[]
    } = {}

    get id(): string {
        return this._id
    }

    get ws(): uWs.WebSocket {
        return this._ws
    }

    constructor(id: string, ws: uWs.WebSocket, verbose?: boolean) {
        super()
        this._id = id
        this._ws = ws
        this._debug = verbose
    }

    join = (group: string): this => {
        if (this._debug) d(`${this._id} joining group ${group}`)
        this._ws.subscribe(group)
        return this
    }

    leave = (group: string): this => {
        if (this._debug) d(`${this._id} left group ${group}`)
        this._ws.unsubscribe(group)
        return this
    }

    send = (...args: any[]): boolean => {
        args.unshift('message')
        return this._send({
            type: TeckosPacketType.EVENT,
            data: args,
        })
    }

    emit = (event: TeckosSocketEvent, ...args: any[]): boolean => {
        args.unshift(event)

        const packet: TeckosPacket = {
            type: TeckosPacketType.EVENT,
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
        if (this._debug) d(`Sending packet to ${this._id}:  ${JSON.stringify(packet.data)}`)
        return this._ws.send(encodePacket(packet))
    }

    private _ack = (id: number): ((...args: any[]) => void) => {
        let sent = false
        return (...args: any[]) => {
            if (sent) return

            this._send({
                type: TeckosPacketType.ACK,
                data: args,
                id,
            })

            sent = true
        }
    }

    onMessage = (buffer: ArrayBuffer): void => {
        try {
            const packet = decodePacket(buffer)

            if (this._debug) d(`Got packet from ${this._id}: ${JSON.stringify(packet.data)}`)

            if (packet.type === TeckosPacketType.EVENT) {
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
                        error(eventError)
                    }
                }
            } else if (packet.type === TeckosPacketType.ACK && packet.id !== undefined) {
                // Call assigned function
                const ack = this._acks.get(packet.id)
                if (typeof ack === 'function') {
                    ack.apply(this, packet.data)
                    this._acks.delete(packet.id)
                }
            } else {
                error(`Unknown packet: ${packet.type}`)
            }
        } catch (messageError) {
            error(messageError)
        }
    }

    onDisconnect = (): void => {
        if (this._debug) d(`Client ${this._id} disconnected`)
        if (this._handlers.disconnect) {
            this._handlers.disconnect.forEach((handler) => handler())
        }
    }

    error = (message?: string): boolean => this.emit('error', message)

    disconnect = (): this => {
        if (this._debug) d(`Disconnecting ${this._id}`)
        this._ws.close()
        return this
    }

    getUserData = (key: string): any => this._ws[key]
}

export { UWSSocket }
