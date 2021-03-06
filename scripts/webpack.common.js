
const webpack = require('webpack');

const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const pathConst = require('./webpack.path');

const getRules = require('./webpack.getRules');

const getEnv = require('./webpack.env');

// use process.env instead of webpack env, to make browserslist environments in package.json work
const NODE_ENV = process.env.NODE_ENV;

module.exports = env => {

    const isDev = NODE_ENV === 'development';

    return {

        context: pathConst.PROJECT,

        entry: {
            app: [
                ...(isDev ? ['react-hot-loader/patch'] : []),
                pathConst.INDEX_JS
            ]
        },

        resolve: {
            alias: {
                src: pathConst.SOURCE
            },
            // CONFIG
            mainFiles: ['loadable', 'index', 'UI'],
            extensions: ['.ts', '.tsx', '.js', '.json'],
            plugins: [
                // ensure relative imports from app's source directories don't reach outside of it
                // prevents users from importing files from outside of src/
                new ModuleScopePlugin(pathConst.SOURCE, [pathConst.PACKAGE_JSON])
            ]
        },

        output: {
            path: pathConst.DIST,

            // static file prefix
            publicPath: pathConst.STATIC_FILE_URL_PREFIX,

            // in output html, js files' path will be output.publicPath + output.filename
            filename: pathConst.STATIC_PATH_NAME + '/' + (
                isDev ? '[name].js' : '[name].[hash:8].js'
            ),
            chunkFilename: pathConst.STATIC_PATH_NAME + '/' + (
                isDev ? '[name].chunk.js' : '[name].[hash:8].chunk.js'
            )
        },

        optimization: {
            splitChunks: {
                chunks: 'all'
            },

            // keep the runtime chunk seperated to enable long term caching
            // https://twitter.com/wSokra/status/969679223278505985
            // replace default ~ with -
            // https://github.com/facebook/create-react-app/issues/5358
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`
            }
        },

        module: {
            rules: getRules(isDev)
        },

        plugins: [

            // besides NODE_ENV in scripts, also need DefinePlugin to create global constants into source code
            new webpack.DefinePlugin(getEnv().stringified),

            new HtmlWebpackPlugin({
                template: pathConst.INDEX_HTML,
                inject: 'body',
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true
                }
            }),

            // inject variables into HTML
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
                IS_DEV: isDev
            }),

            // gives some necessary context to module not found errors, such as the requesting resource
            new ModuleNotFoundPlugin(pathConst.PROJECT),

            new MiniCssExtractPlugin({
                filename: pathConst.STATIC_PATH_NAME + '/' + (
                    isDev ? '[name].css' : '[name].[hash:8].css'
                ),
                chunkFilename: pathConst.STATIC_PATH_NAME + '/' + (
                    isDev ? '[name].chunk.css' : '[name].[hash:8].chunk.css'
                )
            }),

            // remove moment.js locale
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

            new ForkTsCheckerWebpackPlugin({
                async: isDev,
                typescript: {
                    configFile: pathConst.TSCONFIG
                }
            })

        ],

        // some libraries import Node modules but don't use them in the browser
        // tell Webpack to provide empty mocks for them so importing them works
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            // eslint-disable-next-line
            child_process: 'empty'
        }
    };

};
