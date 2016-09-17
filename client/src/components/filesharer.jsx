var React = require('react');
var randomstring = require('randomstring');
//var Peer = require('peerjs');
var WebSocket = require('simple-websocket');
var Peer = require('simple-peer');
var debug = require('debug')('simple-share');

module.exports = React.createClass({
	propTypes: {
		opts: React.PropTypes.object
	},

	getInitialState: function(){
		return {
			ws: new WebSocket(`ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`),
			peers: [],
			//peer: new Peer({key: this.props.opts.peerjs_key}), //for testing
			/*
			//for production:
			peer = new Peer({
			  host: 'yourwebsite.com', port: 3000, path: '/peerjs',
			  debug: 3,
			  config: {'iceServers': [
			    { url: 'stun:stun1.l.google.com:19302' },
			    { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
			  ]}
			})
			*/
			// my_id: '',
			// peer_id: '',
			initialized: false,
			files: [],
			status_message: 'Loading...'
		};
	},

	componentWillMount: function() {
		if (WebSocket.WEBSOCKET_SUPPORT) {
			if (Peer.WEBRTC_SUPPORT) {
			  	this.setState({
					status_message : `Contacting server at ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`
				});
				
				this.state.ws.on('connect', () => {
					//waiting for peers 
					this.setState({
						status_message : `Waiting for peers`
					});
					
					this.state.ws.on('data', (message) => {
						debug(`received message from server`);
						var peers = this.state.peers;
						if (! this.state.initialized) {
							// first message should contain webRTC signaling info from other peers
							var remote_signals = JSON.parse(message);
							this.setState({
								status_message : (remote_signals.length > 0 ? `Connecting to ${remote_signals.length} peers` : `No peers available, waiting for users`)
							});
							var local_signals = []; //create signaling data for every remote peer
							remote_signals.forEach((remote_peer) => {
								var peer = new Peer({});
								peer.on('signal', (local_signal) => {
									local_signals.push(local_signal);
								});
								peer.signal(remote_peer);
								peer.on('connect', () => {
									debug(`connected to remote peer ${remote_peer}`);
								});
								peers.push(peer);
								this.setState({peers: peers});
							});
							console.assert(remote_signals.length == local_signals.length,remote_signals,local_signals);
							debug(`Send ${local_signals.length} requests to peering signals`);
							this.state.ws.send(JSON.stringify(local_signals))
							this.setState({initialized: true});
						} else {
							// a new peer is trying to connect with us
							peers.forEach((peer) => {
								debug();
							});
						}
						// all peer requests have been processed, a new peering signal must be issued for next incoming client
						var peer_init = new Peer({initiator: true});
						peer_init.on('signal', (local_signal) => {
							this.state.ws.send(JSON.stringify(local_signal));
						});
					});

					this.state.ws.on('error', (err) => {
						this.setState({
							status_message : err
						});
					});
				});
			} else {
					this.setState({
					status_message : `This browser doesn't support WebRTC.
							  More information at http://caniuse.com/#feat=rtcpeerconnection`
		  		});
			}
		} else {
		  this.setState({
			status_message : `This browser doesn't support WebSockets.
							  More information at http://caniuse.com/#feat=websockets`
		  });
		}

		// this.state.peer.on('open', (id) => {
		// 	console.log('My peer ID is: ' + id);
		// 	this.setState({
		// 		my_id: id,
		// 		initialized: true
		// 	});
		// });
		// this.state.peer.on('connection', (connection) => {
		// 	console.log('someone connected');
		// 	console.log(connection);

		// 	this.setState({
		// 		conn: connection
		// 	}, () => {
		// 		this.state.conn.on('open', () => {
		// 			this.setState({
		// 				connected: true
		// 			});
		// 		});

		// 		this.state.conn.on('data', this.onReceiveData);
		// 	});
		// });
		
		// this.state.peer.on('error', (err) => {
		// 	this.setState({
		// 		status_message: err.message
		// 	})
		// });
	},

	componentWillUnmount: function(){
		this.state.ws.destroy();
	},

	connectToPeer: function(options) {
		debug(`connect to peer ${options}`);

	},

	connect: function(){
		// var peer_id = this.state.peer_id;
		// var connection = this.state.peer.connect(peer_id);

		// this.setState({
		//     conn: connection
		// }, () => {
		// 	this.state.conn.on('open', () => {
		// 		this.setState({
		// 			connected: true
		// 		});
		// 	});
		// 	this.state.conn.on('data', this.onReceiveData);
		// });
	},

	sendFile: function(event){
	    console.log(event.target.files);
	    // var file = event.target.files[0];
	    // var blob = new Blob(event.target.files, {type: file.type});

	    // this.state.conn.send({
	    //     file: blob,
	    //     filename: file.name,
	    //     filetype: file.type
	    // });
	},

	onReceiveData: function(data){
		console.log('Received', data);

		// var blob = new Blob([data.file], {type: data.filetype});
		// var url = URL.createObjectURL(blob);

		// this.addFile({
		// 	'name': data.filename,
		// 	'url': url
		// });

	},

	addFile: function(file){
		// var file_name = file.name;
		// var file_url = file.url;

		// var files = this.state.files;
		// var file_id = randomstring.generate(5);

		// files.push({
		// 	id: file_id,
		// 	url: file_url,
		// 	name: file_name
		// });

		// this.setState({
		// 	files: files
		// });
	},

	handleTextChange: function(event){
		// this.setState({
		//   peer_id: event.target.value
		// });
	},

	render: function() {
		var result;

		if(this.state.initialized){
			result = (
				<div>
					<div>
            <span>{this.props.opts.my_id_label || 'Your PeerJS ID:'} </span>
            <strong className="mui--divider-left">null</strong>
					</div>
					{this.state.connected ? this.renderConnected() : this.renderNotConnected()}
				</div>
			);
		} else {
			result = <div>{this.state.status_message}</div>;
		}

		return result;
	},

	renderNotConnected: function () {
		return (
			<div>
				<hr />
				<div className="mui-textfield">
					<input type="text" className="mui-textfield" onChange={this.handleTextChange} />
					<label>{this.props.opts.peer_id_label || 'Peer ID'}</label>
				</div>
				<button className="mui-btn mui-btn--accent" onClick={this.connect}>
					{this.props.opts.connect_label || 'connect'}
				</button>
			</div>
		);
	},

	renderConnected: function () {
		return (
			<div>
				<hr />
				<div>
					<input type="file" name="file" id="file" className="mui--hide" onChange={this.sendFile} />
					<label htmlFor="file" className="mui-btn mui-btn--small mui-btn--primary mui-btn--fab">+</label>
				</div>
				<div>
					<hr />
					{this.state.files.length ? this.renderListFiles() : this.renderNoFiles()}
				</div>
			</div>
		);
	},

	renderListFiles: function () {
		return (
			<div id="file_list">
      			<table className="mui-table mui-table--bordered">
					<thead>
					  <tr>
					    <th>{this.props.opts.file_list_label || 'Files shared to you: '}</th>
					  </tr>
					</thead>
					<tbody>
						{this.state.files.map(this.renderFile, this)}
					</tbody>
				</table>
			</div>
		);
	},

	renderNoFiles: function () {
		return (
			<span id="no_files_message">
				{this.props.opts.no_files_label || 'No files shared to you yet'}
			</span>
		);
	},

	renderFile: function (file) {
		return (
			<tr key={file.id}>
				<td>
					<a href={file.url} download={file.name}>{file.name}</a>
				</td>
			</tr>
		);
	}
});
