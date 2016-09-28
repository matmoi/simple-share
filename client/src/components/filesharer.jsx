var React = require('react');
var randomstring = require('randomstring');
var io = require('socket.io-client');
var io_patch = require('socketio-wildcard')(io.Manager);
var Peer = require('simple-peer');
var debug = require('debug')('simple-share');

export default class MainView extends React.Component {
	static propTypes = {
		opts: React.PropTypes.object
	};

	state = {
		ws: io(`ws://${this.props.opts.websocket.address}:${this.props.opts.websocket.port}`),
		peers: [],
		initialized: false,
		status_message: 'Loading...'
	};

	constructor(props, context) {
    	super(props, context);

		var ws = this.state.ws;
		io_patch(ws);
		this.setState({ws:ws});

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
							// => delegate to child class
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
	}

	render() {
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
	}

	renderNotConnected () {
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
	}

	renderConnected () {
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
	}
}