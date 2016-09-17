config = require('../../config/global.js')
var util = require('util');
var debug = require('debug')('simple-share');
var ws = require('ws');

var WebSocketServer = ws.Server
  , wss = new WebSocketServer({
      address : config.websocket.address,
      port : config.websocket.port}
    );

var peers =  {}; // peering signals cached in server for connected clients. When a new client joins, send them all to him.

wss.on('error', (err) => {
  util.log(`ERROR ${err}`);
});

wss.on('connection', function connection(ws) {  
  util.log(`INFO connection from new peer`);

  ws.on('error', err => {
    debug(err);
  });

  //send peering signals from others to this new peer (as soon as we get them all)
  Promise.all(Object.keys(peers).map(val => peers[val])) //object properties into array operation
         .then((signals) => {
    debug(`INFO Send ${signals.length} peer signals to new peer ${ws.upgradeReq.headers['sec-websocket-key']}`);
    ws.send(JSON.stringify(signals), {}, () => {
      new Promise( (resolve, reject) => { // first we hear back from new peer with matching signals
        ws.once('message', (bs) => {
          var back_signals = JSON.parse(bs);
          if (signals.length == back_signals.length) {
            debug(`INFO Received ${back_signals.length} peering signals back from new client ${ws.upgradeReq.headers['sec-websocket-key']}`);
            
            wss.clients.filter( (client) => {
              return peers[client.upgradeReq.headers['sec-websocket-key']] !== undefined;
            }).forEach((client,i) => {
              debug(`INFO Transmit peering signal from new client to ${ws.upgradeReq.headers['sec-websocket-key']}`);
              client.send(JSON.stringify(back_signals[i]));
            });
            peers = {}; //just to make sure we don't send same signal to peers in the future
            resolve();
          } else {
            reject(`INFO Received ${back_signals.length} peering signals back from ${ws.upgradeReq.headers['sec-websocket-key']}, expected ${signals.length}`);
          }
        });
      }).then( () => { //then we should only expect peering signals to be cached from now
        ws.on('message', (signal) => {
          debug(`INFO Received peering signal from client ${ws.upgradeReq.headers['sec-websocket-key']}`);
          peers[ws.upgradeReq.headers['sec-websocket-key']] = JSON.parse(signal);
          debug(JSON.parse(signal));
        });
        ws.on('close', (code,message) => {
          debug(`INFO Client ${ws.upgradeReq.headers['sec-websocket-key']} disconnected`);
          delete peers[ws.upgradeReq.headers['sec-websocket-key']];
        });
      });
    });
  });
});

util.log(`INFO listening to ${config.websocket.port}`);