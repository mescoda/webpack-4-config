
const path = require('path');

const loaderUtils = require('loader-utils');

const pathConst = require('./webpack.path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const getStyleLoaders = (isDev, cssLoaderOptions = {}, preLoader) => {

    const loaders = [
        // style-loader makes HMR possable, MiniCssExtractPlugin does not
        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

        {
            loader: 'css-loader',
            options: Object.assign({
                sourceMap: isDev
            }, cssLoaderOptions)
        },

        {
            loader: 'postcss-loader',
            options: {
                // necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                // https://github.com/postcss/postcss-loader#plugins
                ident: 'postcss',
                plugins: () => {
                    return [
                        require('postcss-flexbugs-fixes'),

                        // default stage:2 https://preset-env.cssdb.org/features#stage-2
                        require('postcss-preset-env')({
                            autoprefixer: {
                                // add prefixes only for final and IE versions of specification
                                flexbox: 'no-2009'
                            }
                        })
                    ];
                }
            }
        }
    ];

    if (preLoader) {
        loaders.push(preLoader);
    }

    return loaders;
};


const getLocalIdentFn = isDev => {
    return (
        context,
        localIdentName,
        localName,
        options
    ) => {
        // get shorter and nicer className
        const className = context.context

            // remove root context
            .replace(context.rootContext, '')

            // remove src
            .replace('/src/', '')
            .replace(/\//g, '-')
            + '_'
            + localName;
        const hash = loaderUtils.getHashDigest(
            className,
            'md5',
            'base64',
            8
        );

        const isUseHashClassNameInProd = false;

        return isDev
            ? className
            : (
                isUseHashClassNameInProd
                    ? hash
                    : className
            );

    };

};



const getBabelConfig = isDev => {
    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    // with debug on, webpack will log some 「[.js] `import '@babel/polyfill'` was not found」
                    // which are not errors
                    debug: isDev,

                    // replace @babel/polyfill with individual requires for @babel/polyfill based on browserslist
                    useBuiltIns: 'entry',

                    // do not transform modules to CJS
                    modules: false,

                    // exclude transforms that make all code slower
                    exclude: ['transform-typeof-symbol']
                }
            ],
            [
                '@babel/preset-react',
                {
                    // add component stack to warning messages
                    // add __self attribute to JSX which React will use for some warnings
                    // in dev env
                    development: isDev,

                    // use native built-in instead of trying to polyfill
                    useBuiltIns: true
                }
            ]
        ],
        plugins: [

            // plugin-proposal-object-rest-spread doesn't transform the rest/spread syntax in some cases
            // https://github.com/babel/babel/issues/7215
            '@babel/plugin-transform-destructuring',

            // bound
            [
                '@babel/plugin-proposal-class-properties',
                {
                    // enable loose mode to use assignment instead of defineProperty
                    // https://github.com/facebook/create-react-app/issues/4263
                    loose: true
                }
            ],

            [
                '@babel/plugin-proposal-object-rest-spread',
                {
                    // Use native build-in: `Object.assign`, which provides by @babel/polyfill
                    useBuiltIns: true
                }
            ],

            '@babel/plugin-transform-async-to-generator',

            !isDev && [
                'babel-plugin-transform-react-remove-prop-types',
                {
                    // remove the import statements as well
                    removeImport: true
                }
            ],

            // antd dynamic import
            [
                'babel-plugin-import',
                {
                    'libraryName': 'antd',
                    'libraryDirectory': 'es',

                    // `style: true` will load less file
                    'style': 'css'
                }
            ],

            // support dynamic import()
            // https://reacttraining.com/react-router/web/guides/code-splitting
            '@babel/plugin-syntax-dynamic-import',

            // make all the babel helpers function for example `createClass`
            // reference to the module @babel/runtime to avoid duplicate declaration across all files need help
            [
                '@babel/plugin-transform-runtime',
                {
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: false,

                    // undocumented option that lets us encapsulate our runtime, ensuring the correct version is used
                    // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
                    absoluteRuntime: path.dirname(
                        require.resolve('@babel/runtime/package.json')
                    )
                }
            ],

            // transform dynamic import to require in dev to save build time
            isDev && 'babel-plugin-dynamic-import-node',

            isDev && 'react-hot-loader/babel'

        // filter to remove undefined
        ].filter(Boolean),

        // enable cache
        // cache results in ./node_modules/.cache/babel-loader/
        cacheDirectory: true,

        // disable gzip in dev to save time
        cacheCompression: !isDev
    };
};

