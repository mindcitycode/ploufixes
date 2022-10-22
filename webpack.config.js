import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from "copy-webpack-plugin";

const config = {
    entry: './src/client/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'ploufixes',
            hash: true,
            filename: './index.html', //relative to root of the application,
        }),
        new CopyPlugin({
            patterns: [
                { from: "assets", to: "assets" },
            ],
        }),
    ],
    devtool: "source-map",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        moduleIds: 'size'
    },
    watchOptions: {
        ignored: /\.#|node_modules|~$/,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    }
    /*
    resolve : {
        fallback : {
            "buffer" : false 
        }
    }*/
}

export default (env, args) => {
    if (args.mode === 'development') {
        delete config.optimization
    } else if (args.mode === 'production') {
        delete config.devtool
    }
    return config
}