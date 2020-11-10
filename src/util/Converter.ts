import { TeckosPacket } from '../types/TeckosPacket';

const encodePacket = (packet: TeckosPacket): Buffer => Buffer.from(JSON.stringify(packet));
const decodePacket = (buffer: ArrayBuffer): TeckosPacket => JSON.parse(
  Buffer.from(buffer).toString(),
);
export {
  encodePacket,
  decodePacket,
};
