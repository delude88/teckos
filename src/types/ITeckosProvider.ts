import { ITeckosSocketHandler } from './ITeckosSocketHandler'

interface ITeckosProvider {
    onConnection(handler: ITeckosSocketHandler): this

    toAll(event: string, payload: any): this

    to(group: string, event: string, payload: any): this
}

export default ITeckosProvider
