
const pathConst = require('./webpack.path');

// CONFIG
const PORT = 8300;

module.exports = {
    contentBase: pathConst.DIST,

    // stay the same with output.publicPath
    publicPath: pathConst.STATIC_FILE_URL_PREFIX,

    // disable gzip
    compress: false,

    port: PORT,
    host: '0.0.0.0',

    // local dev may use specific domain with hosts config
    disableHostCheck: true,

    // when using browser history or hash router, help visiting without publicPath
    historyApiFallback: {
        index: pathConst.STATIC_FILE_URL_PREFIX
    },

    hot: true,

    proxy: {

    }

};
