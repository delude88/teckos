import {config} from 'dotenv';
import * as uWS from '../lib/uWebSockets';
import {UWSProvider} from "../lib";

config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const io = new UWSProvider(uWS.App(), {
  redisUrl: process.env.REDIS_URL
});
io.onConnection((socket) => {
  socket.join("usergroup");

  socket.on('token', (payload) => {
    if (payload.token === "mytoken") {
      console.log('Auth successful');
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

  socket.on('hello', (name) => {
    console.log("Got 'hello', broadcasting to all and to group 'usergroup'");
    io.toAll('hello', name);
    io.to('usergroup', 'notification', name);
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
