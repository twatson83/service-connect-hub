import React from 'react';
import LatestPrices from '../containers/LatestPrices';

export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchLatestPrices();
    }

    render() {
        return (
            <div>
                <h2>Stock Ticker Example</h2>
                {
                    this.props.requesting ? <Spinner/> : <LatestPrices />
                }
            </div>
        );
    }
}
