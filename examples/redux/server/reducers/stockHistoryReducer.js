import { REQUEST_HISTORY, RECEIVE_HISTORY, RECEIVE_NEW_PRICE } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function stockHistory (state = initialState.stockHistory, action) {

    switch (action.type) {

        case REQUEST_HISTORY:
            return objectAssign({}, state, {requesting: true, symbol: action.symbol});

        case RECEIVE_HISTORY:
            return objectAssign({}, state, {
                historyList: action.history,
                requesting: false,
                symbol: state.symbol
            });

        case RECEIVE_NEW_PRICE:
            if(state.symbol !== action.symbol)
                return state;

            return {
                historyList: [
                    {
                        timestamp: action.timestamp,
                        price: action.price
                    },
                    ...state.historyList
                ],
                requesting: state.requesting,
                symbol: state.symbol
            };

        default:
            return state;
    }
}
