import io from "socket.io-client";

let socket,
    requestCallbacks = {},
    requestCounter = 0;

export let handlers = {};

/**
 * Connects to server
 * @param  {string} url
 */
export function connect(url) {
    socket = io.connect(url);

    // Received from the server when a message has been consumed.  Executed all the callbacks that are interested in
    // message type.
    socket.on("handler-message", (message, type) => {
        var callbacks = handlers[type];
        if (callbacks){
            callbacks.forEach(cb => cb(message, type));
        }
    });

    socket.on("reconnect", () => {
        console.info("Re-registering handlers with server");
        for(var key in handlers){
            socket.emit("add-handler", key);
        }
    });

    socket.on("response", (message, type, headers) => {
        var callback = requestCallbacks[headers["ClientId"]];
        if (callback){
            callback(message, type, headers);
            delete requestCallbacks[headers["ClientId"]];
        }
    });
}

/**
 * Begins listening for messages of type @type.  Will execute @callback when a message is received of type @type.
 * @param  {string} type
 * @param  {function} callback
 */
export function addHandler(type, callback) {
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
export function removeHandler(type, callback) {
    // Remove callback from the map
    handlers[type] = handlers[type].filter(cb => {
        return cb !== callback;
    });

    // Unbinds handler from client on server
    if (handlers[type].length === 0){
        socket.emit("remove-handler", type);
    }
}

/**
 * Removes all handler bindings
 */
export function clearHandlers() {

    Object.keys(handlers).forEach(t => {
        socket.emit("remove-handler", t);
    });

    handlers = {};
}

/**
 * Sets the context on the server.  Server can use the context to filter messages.
 * @param  {object} context
 */
export function setContext(context) {
    socket.emit("set-context", context);
}

/**
 * Sends a command to the specified endpoint(s).
 * @param {String|Array} endpoint
 * @param  {String} type
 * @param  {Object} message
 * @param  {Object|undefined} headers
 */
export function send(endpoint, type, message, headers = {}){
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
export function sendRequest(endpoint, type, message, callback, headers = {}){
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
export function publish(type, message, headers = {}){
    socket.emit("publish-event", type, message, headers);
}