var exports = require('../../lib/client');
var connect = exports.connect;
var addHandler = exports.addHandler;
var send = exports.send;
var publish = exports.publish;

connect(`http://localhost:2999`);

addHandler("ClientMessage", function(message, type) {
    var node = document.createElement("LI");
    node.appendChild(document.createTextNode(type + ": " + JSON.stringify(message)));
    document.getElementById("list").appendChild(node);
});

send("SampleServiceConnectHubService", "SampleCommand", {
    Message: "Command from sample client"
});

publish("SampleEvent", {
    Message: "Event from sample client"
});
