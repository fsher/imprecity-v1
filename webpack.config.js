const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'index': './Urban/static/js/index.js',
        'success': './Urban/static/js/success.js',
        'analytics': './Urban/static/js/analytics.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'Urban/static')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        plugins: [ require('babel-plugin-transform-object-rest-spread') ]
                    }
                }
            }
        ],
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress:{
        //         warnings: true
        //     }
        // })
    ]
};