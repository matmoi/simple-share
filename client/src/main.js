import React from 'react';
import ReactDOM from 'react-dom';
import FileSharer from './components/filesharer.jsx';
import Options from '../../config/global.js';
import io from 'socket.io-client';
import io_wildcard from 'socketio-wildcard';

//Debugging
window.myDebug = require("debug");
myDebug.enable("simple-share");


var patch = io_wildcard(io.Manager);
var websocket = io(`ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`);
patch(websocket);

var main = document.getElementById('main');

ReactDOM.render(<FileSharer opts={Options} /> websocket={ws}, main);