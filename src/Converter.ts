import { Packet } from './Packet';

const encodePacket = (packet: Packet): Buffer => Buffer.from(JSON.stringify(packet));
const decodePacket = (buffer: ArrayBuffer): Packet => JSON.parse(Buffer.from(buffer).toString());
export {
  encodePacket,
  decodePacket,
};
