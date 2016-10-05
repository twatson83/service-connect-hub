import * as types from '../constants/actionTypes';
import { sendRequest } from '../../../../lib/client';

export function requestLatestPrices() {
    return function(dispatch){
        dispatch({ type: types.REQUEST_LATEST_PRICES });

        sendRequest("ServiceConnect.Samples.Ticker", "latest-prices-request", {}, message => {
            dispatch({ type: types.RECEIVE_LATEST_PRICES, ...message });
        });
    };
}

export function requestHistory(symbol) {
    return function(dispatch){
        dispatch({ type: types.REQUEST_HISTORY, symbol});

        sendRequest("ServiceConnect.Samples.Ticker", "price-history-request", { symbol }, message => {
            dispatch({ type: types.RECEIVE_HISTORY, ...message });
        });
    };
}

export function receiveNewPrice(stock) {
    return { type: types.RECEIVE_NEW_PRICE, ...stock };
}

