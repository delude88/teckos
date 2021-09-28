/// <reference types="node" />
import { TeckosPacket } from '../types/TeckosPacket';
declare const encodePacket: (packet: TeckosPacket) => Buffer;
declare const decodePacket: (buffer: ArrayBuffer) => TeckosPacket;
export { encodePacket, decodePacket };
//# sourceMappingURL=Converter.d.ts.map