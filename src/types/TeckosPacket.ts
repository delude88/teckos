export enum TeckosPacketType {
  EVENT,
  ACK,
}

export interface TeckosPacket {
  type: TeckosPacketType,
  data: any[],
  id?: number
}
