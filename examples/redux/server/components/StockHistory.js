import React, { PropTypes } from 'react';

export default class StockHistory extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchHistory(this.props.symbol);
    }

    render() {
        return (
            <div>
                <h2>{this.props.symbol}</h2>
                <table>
                    <thead>
                    <tr><th>Timestamp</th><th>Price</th></tr>
                    </thead>
                    <tbody>
                    {
                        this.props.requesting ?
                            <tr><td colSpan="2">Loading..</td></tr>
                            :
                            this.props.historyList.map(h =>
                                <tr key={h.timestamp}>
                                    <td>{h.timestamp}</td>
                                    <td>{h.price}</td>
                                </tr>
                            )
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

StockHistory.propTypes = {
    historyList: React.PropTypes.array.isRequired,
    requesting: PropTypes.bool.isRequired,
    symbol:  PropTypes.string.isRequired,
};
