const global = require('../../config/global.js');
var util = require('util');
var debug = require('debug')('simple-share');
var io = require('socket.io')(global.websocket.port, { /* options */ });
var middleware = require('socketio-wildcard')();
io.use(middleware);


io.on('error', (err) => {
  util.log(`ERROR ${err}`);
});

io.on('connect', function connection(ws) {  
  util.log(`INFO connection from peer ${ws.id}`);

  ws.on('error', err => {
    debug(err);
  });

    ws.on('*',event => { 
      var name = event.data[0],
          msg  = event.data[1],
          cb   = event.data[2];

      switch (name.substr(0,2)) {
        case global.ENUMERATE_PEERS:
          debug(`${ws.id} retrieves peers`);
          cb(Object.keys(io.sockets.connected).filter(ws_id => ws_id != ws.id));
          break;
        case '/#': //peer id
          if (name in io.sockets.connected) {
            debug(`Message from ${ws.id} to ${name}`);
            io.to(name).emit(ws.id,msg);
            cb(global.OK);
          } else {
            debug(`Can't deliver message from ${ws.id} to ${name}, destination has disconnected`);
            cb(global.DISCONNECTED_PEER);
          }
      }
      // if (peer in io.sockets.connected) {
      //   debug(`Message from ${ws.id} to ${peer}`);
      //   io.to(peer).emit(msg); // need to trunc peer str since '/#' is not comptabilized on client side
      //   fn(global.OK);
      // } else {
      //   debug(`Can't deliver message from ${ws.id} to ${peer}, destination has disconnected`);
      //   fn(global.DISCONNECTED_PEER);
      // }
    });
  // });

  // ws.on('Peer', (id,data,fn) => {
  //   debug(`Receive message from ${ws.id} for ${id}`);
  //   io.in(id).emit(data);
  //   fn('OK');
  // });

  ws.on('disconnect', function () {
    debug(`${ws.id} disconnects`);
  });
});

util.log(`INFO listening to ${global.websocket.port}`);