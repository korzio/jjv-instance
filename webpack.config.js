module.exports = {
    context: __dirname + '/lib/',
    entry: ['./../scripts/testRunner.js'],
    // devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'jjv.js',
        sourceMapFilename: '[file].map'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json" }
        ]
    }
}