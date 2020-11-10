export enum PacketType {
  EVENT,
  ACK,
}

export interface Packet {
  type: PacketType,
  data: any[],
  id?: number
}
