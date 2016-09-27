const global = {};

global.websocket = {};
global.websocket.port = process.env.WS_PORT || 8080;
global.websocket.address = process.env.WS_ADDRESS || 'localhost';

// define vocabulary for server/client messages
global.ENUMERATE_PEERS   = 'EP';
// constants for message callbacks
global.OK                = 'OK';
global.DISCONNECTED_PEER = 'DISCONNECTED_PEER';

module.exports = global;