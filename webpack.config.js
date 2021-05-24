const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");


module.exports = (env) => {
    const isProduction = env.production
    // if (isProduction) {
    //     config.optimization = {
    //         minimizer: [new TerserWebpackPlugin()],
    //     };
    //     config.mode = 'production'
    // } else {
    //     config.devServer = {
    //         port: 9000,
    //         open: true,
    //         hot: true,
    //         compress: true,
    //         stats: "errors-only",
    //         overlay: true,
    //     };
    // }

    return {
        mode: isProduction ? 'production' : 'development',
        bail: isProduction,
        devtool: isProduction
            ? isProduction
                ? false
                : 'source-map'
            : 'cheap-module-source-map',
        entry: path.join(__dirname, 'src', 'index.tsx'),
        output: {
            path: path.join(__dirname, 'build'),
            pathinfo: true,
            filename: isProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/bundle.js',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : 'static/js/[name].chunk.js',
            globalObject: 'this',
        },
        devServer: !isProduction && {
            port: 9000,
            open: true,
            hot: true,
            compress: true,
            stats: "errors-only",
            overlay: true,
            contentBase: path.join(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: ["ts-loader"],
                },
                {
                    test: /\.(css|scss)$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
                    use: ['file-loader'],
                },
            ],
        },
        optimization: isProduction && {
            minimize: isProduction,
            minimizer: [
                new TerserWebpackPlugin({
                    terserOptions: {
                        parse: {
                           ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            // Disabled because of an issue with Uglify breaking seemingly valid code:
                            // https://github.com/facebook/create-react-app/issues/2376
                            // Pending further investigation:
                            // https://github.com/mishoo/UglifyJS2/issues/2011
                            comparisons: false,
                            // Disabled because of an issue with Terser breaking valid code:
                            // https://github.com/facebook/create-react-app/issues/5250
                            // Pending further investigation:
                            // https://github.com/terser-js/terser/issues/120
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        // Added for profiling in devtools
                        keep_classnames: !isProduction,
                        keep_fnames: !isProduction,
                        output: {
                            ecma: 5,
                            comments: false,
                            // Turned on because emoji and regex is not minified properly using default
                            // https://github.com/facebook/create-react-app/issues/2488
                            ascii_only: true,
                        },
                    },
                    sourceMap: true,
                }),
            ],
            splitChunks: {
                chunks: 'all',
                name: !isProduction,
            },
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`,
            },
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: 'body',
                        scriptLoading: 'blocking',
                        template: path.join(__dirname, 'public', 'index.html'),
                    },
                    isProduction
                        ? {
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
                                minifyURLs: true,
                            },
                        }
                        : undefined
                )
            ),
        ]
    };
};