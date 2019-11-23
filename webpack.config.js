const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {WebpackPluginServe} = require('webpack-plugin-serve')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const SriPlugin = require('webpack-subresource-integrity')
const path = require('path')

const pkg = require('./package.json')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'

const htmlMinifyOptions = {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    decodeEntities: true,
    html5: true,
    keepClosingSlash: false,
    processConditionalComments: true,
    removeEmptyAttributes: true
}

// Entry points
const entry = {
    calendarNext: [path.resolve(__dirname, 'src/main.js')],
}
if (!prod) {
    // Required for webpack-plugin-serve (dev-only)
    entry.webpackServe = 'webpack-plugin-serve/client'
}

module.exports = {
    entry,
    resolve: {
        mainFields: ['svelte', 'browser', 'module', 'main'],
        extensions: ['.mjs', '.js', '.svelte']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:8].js',
        chunkFilename: '[name].[contenthash:8].js',
        crossOriginLoading: 'anonymous'
    },
    module: {
        rules: [
            {
                test: /\.(svelte)$/,
                exclude: [],
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    mode,
    plugins: [
        // Serve
        new WebpackPluginServe({
            static: 'dist',
            host: '0.0.0.0',
            port: 3000
        }),

        // Cleanup dist folder
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['**/*', '!assets', '!assets/*']
        }),

        // Minify all extracted CSS
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css'
        }),

        // Supports reading the .env file
        new Dotenv(),

        // Definitions
        new webpack.DefinePlugin({
            PRODUCTION: prod,
            PKG_NAME: JSON.stringify(pkg.name),
            PKG_VERSION: JSON.stringify(pkg.version)
        }),

        // Generate the index.html file
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, 'src/main.html'),
            chunks: ['calendarNext'],
            minify: prod ? htmlMinifyOptions : false
        }),

        // Enable subresource integrity check
        new SriPlugin({
            hashFuncNames: ['sha384'],
            enabled: prod,
        })
    ],
    watch: !prod,
    devtool: prod ? false : 'source-map'
}
