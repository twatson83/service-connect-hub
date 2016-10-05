import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const LatestPrices = ({ prices, requesting }) => {
  return (
    <table>
        <thead>
            <tr><th>Symbol</th><th>Price</th><th>Open</th><th>High</th><th>Low</th><th>Change</th></tr>
        </thead>
        <tbody>
            {
                requesting ?
                    <tr><td colSpan="6">Loading..</td></tr>
                :
                    Object.keys(prices).map(key =>
                        <tr key={key}>
                            <td><Link to={`/stock-history/${key}`}>{key}</Link></td>
                            <td>{prices[key].price}</td>
                            <td>{prices[key].open}</td>
                            <td>{prices[key].high}</td>
                            <td>{prices[key].low}</td>
                            <td  style={{color: prices[key].change >= 0 ? "green" : "red"}}>{prices[key].change  + "%"}</td>
                        </tr>
                    )
            }
        </tbody>
    </table>
  );
};

LatestPrices.propTypes = {
    prices: React.PropTypes.object.isRequired,
    requesting: PropTypes.bool.isRequired
}

export default LatestPrices;
