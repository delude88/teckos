import {config} from 'dotenv';
import * as uWS from 'teckos/uws';
import {UWSProvider} from "teckos";

config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const io = new UWSProvider(uWS.App(), {
  redisUrl: process.env.REDIS_URL,
  pingInterval: 2000
});
io.onConnection((socket) => {
  socket.join("usergroup");

  socket.on('token', (payload: any) => {
    if (payload.token === "mytoken") {
      console.log('Auth successful');
      io.toAll('HELLO', 'New user');

      socket.emit('ready');
    } else {
      console.log('Auth not successful, disconnecting client now');
      socket.disconnect();
    }
  });

  socket.on('no-args', (bla) => {
    console.log("Got 'no-args'");
    console.log("Expect the following to be catched:");
    bla();
  })

  socket.on('hello', (firstName, lastName) => {
    console.log("Got 'hello', broadcasting to all and to group 'usergroup'");
    io.toAll('hello', firstName, lastName);
    io.to('usergroup', 'notification', firstName, lastName);
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
