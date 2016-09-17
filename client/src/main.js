var React = require('react');
var ReactDOM = require('react-dom');
var Filesharer = require('./components/filesharer.jsx');
var options = require('../../config/global.js');

//Debugging
window.myDebug = require("debug");
myDebug.enable("*")

// var options = {
// 	peerjs_key: 'ibggqp8erg5mte29'
// };

var main = document.getElementById('main');

ReactDOM.render(<Filesharer opts={options} />, main);