import React from 'react';
import ReactDOM from 'react-dom';
import FileSharer from './components/filesharer.jsx';
import Options from '../../config/global.js';

//Debugging
window.myDebug = require("debug");
myDebug.enable("simple-share");

var main = document.getElementById('main');

ReactDOM.render(<FileSharer opts={Options} />, main);