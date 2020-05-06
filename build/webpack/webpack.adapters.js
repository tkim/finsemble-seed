const path = require("path");
const adaptersToBuild = require("./webpack.adapters.entries.json");

let entries = {};
for (let key in adaptersToBuild) {
	let component = adaptersToBuild[key];
	entries[component.output] = component.entry;
}

module.exports = {
    devtool: 'source-map',
    entry: entries,
    stats: "minimal",
    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                targets: {
                                    browsers: "Chrome 81"
                                },
                                modules: "commonjs"
                            }],
                            "@babel/preset-react"],
                        plugins: [
                            "@babel/plugin-proposal-class-properties"
                        ]
                    }
                }
            },
        ]
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "[name].map.js",
        path: path.resolve(__dirname, '../../dist/')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', 'scss', 'html']
    },
};