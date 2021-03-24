
const {merge} = require('webpack-merge');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = require('./webpack.common.js');

module.exports = (env = {}) => {

    return merge(commonConfig(env), {

        mode: 'production',

        // don't attempt to continue if there are any errors
        bail: true,

        optimization: {
            minimizer: [
                new TerserPlugin({
                    // do not extract comment to another file
                    extractComments: false,

                    // use multi-process parallel running to improve the build speed
                    parallel: true,

                    // reference: https://github.com/terser-js/terser#minify-options
                    terserOptions: {
                        output: {
                            // emoji and regex is not minified properly when false
                            // https://github.com/facebook/create-react-app/issues/2488
                            // eslint-disable-next-line fecs-camelcase
                            ascii_only: true,

                            // remove copyright comments, just to hide modules we use
                            comments: false
                        }
                    }
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorPluginOptions: {
                        preset: [
                            'default',
                            {
                                discardComments: {
                                    removeAll: true
                                }
                            }
                        ]
                    }
                })
            ]
        }
    });

};
