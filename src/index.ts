import { ITeckosProvider } from './types/ITeckosProvider'
import { ITeckosSocket } from './types/ITeckosSocket'
import { TeckosPacket } from './types/TeckosPacket'
import { UWSProvider } from './UWSProvider'
import { UWSSocket } from './UWSSocket'
import uws from 'uwebsocketsjs'
import {WebSocket, TemplatedApp} from 'uwebsocketsjs'
const App = uws.App
const SSLApp = uws.SSLApp

export type { TeckosPacket, ITeckosSocket, ITeckosProvider, WebSocket, TemplatedApp }
export { UWSSocket, UWSProvider, App, SSLApp }
