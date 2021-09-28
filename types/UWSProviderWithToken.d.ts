import { TemplatedApp } from '../uws';
import { TeckosOptions } from './types/TeckosOptions';
import { UWSProvider } from './UWSProvider';
export declare type TokenHandler = (token: string, initialPayload?: any) => Promise<boolean> | boolean;
declare class UWSProviderWithToken extends UWSProvider {
    constructor(app: TemplatedApp, tokenHandler: TokenHandler, options?: TeckosOptions);
}
export { UWSProviderWithToken };
//# sourceMappingURL=UWSProviderWithToken.d.ts.map