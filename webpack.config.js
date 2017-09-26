const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry: "./src/PdfExport.js",
    output: {
        filename: "dist/PdfExport.min.js",
        libraryTarget: "umd"
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ["env", {
                            "targets": {
                                "browsers": ["chrome >= 38"]
                            }
                        }]
                    ]
                }
            }
        }]
    },
    // plugins: [
    //     new UglifyJSPlugin({
    //         exclude: /\.min\.js$/
    //     })
    // ]
};