const getBabelConfigForDep = isDev => {
    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    debug: isDev,

                    useBuiltIns: false,

                    // do not transform modules to CJS
                    modules: false,

                    // exclude transforms that make all code slower
                    exclude: ['transform-typeof-symbol']
                }
            ]
        ],
        plugins: [
            // make all the babel helpers function for example `createClass`
            // reference to the module @babel/runtime to avoid duplicate declaration across all files need help
            [
                '@babel/plugin-transform-runtime',
                {
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: false,

                    // undocumented option that lets us encapsulate our runtime, ensuring the correct version is used
                    // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
                    absoluteRuntime: path.dirname(
                        require.resolve('@babel/runtime/package.json')
                    )
                }
            ]
        ],
        cacheDirectory: true,
        cacheCompression: !isDev,

        // if an error happens in a package, it's possible to be
        // because it was compiled. Thus, we don't want the browser
        // debugger to show the original code. Instead, the code
        // being evaluated would be much more helpful.
        sourceMaps: false
    };
};


module.exports = isDev => {

    return [
        {
            parser: {
                // disable require.ensure as it's not a standard language feature
                requireEnsure: false
            }
        },

        // TODO: eslint

        {
            // use `oneOf` to traverse all following loaders until one matches
            // if none matches, fallback to file-loading in the end
            oneOf: [
                {
                    test: /\.(jpe?g|png|gif|bmp|ico|svg|eot|ttf|woff2?)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            outputPath: pathConst.STATIC_PATH_NAME,

                            // remove `src` from path
                            regExp: /(\/src)([^.]+)/,
                            name(file) {
                                if (isDev) {
                                    return '[2].[ext]';
                                }
                                return '[2].[hash:8].[ext]';
                            }
                        }
                    }
                },
                {
                    test: /\.css$/,
                    exclude: /\.module\.css$/,
                    use: getStyleLoaders(isDev, {
                        importLoaders: 1
                    })
                },
                {
                    test: /\.module\.css$/,
                    use: getStyleLoaders(isDev, {
                        importLoaders: 1,

                        // css modules
                        modules: true,
                        getLocalIdent: getLocalIdentFn(isDev)
                    })
                },
                {
                    test: /\.less$/,
                    exclude: /\.module\.less$/,
                    use: getStyleLoaders(
                        isDev,
                        {
                            importLoaders: 2
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: isDev
                            }
                        }
                    )
                },
                {
                    test: /\.module\.less$/,
                    use: getStyleLoaders(
                        isDev,
                        {
                            importLoaders: 2,

                            // css modules
                            modules: true,
                            getLocalIdent: getLocalIdentFn(isDev)
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: isDev
                            }
                        }
                    )
                },
                {
                    test: /\.js$/,
                    include: pathConst.SOURCE,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: getBabelConfig(isDev)
                        }
                    ]
                },

                // do not think it's necessary
                /*{
                    test: /\.(js|mjs)$/,
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: getBabelConfigForDep(isDev)
                        }
                    ]
                },*/
                {
                    exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                    use: {
                        loader: 'file-loader',
                        options: {
                            outputPath: pathConst.STATIC_PATH_NAME,

                            // remove `src` from path
                            regExp: /(\/src)([^.]+)/,
                            name(file) {
                                if (isDev) {
                                    return '[2].[ext]';
                                }
                                return '[2].[hash:8].[ext]';
                            }
                        }
                    }
                }
            ]
        }
    ];
};
