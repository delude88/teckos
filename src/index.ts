import { ITeckosProvider } from './types/ITeckosProvider'
import { ITeckosSocket } from './types/ITeckosSocket'
import { TeckosPacket } from './types/TeckosPacket'
import { UWSProvider } from './UWSProvider'
import { UWSSocket } from './UWSSocket'
import uws from './uws'

const App = uws.App

export type { TeckosPacket, ITeckosSocket, ITeckosProvider }
export { UWSSocket, UWSProvider, App }
