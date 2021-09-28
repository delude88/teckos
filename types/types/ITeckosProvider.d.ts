import { ITeckosSocketHandler } from './ITeckosSocketHandler';
export interface ITeckosProvider {
    onConnection(handler: ITeckosSocketHandler): this;
    toAll(event: string, payload: any): this;
    to(group: string, event: string, payload: any): this;
}
//# sourceMappingURL=ITeckosProvider.d.ts.map