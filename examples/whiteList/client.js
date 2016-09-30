var exports = require('../../lib/client');
var connect = exports.connect;
var addHandler = exports.addHandler;

connect(`http://localhost:2999`);

var appendMessage = function(message, type) {
    var node = document.createElement("LI");
    node.appendChild(document.createTextNode(type + ": " + JSON.stringify(message)));
    document.getElementById("list").appendChild(node);
};

addHandler("LogCommand", appendMessage);
addHandler("MetricCommand", appendMessage);
