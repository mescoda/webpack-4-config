
const pathConst = require('./webpack.path');

// CONFIG
const PORT = 8300;

module.exports = {
    contentBase: pathConst.DIST,

    // disable gzip
    compress: false,

    port: PORT,
    host: '0.0.0.0',

    // local dev may use specific domain with hosts config
    disableHostCheck: true,

    // support browserhistory
    historyApiFallback: {
        index: '/'
    },

    hot: true,

    proxy: {

    }

};
