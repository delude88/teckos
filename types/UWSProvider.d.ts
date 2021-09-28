import { TemplatedApp } from '../uws';
import { ITeckosSocketHandler } from './types/ITeckosSocketHandler';
import { ITeckosProvider } from './types/ITeckosProvider';
import { TeckosOptions } from './types/TeckosOptions';
declare class UWSProvider implements ITeckosProvider {
    private _app;
    private readonly _options;
    private readonly _pub;
    private readonly _sub;
    private _connections;
    private _handlers;
    constructor(app: TemplatedApp, options?: TeckosOptions);
    private _keepAliveSockets;
    onConnection: (handler: ITeckosSocketHandler) => this;
    toAll: (event: string, ...args: any[]) => this;
    to: (group: string, event: string, ...args: any[]) => this;
    listen: (port: number) => Promise<any>;
}
export { UWSProvider };
//# sourceMappingURL=UWSProvider.d.ts.map