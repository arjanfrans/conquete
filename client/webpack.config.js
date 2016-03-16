'use strict';

const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    devtool: 'eval-source-map',
    include: [
        path.resolve(__dirname, 'src')
    ],
    output: {
        publicPath: '/dist/',
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-0', 'react']
                }
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

