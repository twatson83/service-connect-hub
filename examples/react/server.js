var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var express = require("express");
var http = require("http");
var config = require('./webpack.config');
var ServiceConnectHub = require('../../lib/server').ServiceConnectHub;

var app = express(), server = http.createServer(app);

var compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(2999);

var hub = new ServiceConnectHub({
    bus: {
        amqpSettings: {
            queue: { name: 'ServiceConnectWeb.ReactExample' },
            host: "amqp://localhost"
        }
    }
});

hub.init(server);