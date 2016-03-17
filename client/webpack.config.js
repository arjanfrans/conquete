'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        path.resolve(__dirname, 'src/index.js'),
    ],
    devtool: 'eval-cheap-module-source-map',
    include: [
        path.resolve(__dirname, 'src')
    ],
    output: {
        publicPath: '/dist/',
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0'],
                exclude: /node_modules/
            },
            {
                test: /\.css?$/,
                loaders: [ 'style', 'css' ]
            },
            {
                test: /\.json?$/,
                loaders: ['json']
            }
        ]
    }
};

