
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const devServerConfig = require('./webpack.devServer.js');

const pathConst = require('./webpack.path.js');


module.exports = (env = {}) => {

    return merge(commonConfig(env), {

        mode: 'development',

        devtool: 'cheap-module-eval-source-map',

        resolve: {
            alias: {
                'react-dom': '@hot-loader/react-dom'
            }
        },

        output: {
            // include comments in bundles with information about the contained modules
            pathinfo: true
        },

        plugins: [
            // new BundleAnalyzerPlugin(),

            // prevent OSX path insensitive typo, whick will lead into error when compile on linux
            new CaseSensitivePathsPlugin(),

            // ensure `npm install` forces project rebuild
            // do not have to restart dev server when `npm install` a new module
            new WatchMissingNodeModulesPlugin(pathConst.NODE_MODULES),

            // add in plugins manually instead of using webpack-dev-server CLI --hot
            new webpack.HotModuleReplacementPlugin()
        ],

        devServer: devServerConfig

    });

};
