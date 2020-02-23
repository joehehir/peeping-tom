const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// nuke dist directory
fs.rmdirSync(path.resolve(__dirname, '../dist'), { recursive: true });

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'peeping-tom.min.js',
        library: 'peepingTom',
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /\.js$/,
            use: [
                'babel-loader',
                'eslint-loader',
            ],
        }],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({}),
        ],
    },
};
