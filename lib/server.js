"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ServiceConnectHub = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bus = require("service-connect");

/** Class representing a the server implementation of ServiceConnectHub. */
var ServiceConnectHub = exports.ServiceConnectHub = function (_EventEmitter) {
    _inherits(ServiceConnectHub, _EventEmitter);

    /**
     * Sets config and creates socket server.  Then starts data sources and begins listening for client connections.
     * @constructor
     * @param  {object} options
     */
    function ServiceConnectHub(options) {
        _classCallCheck(this, ServiceConnectHub);

        var _this = _possibleConstructorReturn(this, (ServiceConnectHub.__proto__ || Object.getPrototypeOf(ServiceConnectHub)).call(this));

        _this.options = options;
        _this.connections = {};
        _this._connected = _this._connected.bind(_this);
        _this._emitMessage = _this._emitMessage.bind(_this);
        _this.init = _this.init.bind(_this);
        _this._removeTypeMapping = _this._removeTypeMapping.bind(_this);
        _this._typeStillMapped = _this._typeStillMapped.bind(_this);
        _this._getFiltersByType = _this._getFiltersByType.bind(_this);
        _this.on("error", console.log);
        return _this;
    }

    /**
     * Initializes the web socket connection and service connect bus. Calls callback when connected.
     * @param server
     * @param {function} callback
     */


    _createClass(ServiceConnectHub, [{
        key: "init",
        value: function init(server, callback) {
            var _this2 = this;

            this.bus = new Bus(this.options.bus);
            this.bus.on("error", function (ex) {
                return _this2.emit("error", ex);
            });
            this.bus.on("connected", function (ex) {
                return _this2.emit("connected", ex);
            });

            this.bus.init(function () {
                _this2.socketServer = (0, _socket2.default)(server);
                _this2.socketServer.on("connection", _this2._connected);
                _this2.socketServer.on("error", function (ex) {
                    return _this2.emit("error", ex);
                });

                if (callback) {
                    callback();
                }
            });
        }

        /**
         * Called by socket.io when client connects.  Sets up event handlers for add-handler, remove-handler and disconnect.
         *
         * set-context callback will register client context object with socket connection.  Potential uses of context are
         * security token.  Can be used in conjunction with filters to filter messages based on client context.
         *
         * add-handler callback will bind the type to the client socket id.  It first checks handler type against a white
         * list and black list.
         *
         * remove-handler callback removed the handler type mapping from the client.  If no clients are handling the type
         * it will remove the Bus type binding.
         *
         * disconnect callback removed the client from the handlers map.
         * @param  {object} socket
         * @private
         */

    }, {
        key: "_connected",
        value: function _connected(socket) {
            var _this3 = this;

            this.connections[socket.id] = { socket: socket, handlers: [] };

            socket.on("set-context", function (context) {
                _this3.connections[socket.id].context = context;
            });

            socket.on("error", function (ex) {
                _this3.emit("error", ex);
            });

            socket.on("add-handler", function (handler) {
                if (!_this3._isValidMessageType(handler)) return;

                _this3.connections[socket.id].handlers.push(handler);

                if (!_this3.bus.isHandled(handler)) {
                    _this3.bus.addHandler(handler, _this3._emitMessage);
                }
            });

            socket.on("remove-handler", function (handler) {
                _this3.connections[socket.id].handlers = _this3.connections[socket.id].handlers.filter(function (h) {
                    return h !== handler;
                });
                _this3._removeTypeMapping(handler);
            });

            socket.on("send-command", function (endpoint, type, message, headers) {
                if (!_this3._isValidMessageType(type)) return;

                _this3.bus.send(endpoint, type, message, headers);
            });

            socket.on("publish-event", function (type, message, headers) {
                if (!_this3._isValidMessageType(type)) return;

                _this3.bus.publish(type, message, headers);
            });

            socket.on("send-request", function (endpoint, type, message, headers) {
                if (!_this3._isValidMessageType(type)) return;

                _this3.bus.sendRequest(endpoint, type, message, function (message) {
                    console.log("Received response");
                    socket.emit("response", message, type, headers);
                }, headers);
            });

            socket.on("disconnect", function () {
                if (_this3.connections[socket.id] !== undefined) {
                    for (var key in _this3.connections[socket.id]) {
                        _this3._removeTypeMapping(key);
                    }
                    delete _this3.connections[socket.id];
                }
            });
        }

        /**
         * Returns true is message type is not on black list and if white list is populated is on white list
         * @param {string} type
         * @private
         */

    }, {
        key: "_isValidMessageType",
        value: function _isValidMessageType(type) {
            if (this.options.blacklist && this.options.blacklist.indexOf(type) !== -1) return false;

            // Return if not on white list?
            if (this.options.whitelist && !(this.options.whitelist.indexOf(type) !== -1)) return false;

            return true;
        }

        /**
         * Remove type mapping from client if no more clients are interested in message
         * @param {string} type
         * @private
         */

    }, {
        key: "_removeTypeMapping",
        value: function _removeTypeMapping(type) {
            var isMapped = this._typeStillMapped(type);
            if (!isMapped) {
                this.bus.removeHandler(type, this._emitMessage);
            }
        }

        /**
         * Finds if type is still mapped
         * @param {String} type
         * @return {boolean}
         * @private
         */

    }, {
        key: "_typeStillMapped",
        value: function _typeStillMapped(type) {
            for (var connectionKey in this.connections) {
                if (this.connections[connectionKey].handlers.indexOf(type) !== -1) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Called when the Bus received a message.  Checks if the message should be processed and then processes message.
         * @param  {object} message
         * @param  {object} headers
         * @param  {string} type
         * @private
         */

    }, {
        key: "_emitMessage",
        value: function _emitMessage(message, headers, type) {
            var _this4 = this;

            var filters = this._getFiltersByType(type);

            var _loop = function _loop(key) {
                if (_this4.connections[key].handlers.indexOf(type) !== -1) {
                    var shouldProcess = filters.every(function (f) {
                        return f(message, headers, type, _this4.connections[key].context);
                    });
                    if (shouldProcess) {
                        _this4.connections[key].socket.emit("handler-message", message, type, headers);
                    }
                }
            };

            for (var key in this.connections) {
                _loop(key);
            }
        }

        /**
         * Returns filters that match the type.
         * @param {string} type
         * @return {Array} filters
         * @private
         */

    }, {
        key: "_getFiltersByType",
        value: function _getFiltersByType(type) {
            var filters = [];
            if (this.options.filters) {
                for (var key in this.options.filters) {
                    if (new RegExp(key).test(type)) {
                        filters.push.apply(filters, _toConsumableArray(this.options.filters[key]));
                    }
                }
            }
            return filters;
        }
    }]);

    return ServiceConnectHub;
}(_events2.default);
//# sourceMappingURL=server.js.map