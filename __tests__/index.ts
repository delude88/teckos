import { expect } from 'chai'
import 'mocha'
import { TeckosClientWithJWT } from 'teckos-client'
import { UWSProvider } from './UWSProvider'
import uws from './uws'

const PORT = 3000

describe('Example connection using JWT', () => {
    // Create server and client
    const token = 'validtoken123'
    const app = uws.App()
    const server = new UWSProvider(app)
    const client = new TeckosClientWithJWT(
        `localhost:${PORT}`,
        {
            reconnection: false,
        },
        token,
        {
            say: 'hello',
        }
    )

    it('Server can be started', () => expect(server.listen(3000)).not.to.throw())

    client.connect()
})
