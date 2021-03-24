
const path = require('path');

// project root path
const PROJECT_PATH = path.resolve(__dirname, '../');

const getPath = relativePathInProject => {
    return path.resolve(PROJECT_PATH, relativePathInProject);
};

// CONFIG
module.exports = {
    STATIC_PATH_NAME: 'static',

    // AKA publicPath
    STATIC_FILE_URL_PREFIX: '/',
    PROJECT: getPath('./'),
    SOURCE: getPath('./src'),
    INDEX_JS: getPath('./src/index'),
    DIST: getPath('./dist'),
    INDEX_HTML: getPath('./public/index.html'),
    NODE_MODULES: getPath('./node_modules'),
    PACKAGE_JSON: getPath('./package.json'),
    TSCONFIG: getPath('./tsconfig.json')
};
