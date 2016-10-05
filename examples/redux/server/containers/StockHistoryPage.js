import React from 'react';
import {connect} from 'react-redux';
import StockHistory from '../components/StockHistory';
import { requestHistory } from "../actions/stockPricesActions";

const mapDispatchToProps = (dispatch) => {
  return {
    fetchHistory: symbol => dispatch(requestHistory(symbol))
  }
};

function mapStateToProps(state, ownProps) {
  return {
      historyList: state.stockHistory.historyList || [],
      requesting: state.stockHistory.requesting || false,
      symbol: ownProps.params.symbol
  };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StockHistory);
