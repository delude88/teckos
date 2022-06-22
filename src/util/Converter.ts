import { TeckosPacket } from '../types/TeckosPacket.js'

const encodePacket = (packet: TeckosPacket): Buffer => Buffer.from(JSON.stringify(packet))
const decodePacket = (buffer: ArrayBuffer): TeckosPacket => {
    const str = Buffer.from(buffer).toString()
    try {
        return JSON.parse(str) as TeckosPacket
    } catch (error) {
        throw new Error(`Invalid packet format: ${str}`)
    }
}
export { encodePacket, decodePacket }
