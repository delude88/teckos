import IORedis from 'ioredis'
import * as crypto from 'crypto'
import debug from 'debug'
import * as uWs from '../uws'
import { UWSSocket } from './UWSSocket'
import { encodePacket } from './util/Converter'
import { TeckosPacketType } from './types/TeckosPacket'
import { ITeckosSocketHandler } from './types/ITeckosSocketHandler'
import { ITeckosProvider } from './types/ITeckosProvider'
import { TeckosOptions } from './types/TeckosOptions'

const d = debug('teckos:provider')
const verbose = d.extend('trace')
const error = d.extend('error')

const DEFAULT_OPTION: TeckosOptions = {
    pingInterval: 25000,
    pingTimeout: 5000,
}

function generateUUID(): string {
    return crypto.randomBytes(16).toString('hex')
}

class UWSProvider implements ITeckosProvider {
    private _app: uWs.TemplatedApp

    private readonly _options: TeckosOptions

    private readonly _pub: IORedis.Redis | undefined

    private readonly _sub: IORedis.Redis | undefined

    private _connections: {
        [uuid: string]: UWSSocket
    } = {}

    private _handlers: ITeckosSocketHandler[] = []

    constructor(app: uWs.TemplatedApp, options?: TeckosOptions) {
        this._app = app
        this._options = {
            redisUrl: options?.redisUrl || undefined,
            pingInterval: options?.pingInterval || DEFAULT_OPTION.pingInterval,
            pingTimeout: options?.pingInterval || DEFAULT_OPTION.pingTimeout,
            debug: options?.debug,
        }

        const { redisUrl } = this._options
        if (redisUrl) {
            d(`Using REDIS at ${redisUrl}`)
            this._pub = new IORedis(redisUrl)
            this._sub = new IORedis(redisUrl)

            this._sub.subscribe('a', (err) => {
                if (err) {
                    error(err.message)
                }
            })
            // Since we are only subscribing to a,
            // no further checks are necessary (trusting ioredis here)
            this._sub.on('message', (channel: string, message: Buffer | string) =>
                this._app.publish(channel.substr(2), message)
            )

            this._sub.psubscribe('g.*', (err) => {
                if (err) {
                    error(err.message)
                }
            })
            // Since we are only p-subscribing to g.*,
            // no further checks are necessary (trusting ioredis here)
            this._sub.on('pmessage', (_channel, pattern: string, message: Buffer | string) => {
                const group = pattern.substr(2)
                if (this._options.debug) verbose(`Publishing message from REDIS to group ${group}`)
                this._app.publish(group, message)
            })
        }
        this._app.ws('/*', {
            /* Options */
            compression: uWs.SHARED_COMPRESSOR,
            maxPayloadLength: 16 * 1024 * 1024,
            idleTimeout: 0,
            maxBackpressure: 1024,

            open: (ws: uWs.WebSocket) => {
                const id: string = generateUUID()
                /* Let this client listen to all sensor topics */

                // Subscribe to all
                ws.subscribe('a')

                // eslint-disable-next-line no-param-reassign
                ws.id = id
                // eslint-disable-next-line no-param-reassign
                ws.alive = true
                this._connections[id] = new UWSSocket(id, ws, options?.debug)
                try {
                    this._handlers.forEach((handler) => {
                        handler(this._connections[id])
                    })
                } catch (handlerError) {
                    error(handlerError)
                }
            },
            pong: (ws) => {
                // eslint-disable-next-line no-param-reassign
                ws.alive = true
            },
            message: (ws: uWs.WebSocket, buffer: ArrayBuffer) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const id = ws.id as string
                if (this._connections[id]) {
                    this._connections[id].onMessage(buffer)
                } else {
                    error(`Got message from unknown connection: ${id}`)
                }
            },
            drain: (ws: uWs.WebSocket) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const id = ws.id as string
                if (options?.debug) verbose(`Drain: ${id}`)
            },
            close: (ws: uWs.WebSocket) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const id = ws.id as string
                if (this._connections[id]) {
                    if (this._options.debug) {
                        verbose(`Client ${id} disconnected, removing from registry`)
                    }
                    this._connections[id].onDisconnect()
                    delete this._connections[id]
                }
            },
        })

        // Add ping
        this._keepAliveSockets()
    }

    private _keepAliveSockets = () => {
        setTimeout(
            (connections: { [uuid: string]: UWSSocket }) => {
                Object.keys(connections).forEach((uuid) => {
                    if (this._connections[uuid].ws.alive) {
                        this._connections[uuid].ws.alive = false
                        this._connections[uuid].ws.ping('hey')
                    } else {
                        // Terminate connection
                        if (this._options.debug)
                            verbose(`Ping pong timeout for ${uuid}, disconnecting client...`)
                        this._connections[uuid].disconnect()
                    }
                })
                this._keepAliveSockets()
            },
            this._options.pingInterval,
            this._connections
        )
    }

    onConnection = (handler: ITeckosSocketHandler): this => {
        this._handlers.push(handler)
        return this
    }

    toAll = (event: string, ...args: any[]): this => {
        args.unshift(event)
        const buffer = encodePacket({
            type: TeckosPacketType.EVENT,
            data: args,
        })
        if (this._pub) {
            this._pub.publishBuffer('a', buffer).catch((err) => error(err))
        } else {
            if (this._options.debug) verbose(`Publishing event ${event} to group a`)
            this._app.publish('a', buffer)
        }
        return this
    }

    to = (group: string, event: string, ...args: any[]): this => {
        args.unshift(event)
        const buffer = encodePacket({
            type: TeckosPacketType.EVENT,
            data: args,
        })
        if (this._pub) {
            this._pub.publishBuffer(`g.${group}`, buffer).catch((err) => error(err))
        } else {
            if (this._options.debug) verbose(`Publishing event ${event} to group ${group}`)
            this._app.publish(group, buffer)
        }
        return this
    }

    listen = (port: number): Promise<any> =>
        new Promise((resolve, reject) => {
            this._app.listen(port, (socket) => {
                if (socket) {
                    return resolve(this)
                }
                return reject(new Error(`Could not listen on port ${port}`))
            })
        })
}

export { UWSProvider }
