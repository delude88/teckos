import { config } from 'dotenv';
import * as uWS from 'uWebSockets.js';
import { UWSProvider } from '../src';

config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const io = new UWSProvider(uWS.App(), process.env.USE_REDIS ? {
  redisUrl: process.env.REDIS_URL,
} : undefined);
io.onConnection((socket) => {
  socket.on('token', (payload) => {
    if (payload.token.length > 5) {
      console.log('Auth successful');
      io.toAll('HELLO', 'New user');

      socket.on('work', (data, fn: (error?: string) => void) => {
        console.log(`Got work to do ${data}`);
        fn('this is the result');
      });

      socket.emit('ready');
    } else {
      socket.disconnect();
    }
  });

  socket.on('disconnect', () => {
    console.log('closed');
  });
});

io.listen(PORT)
  .then(() => console.log(`Listening to port ${PORT}`))
  .catch(() => console.log(`Failed to listen to port ${PORT}`));
