import React from "react";
import {connect} from "react-redux";
import { requestLatestPrices } from "../actions/stockPricesActions";
import HomePage from "../components/HomePage";

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchLatestPrices: () => dispatch(requestLatestPrices())
    }
};

const HomePageContainer = connect(
    mapStateToProps,
    mapDispatchToProps)
(HomePage);
export default HomePageContainer;
