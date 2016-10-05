import React from "react";
import {connect} from "react-redux";
import LatestPrices from "../components/LatestPrices";

function mapStateToProps(state) {
    return { ...state.latestPrices };
}

export default connect(
    mapStateToProps
)(LatestPrices);
