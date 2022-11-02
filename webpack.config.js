import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from "copy-webpack-plugin";
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
export const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('DIRNAME : ', __dirname)

const pages = {
    'index': { filename: 'index.html', title: 'ploufixes', entry: path.resolve(path.join(__dirname, '/src/client/index.js')) },
  //  'login': { filename: './login.html', title: 'ploufixes - login', entry: path.resolve(path.join(__dirname, '/src/client/user/login.js')) },
   // 'logout': { filename: './logout.html', title: 'ploufixes - logout', entry: path.resolve(path.join(__dirname, '/src/client/user/logout.js')) },
}
const config = {

    /*
        entry: {
          'index.js': path.resolve( path.join(__dirname, '/src/client/index.js')),
          'user/login.js' : path.resolve(path.join(__dirname, '/src/client/user/login.js'))
        },
        output: {
          path: path.resolve(path.join(__dirname, '/dist')),
          filename: '[name].js'
        },
      */
    entry: Object.fromEntries(Object.entries(pages).map(([name, { entry }]) => {
        return [name, entry]
    })),


    plugins: [
        ...Object.entries(pages).map(([name, page]) => {
            return new HtmlWebpackPlugin({
                title: page.title,
                hash: true,
                filename: page.filename,
                chunks: [name]
            })
        }),
        /*
        new HtmlWebpackPlugin({
            title: 'ploufixes',
            hash: true,
            filename: './index.html', //relative to root of the application,
            chunks: ['user/login.js']
        }),*/
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