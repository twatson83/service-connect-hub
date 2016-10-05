import {REQUEST_LATEST_PRICES, RECEIVE_LATEST_PRICES, RECEIVE_NEW_PRICE } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function latestPrices (state = initialState.latestPrices, action) {
    switch (action.type) {

        case REQUEST_LATEST_PRICES:
            return objectAssign({}, state, {requesting: true});

        case RECEIVE_LATEST_PRICES:
            var newPrices = {};
            action.prices.forEach(p => {
                newPrices[p.symbol] = {
                    price: p.price,
                    high: p.price,
                    low: p.price,
                    open: p.price,
                    change: 0
                }
            });
            return {
                prices: newPrices,
                requesting: false
            };

        case RECEIVE_NEW_PRICE:
            var currentStockInfo = state.prices[action.symbol];

            if (currentStockInfo === undefined){
                return {
                    prices: {
                        ...state.prices,
                        [action.symbol]: {
                            price: action.price,
                            high: action.price,
                            low: action.price,
                            open: action.price,
                            change: 0
                        }
                    },
                    requesting: state.requesting
                };
            }

            var newStockInfo = objectAssign({}, currentStockInfo);

            if (action.price > newStockInfo.high){
                newStockInfo.high = action.price;
            }
            if (action.price < newStockInfo.low){
                newStockInfo.low = action.price;
            }
            newStockInfo.change = -(((newStockInfo.open - action.price) / action.price) * 100).toFixed(2);
            newStockInfo.price = action.price;

            return {
                prices: {
                    ...state.prices,
                    [ action.symbol]: newStockInfo
                },
                requesting: state.requesting
            };
        default:
            return state;
    }
}
