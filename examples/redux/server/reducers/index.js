import { combineReducers } from 'redux';
import latestPrices from './latestPricesReducer';
import stockHistory from './stockHistoryReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  latestPrices,
  stockHistory,
  routing: routerReducer
});

export default rootReducer;
