import 'mocha'
import {expect} from 'chai'
import {ITeckosClient, TeckosClientWithJWT} from 'teckos-client'
import {UWSProvider, App} from '../src'

const PORT = 3000


describe('Example connection using JWT', () => {
    const token = 'validtoken123'
    let server: UWSProvider
    let client: ITeckosClient

    before((done) => {
        // Create server and client
        const app = App()
        server = new UWSProvider(app)
        client = new TeckosClientWithJWT(
            `ws://localhost:${PORT}`,
            {
                reconnection: false,
            },
            token,
            {
                say: 'hello',
            }
        )
        done()
    })

    after((done) => {
        if (client && client.connected) {
            client.disconnect()
        }
        done()
    })

    it('Server can be started', (done) => {
        server.listen(3000)
        done()
    })

    it('Client can connect', (done) => {
        client.on("connect", () => {
            client.disconnect()
            done()
        })
        client.connect()
    })


    it('Client can send messages', (done) => {
        server.onConnection(socket => {
            console.info("Client connected")
            socket.on("hi", () => {
                console.info("Saying hello")
                socket.emit("hello")
            })
        })
        client.on("hello", () => {
            console.info("Test successfull")
            done()
        })
        expect(client.connected).to.be.false
        client.connect()
        client.emit("hi")
    })

    it('Example connection', (done) => {
        let gotRespond = false
        let gotCallbackAnswered = false
        let serverEmittedDisconnect = false
        let clientEmittedDisconnect = false
        server.onConnection(socket => {
            socket.on("hi", () => socket.emit("hello"))
            socket.on("asking", (callback: (result: string) => void) => {
                callback("answer")
            })
            socket.on("disconnect", () => {
                serverEmittedDisconnect = true
            })
        })

        client.on("hello", () => {
            gotRespond = true
        })
        client.emit("hi")

        client.emit("asking", ((result) => {
            gotCallbackAnswered = true
            expect(result).to.be.equal("answer")
        }))

        client.on("disconnect", () => {
            clientEmittedDisconnect = true
        })

        client.connect()
        client.disconnect()

        setTimeout(() => {
            expect(gotRespond).to.be.true
            expect(gotCallbackAnswered).to.be.true
            expect(clientEmittedDisconnect).to.be.true
            expect(serverEmittedDisconnect).to.be.true
            done()
        }, 100)
    })

})
