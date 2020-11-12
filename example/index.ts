import { config } from 'dotenv';
import * as uWS from 'uWebSockets.js';
import { UWSProvider } from '../src';

config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const io = new UWSProvider(uWS.App(), process.env.USE_REDIS ? {
  redisUrl: process.env.REDIS_URL,
  verbose: true
} : undefined);
io.onConnection((socket) => {
  socket.on('token', (payload) => {
    if (payload.token === "mytoken") {
      console.log('Auth successful');
      socket.join("mygroup");
      io.toAll('HELLO', 'New user');

      socket.emit('ready');
    } else {
      console.log('Auth not successful, disconnecting client now');
      socket.disconnect();
    }
  });

  socket.on('no-args', () => {
    console.log("Got 'no-args'");
  })

  socket.on('hello', () => {
    console.log("Got 'hello'");
    socket.emit("hello");
  })

  socket.on('work', (data, fn: (error?: string) => void) => {
    console.log(`Got work to do ${data}`);
    fn('this is the result');
  });

  socket.on("personal", () => {
    console.log("Got personal request, broadcasting to group 'mygroup'");
    io.to("mygroup", "test", "message");
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

io.listen(PORT)
  .then(() => console.log(`Listening to port ${PORT}`))
  .catch(() => console.log(`Failed to listen to port ${PORT}`));
