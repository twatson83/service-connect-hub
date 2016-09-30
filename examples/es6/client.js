import { connect, addHandler, setContext } from '../../lib/client';

connect(`http://localhost:2999`);

var appendMessage = (message, type) => {
    var node = document.createElement("LI");
    node.appendChild(document.createTextNode(type + ": " + JSON.stringify(message)));
    document.getElementById("list").appendChild(node);
};

addHandler("LogCommand", appendMessage);
addHandler("MetricCommand", appendMessage);

setContext({
    token: 123
});
