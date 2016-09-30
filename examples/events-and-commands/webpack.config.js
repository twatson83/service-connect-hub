var path = require('path');
var webpack = require('webpack');

module.exports = {
 	devtool: 'source-map',
	entry: [
		'webpack-hot-middleware/client',
		'./examples/events-and-commands/client'
	],
    output: {
		path: path.join(__dirname, 'dist'),
	    filename: 'bundle.js',
	    publicPath: '/static/'
	},
	plugins: [
	    new webpack.optimize.OccurrenceOrderPlugin(),
	    new webpack.HotModuleReplacementPlugin()
    ],
  	module: {
    	loaders: [{
        	test: /\.js$/,
        	loaders: [ 'babel' ],
        	exclude: /node_modules/,
        	include: __dirname
      	}]
  	},
    debug: true
};