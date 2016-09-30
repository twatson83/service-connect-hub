import io from 'socket.io';
var Bus = require('service-connect');
import EventEmitter from 'events';

/** Class representing a the server implementation of ServiceConnectHub. */
export class ServiceConnectHub extends EventEmitter {

    /**
     * Sets config and creates socket server.  Then starts data sources and begins listening for client connections.
     * @constructor
     * @param  {object} options
     */
    constructor(options){
        super();
        this.options = options;
        this.connections = {};
        this._connected = this._connected.bind(this);
        this._emitMessage = this._emitMessage.bind(this);
        this.init = this.init.bind(this);
        this._removeTypeMapping = this._removeTypeMapping.bind(this);
        this._typeStillMapped = this._typeStillMapped.bind(this);
        this._getFiltersByType = this._getFiltersByType.bind(this);
        this.on("error", console.log);
    }

    /**
     * Initializes the web socket connection and service connect bus. Calls callback when connected.
     * @param server
     * @param {function} callback
     */
    init(server, callback){
        this.bus = new Bus(this.options.bus);
        this.bus.on("error", ex => this.emit("error", ex));
        this.bus.on("connected", ex => this.emit("connected", ex));

        this.bus.init(() =>{
            this.socketServer = io(server);
            this.socketServer.on('connection', this._connected);
            this.socketServer.on("error", ex => this.emit("error", ex));

            if (callback){
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
    _connected(socket){
        this.connections[socket.id] = { socket, handlers: [] };

        socket.on('set-context', context => {
            this.connections[socket.id].context = context;
        });

        socket.on('error', ex => {
            this.emit("error", ex);
        });

        socket.on('add-handler', handler => {
            if(!this._isValidMessageType(handler))
                return;

            this.connections[socket.id].handlers.push(handler);

            if (!this.bus.isHandled(handler)){
                this.bus.addHandler(handler, this._emitMessage);
            }
        });

        socket.on('remove-handler', handler => {
            this.connections[socket.id].handlers = this.connections[socket.id].handlers.filter(h => h !== handler);
            this._removeTypeMapping(handler);
        });

        socket.on('send-command', (endpoint, type, message, headers) => {
            if(!this._isValidMessageType(type))
                return;

            this.bus.send(endpoint, type, message, headers);
        });

        socket.on('publish-event', (type, message, headers) => {
            if(!this._isValidMessageType(type))
                return;

            this.bus.publish(type, message, headers);
        });

        socket.on('disconnect', () => {
            if(this.connections[socket.id] !== undefined){
                for (var key in this.connections[socket.id]){
                    this._removeTypeMapping(key);
                }
                delete this.connections[socket.id];
            }
        });
    }

    /**
     * Returns true is message type is not on black list and if white list is populated is on white list
     * @param {string} type
     * @private
     */
    _isValidMessageType(type){
        if(this.options.blacklist && this.options.blacklist.includes(type))
            return false;

        // Return if not on white list?
        if(this.options.whitelist && !this.options.whitelist.includes(type))
            return false;

        return true;
    }

    /**
     * Remove type mapping from client if no more clients are interested in message
     * @param {string} type
     * @private
     */
    _removeTypeMapping(type){
        var isMapped = this._typeStillMapped(type);
        if(!isMapped){
            this.bus.removeHandler(type, this._emitMessage);
        }
    }

    /**
     * Finds if type is still mapped
     * @param {String} type
     * @return {boolean}
     * @private
     */
    _typeStillMapped(type){
        for (var connectionKey in this.connections){
            if (this.connections[connectionKey].handlers.includes(type)){
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
    _emitMessage(message, headers, type){
        let filters = this._getFiltersByType(type);

        for (let key in this.connections) {
            if(this.connections[key].handlers.includes(type)){
                let shouldProcess = filters.every(f => f(message, headers, type, this.connections[key].context));
                if (shouldProcess){
                    this.connections[key].socket.emit("handler-message", message, type);
                }
            }
        }
    }

    /**
     * Returns filters that match the type.
     * @param {string} type
     * @return {Array} filters
     * @private
     */
    _getFiltersByType(type) {
        var filters = [];
        if (this.options.filters) {
            for (let key in this.options.filters) {
                if (new RegExp(key).test(type)) {
                    filters.push(...this.options.filters[key]);
                }
            }
        }
        return filters;
    }
}