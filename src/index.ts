import { ITeckosProvider } from './types/ITeckosProvider'
import { ITeckosSocket } from './types/ITeckosSocket'
import { TeckosPacket } from './types/TeckosPacket'
import { UWSProvider } from './UWSProvider'
import { UWSSocket } from './UWSSocket'
import { TemplatedApp, uws } from './uws'

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
const App: () => TemplatedApp = uws.App

export type { TeckosPacket, ITeckosSocket, ITeckosProvider }
export { UWSSocket, UWSProvider, App }
