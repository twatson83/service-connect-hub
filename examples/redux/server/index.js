import {render} from "react-dom";
import { Provider } from "react-redux";
import { Router, browserHistory } from "react-router";
import routes from "./routes";
import configureStore from "./store/configureStore";
import { syncHistoryWithStore } from "react-router-redux";
import { addHandler, connect } from "../../../lib/client";
import { receiveNewPrice } from "./actions/stockPricesActions";

const store = configureStore();

const history = syncHistoryWithStore(browserHistory, store);

connect(`http://localhost:2999`);

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>, document.getElementById("app")
);

addHandler("new-price", price => store.dispatch(receiveNewPrice(price)));