var exports = require('../../lib/client'),
    connect = exports.connect,
    addHandler = exports.addHandler,
    removeHandler = exports.removeHandler,
    React = require('react'),
    ReactDOM = require('react-dom');

var MessageTable = React.createClass({

    getInitialState: function() {
        return {
            rows: [],
            started: true
        };
    },

    componentDidMount: function() {
        connect(`http://localhost:2999`);
        this._setupMessageHandler(this.state.started);
    },

    componentWillUpdate: function(nextProps, nextState){
        if (this.state.started !== nextState.started) {
            this._setupMessageHandler(nextState.started);
        }
    },

    _setupMessageHandler: function(start){
        if (start){
            addHandler("LogCommand", this.appendMessage);
        } else {
            removeHandler("LogCommand", this.appendMessage);
        }
    },

    onStartStop: function(){
        this.setState({ rows: this.state.rows, started: !this.state.started });
    },

    appendMessage: function(message){
        this.state.rows.unshift(message);

        if (this.state.rows.length > 20)
            this.state.rows.pop();

        this.setState({ rows: this.state.rows, started: this.state.started });
    },

    render: function() {
        var rowNodes = this.state.rows.map(function(d){
            return (<tr key={d.Id}><td>{d.DateTime}</td><td>{d.Level}</td><td>{d.Message}</td></tr>);
        });

        return (
            <div>
                <button onClick={this.onStartStop}>{this.state.started ? "Stop" : "Start"}</button>
                <table>
                    <thead>
                        <tr>
                            <th>DateTime</th><th>Level</th><th>Message</th>
                        </tr>
                    </thead>
                    <tbody>{rowNodes}</tbody>
                </table>
            </div>
        );
    }
});

ReactDOM.render(
    <MessageTable/>,
    document.getElementById('root')
);