var config = {};

config.websocket = {};
config.websocket.port = process.env.WS_PORT || 8080;
config.websocket.address = process.env.WS_ADDRESS || 'localhost';

module.exports = config;