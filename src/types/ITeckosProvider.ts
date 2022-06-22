import { ITeckosSocketHandler } from './ITeckosSocketHandler.js'

export interface ITeckosProvider {
    onConnection(handler: ITeckosSocketHandler): this

    toAll(event: string, payload: any): this

    to(group: string, event: string, payload: any): this

    disconnect(group: string): this
}
