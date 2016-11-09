"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handlers = undefined;
exports.connect = connect;
exports.addHandler = addHandler;
exports.removeHandler = removeHandler;
exports.clearHandlers = clearHandlers;
exports.setContext = setContext;
exports.send = send;
exports.sendRequest = sendRequest;
exports.publish = publish;

var _socket = require("socket.io-client");

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socket = void 0,
    requestCallbacks = {},
    requestCounter = 0;

var handlers = exports.handlers = {};

/**
 * Connects to server
 * @param  {string} url
 */
function connect(url) {

    if (url) {
        socket = (0, _socket2.default)(url);
    } else {
        socket = (0, _socket2.default)();
    }

    // Received from the server when a message has been consumed.  Executed all the callbacks that are interested in
    // message type.
    socket.on("handler-message", function (message, type) {
        var callbacks = handlers[type];
        if (callbacks) {
            callbacks.forEach(function (cb) {
                return cb(message, type);
            });
        }
    });

    socket.on("reconnect", function () {
        console.info("Re-registering handlers with server");
        for (var key in handlers) {
            socket.emit("add-handler", key);
        }
    });

    socket.on("response", function (message, type, headers) {
        var callback = requestCallbacks[headers["ClientId"]];
        if (callback) {
            callback(message, type, headers);
            delete requestCallbacks[headers["ClientId"]];
        }
    });

    return new Promise(function (resolve, reject) {
        socket.on('connect', function () {
            resolve();
        });
        socket.on('connect_error', function (ex) {
            reject(ex);
        });
    });
}

/**
 * Begins listening for messages of type @type.  Will execute @callback when a message is received of type @type.
 * @param  {string} type
 * @param  {function} callback
 */
function addHandler(type, callback) {
    handlers[type] = handlers[type] || [];
    handlers[type].push(callback);

    // Tells the server we are interested in the type.
    socket.emit("add-handler", type);
}

/**
 * Unbinds the type and callback and stops listening for the message type if no more callbacks are bound to the type.
 * @param  {string} type
 * @param  {function} callback
 */
function removeHandler(type, callback) {
    // Remove callback from the map
    handlers[type] = handlers[type].filter(function (cb) {
        return cb !== callback;
    });

    // Unbinds handler from client on server
    if (handlers[type].length === 0) {
        socket.emit("remove-handler", type);
    }
}

/**
 * Removes all handler bindings
 */
function clearHandlers() {

    Object.keys(handlers).forEach(function (t) {
        socket.emit("remove-handler", t);
        delete handlers[t];
    });
}

/**
 * Sets the context on the server.  Server can use the context to filter messages.
 * @param  {object} context
 */
function setContext(context) {
    socket.emit("set-context", context);
}

/**
 * Sends a command to the specified endpoint(s).
 * @param {String|Array} endpoint
 * @param  {String} type
 * @param  {Object} message
 * @param  {Object|undefined} headers
 */
function send(endpoint, type, message) {
    var headers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    socket.emit("send-command", endpoint, type, message, headers);
}

/**
 * Sends a command to the specified endpoint(s) and waits for one or more replies.
 * The method behaves like a regular blocking RPC method.
 * @param {string|Array} endpoint
 * @param {string} type
 * @param {Object} message
 * @param {function} callback
 * @param {Object|undefined} headers
 */
function sendRequest(endpoint, type, message, callback) {
    var headers = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

    requestCallbacks[requestCounter] = callback;
    headers["ClientId"] = requestCounter;
    requestCounter++;
    socket.emit("send-request", endpoint, type, message, headers);
}

/**
 * Published an event of the specified type.
 * @param  {String} type
 * @param  {Object} message
 * @param  {Object|undefined} headers
 */
function publish(type, message) {
    var headers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    socket.emit("publish-event", type, message, headers);
}
//# sourceMappingURL=client.js.map