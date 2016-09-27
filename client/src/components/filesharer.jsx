var React = require('react');
var randomstring = require('randomstring');
var io = require('socket.io-client');
var io_patch = require('socketio-wildcard')(io.Manager);
var Peer = require('simple-peer');
var debug = require('debug')('simple-share');

module.exports = React.createClass({
	propTypes: {
		opts: React.PropTypes.object
	},

	getInitialState: function(){
		return {
			ws: io(`ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`),
			peers: [],
			initialized: false,
			files: [],
			status_message: 'Loading...'
		};
	},

	componentWillMount: function() {
		io_patch(this.state.ws);
		if (Peer.WEBRTC_SUPPORT) {
		  	this.setState({
				status_message : `Contacting server at ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`
			});
			
			this.state.ws.on('connect', () => {
				//waiting for peers 
				this.setState({status_message : `Waiting for peers`});

				this.state.ws.on('error', err => {
					this.setState({status_message : err});
				});

				this.state.ws.on('*', event => {
					var name = event.data[0],
          				msg  = event.data[1],
			        	cb   = event.data[2];
					switch (name.substr(0,2)) {
						case '/#': //peer id
							debug(`Receive message from ${name}`);
					}
				});
				this.state.ws.emit(this.props.opts.ENUMERATE_PEERS, {}, announced_peers => {
					switch (announced_peers.length) {
					case 0:
						this.setState({status_message: `No peer`});
						break;
					case 1:
						this.setState({status_message: `Connecting to 1 peer`});
						break;
					default:
						this.setState({status_message: `Connecting to ${announced_peers.length} peers`});
					}
					announced_peers.forEach(announced_peer => {
						debug(`Send peer signal to ${announced_peer}`);
						this.state.ws.emit(announced_peer,'data', r => {
							if (r !== this.props.opts.OK) {
								debug(`Send peer signal to ${announced_peer} failed [${r}]`);
							}
						});
					});
				});
			});
		} else {
				this.setState({
				status_message : `This browser doesn't support WebRTC.
							More information at http://caniuse.com/#feat=rtcpeerconnection`
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
